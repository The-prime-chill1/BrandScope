import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dataStore } from '../../services/dataStore';
import { Package, Plus, Search, Trash2, Edit3, MessageCircle, Clock, DollarSign, X } from 'lucide-react';
import { ImageUploader } from '../../components/common/ImageUploader';
import { SelectField } from '../../components/common/SelectField';
import { createWhatsAppUrl } from '../../lib/contact';
import { useDataStoreVersion } from '../../hooks/useDataStoreVersion';

const EMPTY_PRODUCT = {
  title: '',
  price: '',
  badge: '',
  leadTime: '',
  imageUrl: '',
  description: '',
  availability: 'in_stock'
};

export const ManageProducts = () => {
  const storeVersion = useDataStoreVersion();
  const { user, currentBrand, refreshBrand } = useAuth();
  const { addToast } = useToast();
  const [products, setProducts] = useState(currentBrand?.products || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(EMPTY_PRODUCT);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setProducts(currentBrand?.products || []);
  }, [currentBrand, storeVersion]);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) => [product.title, product.description, product.badge]
      .some((value) => value?.toLowerCase().includes(query)));
  }, [products, searchTerm]);

  if (!currentBrand || !user) return null;

  const openEditor = (product = null) => {
    setEditingProduct(product);
    setFormData(product ? {
      title: product.title || '',
      price: product.price || '',
      badge: product.badge || '',
      leadTime: product.leadTime || '',
      imageUrl: product.imageUrl || '',
      description: product.description || '',
      availability: product.availability || (product.inStock === false ? 'out_of_stock' : 'in_stock')
    } : EMPTY_PRODUCT);
    setModalOpen(true);
  };

  const closeEditor = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingProduct(null);
    setFormData(EMPTY_PRODUCT);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!formData.title.trim() || formData.price === '') {
      addToast('Add a product title and USD price.', 'error');
      return;
    }

    setSaving(true);
    try {
      const saved = editingProduct
        ? await dataStore.updateProduct(editingProduct.id, formData, user.uid)
        : await dataStore.createProduct(currentBrand.id, formData, user.uid);
      setProducts((current) => editingProduct
        ? current.map((product) => product.id === saved.id ? saved : product)
        : [saved, ...current]);
      await refreshBrand();
      addToast(editingProduct ? 'Catalog item updated.' : 'Catalog item published.', 'success');
      setModalOpen(false);
      setEditingProduct(null);
      setFormData(EMPTY_PRODUCT);
    } catch (error) {
      addToast(error.message || 'Could not save this item.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Remove this item from your public catalog?')) return;
    try {
      await dataStore.deleteProduct(productId);
      setProducts((current) => current.filter((product) => product.id !== productId));
      await refreshBrand();
      addToast('Catalog item removed.', 'info');
    } catch (error) {
      addToast(error.message || 'Could not remove this item.', 'error');
    }
  };

  const hasWhatsApp = Boolean(createWhatsAppUrl(currentBrand.whatsapp));

  return (
    <div className="dashboard-page-wide">
      <div className="dashboard-page-heading dashboard-page-heading--split">
        <div>
          <span className="section-eyebrow"><Package size={14} /> Direct commerce catalog</span>
          <h1>Products & services</h1>
          <p>Publish as many real offerings as your business needs. Every item uses USD and can hand buyers directly to WhatsApp.</p>
        </div>
        <button type="button" onClick={() => openEditor()} className="btn btn-primary">
          <Plus size={17} /> Add an item
        </button>
      </div>

      <div className="catalog-toolbar">
        <Search size={17} />
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search your catalog..."
          aria-label="Search catalog"
        />
        <span>{products.length} {products.length === 1 ? 'item' : 'items'}</span>
      </div>

      {filteredProducts.length === 0 ? (
        <section className="card dashboard-empty-state">
          <div className="dashboard-empty-icon"><Package size={30} /></div>
          <h3>{products.length ? 'No matching items' : 'Your catalog is ready for its first item'}</h3>
          <p>{products.length ? 'Try a different search term.' : 'Add a product, service, package, or made-to-order offering with a clear price and response time.'}</p>
          {!products.length && <button type="button" onClick={() => openEditor()} className="btn btn-primary">Add your first item</button>}
        </section>
      ) : (
        <div className="catalog-grid">
          {filteredProducts.map((product) => (
            <article className="catalog-card" key={product.id}>
              <div className="catalog-card-media">
                {product.imageUrl ? <img src={product.imageUrl} alt={product.title} /> : <Package size={34} />}
                <span className={`catalog-availability catalog-availability--${product.availability}`}>
                  {product.availability === 'out_of_stock' ? 'Out of stock' : product.availability === 'preorder' ? 'Pre-order' : product.availability === 'service' ? 'Service' : 'Available'}
                </span>
              </div>
              <div className="catalog-card-body">
                {product.badge && <span className="catalog-label">{product.badge}</span>}
                <div className="catalog-card-title-row">
                  <h3>{product.title}</h3>
                  <strong>${Number(product.price).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</strong>
                </div>
                <p>{product.description || 'No description added yet.'}</p>
                {product.leadTime && <span className="catalog-lead"><Clock size={13} /> {product.leadTime}</span>}
                <div className="catalog-card-actions">
                  {hasWhatsApp && (
                    <a
                      href={createWhatsAppUrl(currentBrand.whatsapp, `Hello ${currentBrand.name}, I am interested in "${product.title}" listed on BRANDSCOPE: ${window.location.origin}/product/${product.id}`)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline btn-sm"
                    >
                      <MessageCircle size={14} /> Test order link
                    </a>
                  )}
                  <div>
                    <button type="button" onClick={() => openEditor(product)} className="icon-action" aria-label={`Edit ${product.title}`}><Edit3 size={15} /></button>
                    <button type="button" onClick={() => handleDelete(product.id)} className="icon-action icon-action--danger" aria-label={`Delete ${product.title}`}><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeEditor()}>
          <div className="catalog-modal" role="dialog" aria-modal="true" aria-labelledby="catalog-modal-title">
            <div className="catalog-modal-header">
              <div>
                <span className="section-eyebrow">Public catalog item</span>
                <h2 id="catalog-modal-title">{editingProduct ? 'Edit item' : 'Add an item'}</h2>
              </div>
              <button type="button" onClick={closeEditor} className="icon-action" aria-label="Close editor"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="catalog-form">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" value={formData.title} onChange={(event) => setFormData({ ...formData, title: event.target.value })} maxLength={160} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Price in USD *</label>
                  <div className="auth-input-wrap">
                    <DollarSign size={16} className="auth-input-icon" />
                    <input className="form-input" style={{ paddingLeft: '36px' }} type="number" min="0" step="0.01" value={formData.price} onChange={(event) => setFormData({ ...formData, price: event.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Availability</label>
                  <SelectField
                    value={formData.availability}
                    ariaLabel="Product availability"
                    options={[
                      { value: 'in_stock', label: 'Available / in stock' },
                      { value: 'preorder', label: 'Pre-order' },
                      { value: 'service', label: 'Service' },
                      { value: 'out_of_stock', label: 'Out of stock' }
                    ]}
                    onChange={(nextValue) => setFormData({ ...formData, availability: nextValue })}
                  />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Short label</label>
                  <input className="form-input" placeholder="Made to order" value={formData.badge} onChange={(event) => setFormData({ ...formData, badge: event.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Lead time</label>
                  <input className="form-input" placeholder="Ships in 2–3 days" value={formData.leadTime} onChange={(event) => setFormData({ ...formData, leadTime: event.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows={4} value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} maxLength={5000} />
              </div>
              <ImageUploader label="Product photo" hint="Choose a clear photo from your phone or computer." value={formData.imageUrl} onChange={(imageUrl) => setFormData({ ...formData, imageUrl })} maxDimension={1200} />
              <div className="catalog-modal-actions">
                <button type="button" onClick={closeEditor} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : editingProduct ? 'Save changes' : 'Publish item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
