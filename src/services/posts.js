import { dataStore } from './dataStore';

export const postService = {
  getPosts(params) {
    return Promise.resolve(dataStore.getPosts(params));
  },

  getPostById(postId) {
    return Promise.resolve(dataStore.getPostById(postId));
  },

  createPost(payload, user) {
    return Promise.resolve(dataStore.createPost(payload, user));
  },

  deletePost(postId, actorUid) {
    return Promise.resolve(dataStore.deletePost(postId, actorUid));
  },

  isLiked(postId, userUid) {
    return dataStore.isLiked(postId, userUid);
  },

  toggleLike(postId, userUid, actorBrandName) {
    return Promise.resolve(dataStore.toggleLike(postId, userUid, actorBrandName));
  },

  getComments(postId) {
    return Promise.resolve(dataStore.getComments(postId));
  },

  addComment(payload, user, brand) {
    return Promise.resolve(dataStore.addComment(payload, user, brand));
  },

  deleteComment(commentId, actorUid) {
    return Promise.resolve(dataStore.deleteComment(commentId, actorUid));
  }
};
