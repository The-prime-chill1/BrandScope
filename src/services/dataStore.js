import { isSupabaseConfigured, requireSupabase, supabase } from '../lib/supabase';
import { uploadPublicMedia, uploadVerificationDocument } from './media';

export const DEFAULT_CATEGORIES = [
  ['Technology', 'technology', 'Software, hardware, digital products, and technology services.'],
  ['Fashion & Apparel', 'fashion-and-apparel', 'Clothing, footwear, accessories, textiles, and fashion labels.'],
  ['Food & Beverage', 'food-and-beverage', 'Food producers, restaurants, packaged goods, and beverage brands.'],
  ['Beauty & Personal Care', 'beauty-and-personal-care', 'Skincare, cosmetics, grooming, wellness, and personal care.'],
  ['Real Estate', 'real-estate', 'Property development, brokerage, facilities, and built-environment services.'],
  ['Finance & Professional Services', 'finance-and-professional-services', 'Financial, legal, consulting, accounting, and business services.'],
  ['Health & Wellness', 'health-and-wellness', 'Healthcare, fitness, wellness, medical, and pharmaceutical brands.'],
  ['Education & Training', 'education-and-training', 'Schools, learning platforms, training providers, and education products.'],
  ['Media & Entertainment', 'media-and-entertainment', 'Publishing, film, music, events, creators, and entertainment businesses.'],
  ['Travel & Hospitality', 'travel-and-hospitality', 'Hotels, tourism, travel services, experiences, and hospitality brands.'],
  ['Retail & E-commerce', 'retail-and-ecommerce', 'Retailers, online stores, marketplaces, and consumer commerce brands.'],
  ['Logistics & Transportation', 'logistics-and-transportation', 'Delivery, freight, mobility, warehousing, and transport services.'],
  ['Other Businesses', 'other-businesses', 'Commercial brands and services that do not fit another category.']
].map(([name, slug, description], index) => ({
  id: `category-${slug}`,
  name,
  slug,
  description,
  sortOrder: (index + 1) * 10,
  brandCount: 0
}));

function assertResult(result, label) {
  if (result.error) {
    const error = new Error(result.error.message || `Could not load ${label}.`);
    error.code = result.error.code;
    throw error;
  }
  return result.data || [];
}

function isMissingRelation(result, relationName) {
  const message = result?.error?.message || '';
  return Boolean(result?.error) && (
    result.error.code === 'PGRST205'
    || result.error.code === '42P01'
    || message.includes(`'public.${relationName}'`)
  );
}

function asNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeBrandType(value) {
  return value === 'enterprise' ? 'corporate' : value || 'small';
}

function mapProduct(row) {
  return {
    id: row.id,
    brandId: row.brand_id,
    title: row.title,
    description: row.description || '',
    price: asNumber(row.price),
    currency: row.currency || 'USD',
    availability: row.availability || 'in_stock',
    inStock: row.availability !== 'out_of_stock',
    leadTime: row.lead_time || '',
    badge: row.label || '',
    specifications: row.specifications || {},
    imageUrl: row.image_url || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapNotification(row) {
  return {
    id: row.id,
    recipientUid: row.recipient_id,
    actorUid: row.actor_id,
    type: row.type,
    message: row.message,
    link: row.link || '',
    read: row.is_read,
    createdAt: row.created_at
  };
}

function mergeBrandRecord(brand, row, categories) {
  if (!brand || !row) return brand;
  const category = categories.find((item) => item.slug === row.category_slug);
  Object.assign(brand, {
    ownerUid: row.owner_id,
    name: row.name,
    slug: row.slug,
    brandType: row.brand_type,
    category: category?.name || row.category_slug,
    categorySlug: row.category_slug,
    country: row.country || '',
    city: row.city || '',
    whatsapp: row.whatsapp || '',
    whatsappNumber: row.whatsapp || '',
    phone: row.phone || '',
    contactEmail: row.contact_email || '',
    website: row.website || '',
    address: row.address || '',
    deliveryInfo: row.delivery_info || '',
    responseSpeed: row.response_speed || '',
    shortDescription: row.short_description || '',
    fullDescription: row.full_description || '',
    logoUrl: row.logo_url || '',
    coverUrl: row.cover_url || '',
    cacNumber: row.registration_number || '',
    registrationNumber: row.registration_number || '',
    verificationStatus: row.verification_status || 'unverified',
    status: row.status || 'active',
    socials: row.socials || {},
    updatedAt: row.updated_at
  });
  return brand;
}

class SupabaseDataStore {
  constructor() {
    this.listeners = new Set();
    this.version = 0;
    this.initialized = false;
    this.loading = false;
    this.publicRefreshPromise = null;
    this.privateRefreshPromise = null;
    this.privateRefreshUserId = '';
    this.privateRefreshToken = 0;
    this.privateLoadedAt = 0;
    this.ownedBrandRefreshes = new Map();
    this.connectionError = '';
    this.categories = [...DEFAULT_CATEGORIES];
    this.brands = [];
    this.posts = [];
    this.comments = [];
    this.followers = {};
    this.likes = {};
    this.notifications = [];
    this.reports = [];
    this.verificationRequests = [];
    this.auditLogs = [];
    this.supportInquiries = [];
    this.profile = null;
  }

  async initialize() {
    if (this.initialized) return;
    if (this.loading) return this.publicRefreshPromise;
    this.loading = true;
    this.notify();

    if (!isSupabaseConfigured) {
      this.initialized = true;
      this.loading = false;
      this.connectionError = 'Supabase environment variables are missing.';
      this.notify();
      return;
    }

    try {
      await this.refreshPublicData();
      this.connectionError = '';
    } catch (error) {
      this.connectionError = error.message || 'Could not connect to the BRANDSCOPE database.';
      console.warn('[BRANDSCOPE] Supabase data is not ready yet:', error);
    } finally {
      this.initialized = true;
      this.loading = false;
      this.notify();
    }
  }

  async refreshPublicData() {
    if (this.publicRefreshPromise) return this.publicRefreshPromise;
    this.publicRefreshPromise = this.performPublicDataRefresh();
    try {
      return await this.publicRefreshPromise;
    } finally {
      this.publicRefreshPromise = null;
    }
  }

  async performPublicDataRefresh() {
    const client = requireSupabase();
    const [categoryResult, brandResult, productResult, postResult, commentResult, followResult, likeResult] = await Promise.all([
      client.from('categories').select('*').order('sort_order', { ascending: true }),
      client.from('brands').select('*').order('created_at', { ascending: false }),
      client.from('products').select('*').order('created_at', { ascending: false }),
      client.from('posts').select('*').order('created_at', { ascending: false }).limit(250),
      client.from('comments').select('*').order('created_at', { ascending: true }).limit(1000),
      client.from('follows').select('brand_id,follower_id,created_at').limit(1000),
      client.from('post_likes').select('post_id,user_id,created_at').limit(1000)
    ]);

    const categoryRows = assertResult(categoryResult, 'categories');
    const brandRows = assertResult(brandResult, 'brands');
    const productRows = assertResult(productResult, 'products');
    const postRows = assertResult(postResult, 'posts');
    const commentRows = assertResult(commentResult, 'comments');
    const followRows = assertResult(followResult, 'follows');
    const likeRows = assertResult(likeResult, 'post likes');

    this.followers = followRows.reduce((groups, row) => {
      if (!groups[row.brand_id]) groups[row.brand_id] = [];
      groups[row.brand_id].push(row.follower_id);
      return groups;
    }, {});

    this.likes = likeRows.reduce((groups, row) => {
      if (!groups[row.post_id]) groups[row.post_id] = [];
      groups[row.post_id].push(row.user_id);
      return groups;
    }, {});

    const productsByBrand = productRows.reduce((groups, row) => {
      if (!groups[row.brand_id]) groups[row.brand_id] = [];
      groups[row.brand_id].push(mapProduct(row));
      return groups;
    }, {});

    const postCountByBrand = postRows.reduce((counts, row) => {
      if (row.status === 'published') counts[row.brand_id] = (counts[row.brand_id] || 0) + 1;
      return counts;
    }, {});

    const categoryNames = new Map(categoryRows.map((row) => [row.slug, row.name]));
    this.brands = brandRows.map((row) => ({
      id: row.id,
      ownerUid: row.owner_id,
      name: row.name,
      slug: row.slug,
      brandType: row.brand_type,
      category: categoryNames.get(row.category_slug) || row.category_slug,
      categorySlug: row.category_slug,
      country: row.country || '',
      city: row.city || '',
      whatsapp: row.whatsapp || '',
      whatsappNumber: row.whatsapp || '',
      phone: row.phone || '',
      contactEmail: row.contact_email || '',
      website: row.website || '',
      address: row.address || '',
      deliveryInfo: row.delivery_info || '',
      responseSpeed: row.response_speed || '',
      shortDescription: row.short_description || '',
      fullDescription: row.full_description || '',
      logoUrl: row.logo_url || '',
      coverUrl: row.cover_url || '',
      cacNumber: row.registration_number || '',
      registrationNumber: row.registration_number || '',
      verificationStatus: row.verification_status || 'unverified',
      status: row.status || 'active',
      socials: row.socials || {},
      followerCount: (this.followers[row.id] || []).length,
      postCount: postCountByBrand[row.id] || 0,
      products: productsByBrand[row.id] || [],
      joinedDate: row.created_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    const brandById = new Map(this.brands.map((brand) => [brand.id, brand]));
    const commentCountByPost = commentRows.reduce((counts, row) => {
      if (row.moderation_status === 'approved') counts[row.post_id] = (counts[row.post_id] || 0) + 1;
      return counts;
    }, {});

    this.posts = postRows.map((row) => {
      const brand = brandById.get(row.brand_id);
      return {
        id: row.id,
        brandId: row.brand_id,
        brandName: brand?.name || 'Brand',
        brandSlug: brand?.slug || '',
        brandLogo: brand?.logoUrl || '',
        isVerified: brand?.verificationStatus === 'verified',
        text: row.content,
        imageUrl: row.image_url || '',
        link: row.link_url || '',
        likeCount: (this.likes[row.id] || []).length,
        commentCount: commentCountByPost[row.id] || 0,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        status: row.status,
        visibility: 'public'
      };
    });

    this.comments = commentRows.map((row) => {
      const authorBrand = brandById.get(row.author_brand_id);
      return {
        id: row.id,
        postId: row.post_id,
        authorUid: row.author_id,
        authorBrandId: row.author_brand_id,
        authorName: authorBrand?.name || 'Brand member',
        authorBrandSlug: authorBrand?.slug || '',
        authorLogo: authorBrand?.logoUrl || '',
        content: row.content,
        moderationStatus: row.moderation_status,
        createdAt: row.created_at
      };
    });

    const brandCountByCategory = this.brands.reduce((counts, brand) => {
      if (brand.status === 'active') counts[brand.categorySlug] = (counts[brand.categorySlug] || 0) + 1;
      return counts;
    }, {});

    const sourceCategories = categoryRows.length ? categoryRows : DEFAULT_CATEGORIES;
    this.categories = sourceCategories.map((row, index) => ({
      id: row.id || `category-${row.slug}`,
      name: row.name,
      slug: row.slug,
      description: row.description || '',
      sortOrder: row.sort_order ?? row.sortOrder ?? index,
      brandCount: brandCountByCategory[row.slug] || 0
    }));

    this.connectionError = '';
    this.notify();
  }

  async refreshPrivateData(user, { force = false } = {}) {
    if (!user || !isSupabaseConfigured) {
      this.privateRefreshToken += 1;
      this.privateRefreshPromise = null;
      this.privateRefreshUserId = '';
      this.privateLoadedAt = 0;
      this.profile = null;
      this.notifications = [];
      this.reports = [];
      this.verificationRequests = [];
      this.auditLogs = [];
      this.supportInquiries = [];
      this.notify();
      return;
    }

    if (this.privateRefreshPromise && this.privateRefreshUserId === user.uid) {
      return this.privateRefreshPromise;
    }
    if (!force && this.privateRefreshUserId === user.uid && Date.now() - this.privateLoadedAt < 5000) {
      return;
    }

    const requestToken = ++this.privateRefreshToken;
    const previousUserId = this.privateRefreshUserId;
    this.privateRefreshUserId = user.uid;
    if (previousUserId && previousUserId !== user.uid) {
      this.notifications = [];
      this.reports = [];
      this.verificationRequests = [];
      this.auditLogs = [];
      this.supportInquiries = [];
    }

    const refreshPromise = this.performPrivateDataRefresh(user, requestToken);
    this.privateRefreshPromise = refreshPromise;
    try {
      return await refreshPromise;
    } finally {
      if (this.privateRefreshPromise === refreshPromise) this.privateRefreshPromise = null;
    }
  }

  async performPrivateDataRefresh(user, requestToken) {
    const client = requireSupabase();
    const notificationQuery = client
      .from('notifications')
      .select('*')
      .eq('recipient_id', user.uid)
      .order('created_at', { ascending: false })
      .limit(100);

    if (user.role === 'admin') {
      const [notificationResult, reportResult, verificationResult, auditResult, supportResult] = await Promise.all([
        notificationQuery,
        client.from('reports').select('*').order('created_at', { ascending: false }).limit(250),
        client.from('verification_requests').select('*').order('created_at', { ascending: false }).limit(250),
        client.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(250),
        client.from('support_inquiries').select('*').order('created_at', { ascending: false }).limit(500)
      ]);
      if (requestToken !== this.privateRefreshToken) return;
      this.notifications = assertResult(notificationResult, 'notifications').map(mapNotification);
      this.reports = assertResult(reportResult, 'reports').map((row) => this.mapReport(row));
      this.verificationRequests = assertResult(verificationResult, 'verification requests').map((row) => this.mapVerificationRequest(row));
      this.auditLogs = assertResult(auditResult, 'audit logs').map((row) => this.mapAuditLog(row));
      this.supportInquiries = isMissingRelation(supportResult, 'support_inquiries')
        ? []
        : assertResult(supportResult, 'support inquiries').map((row) => this.mapSupportInquiry(row));
    } else {
      const [notificationResult, verificationResult] = await Promise.all([
        notificationQuery,
        client
          .from('verification_requests')
          .select('*')
          .eq('submitted_by', user.uid)
          .order('created_at', { ascending: false })
      ]);
      if (requestToken !== this.privateRefreshToken) return;
      this.notifications = assertResult(notificationResult, 'notifications').map(mapNotification);
      this.verificationRequests = assertResult(verificationResult, 'verification requests').map((row) => this.mapVerificationRequest(row));
      this.reports = [];
      this.auditLogs = [];
      this.supportInquiries = [];
    }

    this.profile = { id: user.uid, role: user.role, contact_name: user.name || '' };
    this.privateLoadedAt = Date.now();
    this.notify();
  }

  async refreshAll(user = null) {
    await this.refreshPublicData();
    await this.refreshPrivateData(user);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.version += 1;
    this.listeners.forEach((listener) => listener(this));
  }

  subscribeToNotifications(user, onNotification) {
    if (!user?.uid || !isSupabaseConfigured) return () => {};
    const client = requireSupabase();
    const channel = client
      .channel(`notifications:${user.uid}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.uid}`
        },
        (payload) => {
          const notification = mapNotification(payload.new);
          if (!this.notifications.some((item) => item.id === notification.id)) {
            this.notifications = [notification, ...this.notifications];
            this.notify();
          }
          onNotification?.(notification);

          if (user.role === 'admin' && ['/admin/brands', '/admin/inquiries', '/admin/reports'].includes(notification.link)) {
            void this.refreshPrivateData(user, { force: true }).catch((error) => {
              console.warn('[BRANDSCOPE] Live admin queue refresh failed:', error);
            });
          }
        }
      )
      .subscribe();

    return () => { void client.removeChannel(channel); };
  }

  getBrands({ category, country, search, limit = 50 } = {}) {
    let list = this.brands.filter((brand) => brand.status === 'active');

    if (category) {
      const normalized = category.toLowerCase();
      list = list.filter((brand) =>
        brand.categorySlug?.toLowerCase() === normalized || brand.category?.toLowerCase() === normalized
      );
    }
    if (country) list = list.filter((brand) => brand.country?.toLowerCase() === country.toLowerCase());
    if (search?.trim()) {
      const query = search.trim().toLowerCase();
      list = list.filter((brand) => [
        brand.name,
        brand.shortDescription,
        brand.category,
        brand.city,
        brand.country,
        ...brand.products.map((product) => product.title)
      ].some((value) => value?.toLowerCase().includes(query)));
    }

    return [...list]
      .sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate))
      .slice(0, limit);
  }

  getBrandBySlug(slug) {
    return this.brands.find((brand) => brand.slug?.toLowerCase() === slug?.toLowerCase()) || null;
  }

  getBrandById(id) {
    return this.brands.find((brand) => brand.id === id) || null;
  }

  getBrandByOwnerUid(uid) {
    return this.brands.find((brand) => brand.ownerUid === uid) || null;
  }

  async refreshOwnedBrand(userId) {
    if (this.ownedBrandRefreshes.has(userId)) return this.ownedBrandRefreshes.get(userId);
    const refreshPromise = (async () => {
      const client = requireSupabase();
      const result = await client.from('brands').select('*').eq('owner_id', userId).maybeSingle();
      if (result.error) throw result.error;
      if (!result.data) return null;

      let brand = this.getBrandByOwnerUid(userId);
      if (!brand) {
        brand = {
          id: result.data.id,
          products: [],
          followerCount: 0,
          postCount: 0,
          joinedDate: result.data.created_at,
          createdAt: result.data.created_at
        };
        this.brands = [brand, ...this.brands];
      }
      mergeBrandRecord(brand, result.data, this.categories);
      this.notify();
      return brand;
    })();
    this.ownedBrandRefreshes.set(userId, refreshPromise);
    try {
      return await refreshPromise;
    } finally {
      this.ownedBrandRefreshes.delete(userId);
    }
  }

  getProductById(productId) {
    for (const brand of this.brands) {
      const product = brand.products.find((item) => item.id === productId);
      if (product) return { product, brand };
    }
    return null;
  }

  async createBrand(brandData, user) {
    const client = requireSupabase();
    const payload = {
      owner_id: user.uid,
      name: brandData.name.trim(),
      slug: brandData.slug.trim().toLowerCase(),
      brand_type: normalizeBrandType(brandData.brandType),
      category_slug: brandData.categorySlug || 'other-businesses',
      country: brandData.country || 'Nigeria',
      city: brandData.city || '',
      whatsapp: brandData.whatsapp || '',
      phone: brandData.phone || '',
      contact_email: brandData.contactEmail || '',
      website: brandData.website || '',
      short_description: brandData.shortDescription || '',
      registration_number: brandData.cacNumber || ''
    };
    const result = await client.from('brands').insert(payload).select('*').single();
    if (result.error) throw result.error;
    await this.refreshPublicData();
    return this.getBrandById(result.data.id);
  }

  async updateBrand(brandId, updates, actorUid) {
    const brand = this.getBrandById(brandId);
    if (!brand) throw new Error('Brand not found.');
    const userId = actorUid || brand.ownerUid;

    const [logoUrl, coverUrl] = await Promise.all([
      Object.hasOwn(updates, 'logoUrl')
        ? uploadPublicMedia(updates.logoUrl, { userId, folder: 'logos' })
        : Promise.resolve(undefined),
      Object.hasOwn(updates, 'coverUrl')
        ? uploadPublicMedia(updates.coverUrl, { userId, folder: 'covers' })
        : Promise.resolve(undefined)
    ]);

    const mapping = {
      name: 'name',
      slug: 'slug',
      brandType: 'brand_type',
      categorySlug: 'category_slug',
      country: 'country',
      city: 'city',
      whatsapp: 'whatsapp',
      phone: 'phone',
      contactEmail: 'contact_email',
      website: 'website',
      address: 'address',
      deliveryInfo: 'delivery_info',
      responseSpeed: 'response_speed',
      shortDescription: 'short_description',
      fullDescription: 'full_description',
      cacNumber: 'registration_number',
      registrationNumber: 'registration_number',
      socials: 'socials'
    };
    const payload = {};
    Object.entries(mapping).forEach(([clientKey, dbKey]) => {
      if (Object.hasOwn(updates, clientKey)) payload[dbKey] = updates[clientKey];
    });
    if (logoUrl !== undefined) payload.logo_url = logoUrl;
    if (coverUrl !== undefined) payload.cover_url = coverUrl;
    if (payload.brand_type) payload.brand_type = normalizeBrandType(payload.brand_type);

    const client = requireSupabase();
    const result = await client.from('brands').update(payload).eq('id', brandId).select('*').single();
    if (result.error) throw result.error;
    mergeBrandRecord(brand, result.data, this.categories);
    this.notify();
    return brand;
  }

  async createProduct(brandId, productData, userId) {
    const imageUrl = await uploadPublicMedia(productData.imageUrl, { userId, folder: 'products' });
    const client = requireSupabase();
    const result = await client.from('products').insert({
      brand_id: brandId,
      title: productData.title.trim(),
      description: productData.description || '',
      price: asNumber(productData.price),
      currency: 'USD',
      availability: productData.availability || (productData.inStock === false ? 'out_of_stock' : 'in_stock'),
      lead_time: productData.leadTime || '',
      label: productData.badge || '',
      specifications: productData.specifications || {},
      image_url: imageUrl || ''
    }).select('*').single();
    if (result.error) throw result.error;
    const product = mapProduct(result.data);
    const brand = this.getBrandById(brandId);
    if (brand) brand.products = [product, ...brand.products];
    this.notify();
    return product;
  }

  async updateProduct(productId, productData, userId) {
    const existing = this.brands.flatMap((brand) => brand.products).find((product) => product.id === productId);
    if (!existing) throw new Error('Product not found.');
    const imageUrl = Object.hasOwn(productData, 'imageUrl')
      ? await uploadPublicMedia(productData.imageUrl, { userId, folder: 'products' })
      : existing.imageUrl;
    const client = requireSupabase();
    const result = await client.from('products').update({
      title: productData.title?.trim() || existing.title,
      description: productData.description ?? existing.description,
      price: Object.hasOwn(productData, 'price') ? asNumber(productData.price) : existing.price,
      availability: productData.availability || (productData.inStock === false ? 'out_of_stock' : 'in_stock'),
      lead_time: productData.leadTime ?? existing.leadTime,
      label: productData.badge ?? existing.badge,
      specifications: productData.specifications ?? existing.specifications,
      image_url: imageUrl || ''
    }).eq('id', productId).select('*').single();
    if (result.error) throw result.error;
    const product = mapProduct(result.data);
    this.brands.forEach((brand) => {
      const index = brand.products.findIndex((item) => item.id === productId);
      if (index >= 0) brand.products[index] = product;
    });
    this.notify();
    return product;
  }

  async deleteProduct(productId) {
    const client = requireSupabase();
    const result = await client.from('products').delete().eq('id', productId);
    if (result.error) throw result.error;
    this.brands.forEach((brand) => {
      brand.products = brand.products.filter((product) => product.id !== productId);
    });
    this.notify();
  }

  getPosts({ brandId, limit = 30 } = {}) {
    let list = this.posts.filter((post) => post.status === 'published');
    if (brandId) list = list.filter((post) => post.brandId === brandId);
    return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit);
  }

  getPostById(postId) {
    return this.posts.find((post) => post.id === postId) || null;
  }

  async createPost({ brandId, text, imageUrl, link }, user) {
    const brand = this.getBrandById(brandId);
    if (!brand || brand.ownerUid !== user.uid) throw new Error('Only the brand owner can publish this update.');
    const uploadedImage = await uploadPublicMedia(imageUrl, { userId: user.uid, folder: 'posts' });
    const client = requireSupabase();
    const result = await client.from('posts').insert({
      brand_id: brandId,
      content: text.trim(),
      image_url: uploadedImage || '',
      link_url: link || '',
      status: 'published'
    }).select('*').single();
    if (result.error) throw result.error;
    const newPost = {
      id: result.data.id,
      brandId,
      brandName: brand.name,
      brandSlug: brand.slug,
      brandLogo: brand.logoUrl,
      isVerified: brand.verificationStatus === 'verified',
      text: result.data.content,
      imageUrl: result.data.image_url || '',
      link: result.data.link_url || '',
      likeCount: 0,
      commentCount: 0,
      createdAt: result.data.created_at,
      status: result.data.status,
      visibility: 'public'
    };
    this.posts.unshift(newPost);
    brand.postCount = (brand.postCount || 0) + 1;
    this.notify();
    return newPost;
  }

  async deletePost(postId) {
    const client = requireSupabase();
    const result = await client.from('posts').delete().eq('id', postId);
    if (result.error) throw result.error;
    const post = this.getPostById(postId);
    this.posts = this.posts.filter((item) => item.id !== postId);
    if (post) {
      const brand = this.getBrandById(post.brandId);
      if (brand) brand.postCount = Math.max(0, (brand.postCount || 0) - 1);
    }
    this.notify();
    return true;
  }

  isFollowing(brandId, followerUid) {
    return (this.followers[brandId] || []).includes(followerUid);
  }

  async toggleFollow(brandId, followerUid) {
    const brand = this.getBrandById(brandId);
    if (!brand) throw new Error('Brand not found.');
    if (brand.ownerUid === followerUid) throw new Error('You cannot follow your own brand.');
    const client = requireSupabase();
    const following = this.isFollowing(brandId, followerUid);

    const result = following
      ? await client.from('follows').delete().eq('brand_id', brandId).eq('follower_id', followerUid)
      : await client.from('follows').insert({ brand_id: brandId, follower_id: followerUid });
    if (result.error) throw result.error;

    const current = this.followers[brandId] || [];
    this.followers[brandId] = following
      ? current.filter((uid) => uid !== followerUid)
      : [...current, followerUid];
    brand.followerCount = this.followers[brandId].length;
    this.notify();
    return { isFollowing: !following, followerCount: brand.followerCount };
  }

  isLiked(postId, userUid) {
    return (this.likes[postId] || []).includes(userUid);
  }

  async toggleLike(postId, userUid) {
    const post = this.getPostById(postId);
    if (!post) throw new Error('Post not found.');
    const client = requireSupabase();
    const liked = this.isLiked(postId, userUid);
    const result = liked
      ? await client.from('post_likes').delete().eq('post_id', postId).eq('user_id', userUid)
      : await client.from('post_likes').insert({ post_id: postId, user_id: userUid });
    if (result.error) throw result.error;
    const current = this.likes[postId] || [];
    this.likes[postId] = liked ? current.filter((uid) => uid !== userUid) : [...current, userUid];
    post.likeCount = this.likes[postId].length;
    this.notify();
    return { isLiked: !liked, likeCount: post.likeCount };
  }

  getComments(postId) {
    return this.comments
      .filter((comment) => comment.postId === postId && comment.moderationStatus === 'approved')
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  async addComment({ postId, content }, user, brand) {
    const client = requireSupabase();
    const result = await client.from('comments').insert({
      post_id: postId,
      author_id: user.uid,
      author_brand_id: brand?.id || null,
      content: content.trim(),
      moderation_status: 'approved'
    }).select('*').single();
    if (result.error) throw result.error;
    const comment = {
      id: result.data.id,
      postId,
      authorUid: user.uid,
      authorBrandId: brand?.id || null,
      authorName: brand?.name || user.name || 'Brand member',
      authorBrandSlug: brand?.slug || '',
      authorLogo: brand?.logoUrl || '',
      content: result.data.content,
      moderationStatus: result.data.moderation_status,
      createdAt: result.data.created_at
    };
    this.comments.push(comment);
    const post = this.getPostById(postId);
    if (post) post.commentCount = (post.commentCount || 0) + 1;
    this.notify();
    return comment;
  }

  async deleteComment(commentId) {
    const comment = this.comments.find((item) => item.id === commentId);
    const client = requireSupabase();
    const result = await client.from('comments').delete().eq('id', commentId);
    if (result.error) throw result.error;
    this.comments = this.comments.filter((item) => item.id !== commentId);
    if (comment) {
      const post = this.getPostById(comment.postId);
      if (post) post.commentCount = Math.max(0, (post.commentCount || 0) - 1);
    }
    this.notify();
    return true;
  }

  getNotifications(userUid) {
    return this.notifications.filter((notification) => notification.recipientUid === userUid);
  }

  async markNotificationAsRead(notificationId) {
    const client = requireSupabase();
    const result = await client.from('notifications').update({ is_read: true }).eq('id', notificationId);
    if (result.error) throw result.error;
    const notification = this.notifications.find((item) => item.id === notificationId);
    if (notification) notification.read = true;
    this.notify();
  }

  async markAllNotificationsAsRead(userUid) {
    const client = requireSupabase();
    const result = await client.from('notifications').update({ is_read: true }).eq('recipient_id', userUid).eq('is_read', false);
    if (result.error) throw result.error;
    this.notifications.forEach((notification) => {
      if (notification.recipientUid === userUid) notification.read = true;
    });
    this.notify();
  }

  async createReport({ targetType, targetId, reason, details }, user) {
    const client = requireSupabase();
    const result = await client.from('reports').insert({
      reporter_id: user.uid,
      target_type: targetType,
      target_id: targetId,
      reason,
      details: details || ''
    }).select('*').single();
    if (result.error) throw result.error;
    const report = this.mapReport(result.data);
    this.reports.unshift(report);
    this.notify();
    return report;
  }

  async submitSupportInquiry({ inquiryType, name, email, subject, message }, user = null) {
    const client = requireSupabase();
    const result = await client.from('support_inquiries').insert({
      submitted_by: user?.uid || null,
      inquiry_type: inquiryType || 'general',
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim()
    });
    if (result.error) throw result.error;
    return true;
  }

  async submitVerificationRequest(brandId, formData, userId) {
    const documentPath = await uploadVerificationDocument(formData.documentUrl, { userId });
    const payload = {
      brand_id: brandId,
      submitted_by: userId,
      legal_entity_name: formData.legalEntityName,
      registration_number: formData.businessRegNumber,
      director_name: formData.directorName || '',
      id_type: formData.idType || 'cac_cert',
      id_number: formData.idNumber || '',
      website_domain: formData.websiteDomain || '',
      registered_address: formData.registeredAddress || '',
      document_path: documentPath || '',
      status: 'pending'
    };
    const existing = this.verificationRequests.find((request) => request.brandId === brandId && request.status === 'pending');
    const client = requireSupabase();
    const result = existing
      ? await client.from('verification_requests').update(payload).eq('id', existing.id).select('*').single()
      : await client.from('verification_requests').insert(payload).select('*').single();
    if (result.error) throw result.error;
    await this.updateBrand(brandId, {
      cacNumber: formData.businessRegNumber,
      website: formData.websiteDomain || this.getBrandById(brandId)?.website,
      address: formData.registeredAddress || this.getBrandById(brandId)?.address
    }, userId);
    const request = this.mapVerificationRequest(result.data);
    this.verificationRequests = [request, ...this.verificationRequests.filter((item) => item.id !== request.id)];
    this.notify();
    return request;
  }

  mapReport(row) {
    return {
      id: row.id,
      targetType: row.target_type,
      targetId: row.target_id,
      reporterUid: row.reporter_id,
      reason: row.reason,
      details: row.details || '',
      status: row.status,
      createdAt: row.created_at,
      reviewedAt: row.reviewed_at
    };
  }

  mapVerificationRequest(row) {
    return {
      id: row.id,
      brandId: row.brand_id,
      submittedBy: row.submitted_by,
      legalEntityName: row.legal_entity_name,
      businessRegNumber: row.registration_number,
      directorName: row.director_name || '',
      idType: row.id_type,
      idNumber: row.id_number || '',
      websiteDomain: row.website_domain || '',
      registeredAddress: row.registered_address || '',
      documentPath: row.document_path || '',
      status: row.status,
      reviewNotes: row.review_notes || '',
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  mapAuditLog(row) {
    return {
      id: row.id,
      actorUid: row.actor_id,
      action: row.action,
      targetType: row.target_type,
      targetId: row.target_id,
      metadata: row.metadata || {},
      timestamp: row.created_at
    };
  }

  mapSupportInquiry(row) {
    return {
      id: row.id,
      submittedBy: row.submitted_by,
      inquiryType: row.inquiry_type,
      name: row.name,
      email: row.email,
      subject: row.subject,
      message: row.message,
      status: row.status,
      adminNote: row.admin_note || '',
      assignedTo: row.assigned_to,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      resolvedAt: row.resolved_at
    };
  }

  getAdminStats() {
    return {
      totalBrands: this.brands.length,
      activeBrands: this.brands.filter((brand) => brand.status === 'active').length,
      verifiedBrands: this.brands.filter((brand) => brand.verificationStatus === 'verified').length,
      totalProducts: this.brands.reduce((total, brand) => total + brand.products.length, 0),
      totalPosts: this.posts.length,
      totalReports: this.reports.length,
      pendingReports: this.reports.filter((report) => report.status === 'pending').length,
      pendingVerifications: this.verificationRequests.filter((request) => request.status === 'pending').length,
      openSupportInquiries: this.supportInquiries.filter((inquiry) => ['new', 'in_progress'].includes(inquiry.status)).length,
      newSupportInquiries: this.supportInquiries.filter((inquiry) => inquiry.status === 'new').length
    };
  }

  async setBrandVerification(brandId, status) {
    const client = requireSupabase();
    const result = await client.rpc('admin_set_brand_verification', { target_brand_id: brandId, new_status: status });
    if (result.error) throw result.error;
    const row = Array.isArray(result.data) ? result.data[0] : result.data;
    const brand = this.getBrandById(brandId);
    mergeBrandRecord(brand, row, this.categories);
    this.notify();
    return brand;
  }

  async reviewVerificationRequest(requestId, decision, notes = '') {
    const client = requireSupabase();
    const result = await client.rpc('admin_review_verification_request', {
      target_request_id: requestId,
      decision,
      notes
    });
    if (result.error) throw result.error;

    const reviewed = this.mapVerificationRequest(Array.isArray(result.data) ? result.data[0] : result.data);
    this.verificationRequests = this.verificationRequests.map((request) => request.id === requestId ? reviewed : request);
    const brand = this.getBrandById(reviewed.brandId);
    if (brand) brand.verificationStatus = decision === 'approved' ? 'verified' : 'rejected';
    this.notify();
    return reviewed;
  }

  async getVerificationDocumentUrl(documentPath) {
    if (!documentPath) throw new Error('No verification document was attached.');
    const client = requireSupabase();
    const result = await client.storage.from('verification-documents').createSignedUrl(documentPath, 600);
    if (result.error) throw result.error;
    return result.data.signedUrl;
  }

  async setBrandStatus(brandId, status) {
    const client = requireSupabase();
    const result = await client.rpc('admin_set_brand_status', { target_brand_id: brandId, new_status: status });
    if (result.error) throw result.error;
    const row = Array.isArray(result.data) ? result.data[0] : result.data;
    const brand = this.getBrandById(brandId);
    mergeBrandRecord(brand, row, this.categories);
    this.notify();
    return brand;
  }

  async hidePost(postId) {
    const client = requireSupabase();
    const result = await client.from('posts').update({ status: 'hidden' }).eq('id', postId);
    if (result.error) throw result.error;
    const post = this.getPostById(postId);
    if (post) post.status = 'hidden';
    this.notify();
    return post;
  }

  async resolveReport(reportId, status) {
    const client = requireSupabase();
    const result = await client.rpc('admin_resolve_report', { target_report_id: reportId, new_status: status });
    if (result.error) throw result.error;
    const report = this.reports.find((item) => item.id === reportId);
    if (report) report.status = status;
    this.notify();
    return report;
  }

  async updateSupportInquiry(inquiryId, updates, administratorUid) {
    const payload = {};
    if (Object.hasOwn(updates, 'status')) {
      payload.status = updates.status;
      payload.resolved_at = ['resolved', 'closed'].includes(updates.status) ? new Date().toISOString() : null;
      payload.assigned_to = updates.status === 'new' ? null : administratorUid;
    }
    if (Object.hasOwn(updates, 'adminNote')) payload.admin_note = updates.adminNote || '';

    const client = requireSupabase();
    const result = await client
      .from('support_inquiries')
      .update(payload)
      .eq('id', inquiryId)
      .select('*')
      .single();
    if (result.error) throw result.error;

    const inquiry = this.mapSupportInquiry(result.data);
    this.supportInquiries = this.supportInquiries.map((item) => item.id === inquiryId ? inquiry : item);
    this.notify();
    return inquiry;
  }
}

export const dataStore = new SupabaseDataStore();
export default dataStore;
