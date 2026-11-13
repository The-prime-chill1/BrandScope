import { dataStore } from './dataStore';

export const brandService = {
  getBrands(params) {
    return Promise.resolve(dataStore.getBrands(params));
  },

  getBrandBySlug(slug) {
    return Promise.resolve(dataStore.getBrandBySlug(slug));
  },

  getBrandById(id) {
    return Promise.resolve(dataStore.getBrandById(id));
  },

  getBrandByOwner(uid) {
    return Promise.resolve(dataStore.getBrandByOwnerUid(uid));
  },

  createBrand(brandData, user) {
    return Promise.resolve(dataStore.createBrand(brandData, user));
  },

  updateBrand(brandId, updates, actorUid) {
    return Promise.resolve(dataStore.updateBrand(brandId, updates, actorUid));
  },

  isFollowing(brandId, followerUid) {
    return dataStore.isFollowing(brandId, followerUid);
  },

  toggleFollow(brandId, followerUid, followerBrandName) {
    return Promise.resolve(dataStore.toggleFollow(brandId, followerUid, followerBrandName));
  },

  getCategories() {
    return Promise.resolve(dataStore.categories);
  }
};
