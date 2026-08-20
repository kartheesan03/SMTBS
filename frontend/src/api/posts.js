import API from './axios';

// Get paginated posts
export const getPosts = async (page = 1, limit = 10) => {
    const response = await API.get(`/feed?page=${page}&limit=${limit}`);
    return response.data;
};

// Create a new post
export const createPost = async (text, imageUrl = null) => {
    const response = await API.post('/feed', { text, imageUrl });
    return response.data;
};

// Delete a post
export const deletePost = async (id) => {
    const response = await API.delete(`/feed/${id}`);
    return response.data;
};

// Toggle like
export const toggleLike = async (id) => {
    const response = await API.post(`/feed/${id}/like`);
    return response.data;
};

// Add a comment
export const addComment = async (id, text) => {
    const response = await API.post(`/feed/${id}/comments`, { text });
    return response.data;
};

// Delete a comment
export const deleteComment = async (commentId) => {
    const response = await API.delete(`/feed/comments/${commentId}`);
    return response.data;
};

// Toggle Save
export const toggleSave = async (id) => {
    const response = await API.post(`/feed/${id}/save`);
    return response.data;
};

// Get Saved Posts
export const getSavedPosts = async (params) => {
    const response = await API.get('/feed/saved', { params });
    return response.data;
};

// Acknowledge a post
export const acknowledgePost = async (id) => {
    const response = await API.post(`/feed/${id}/acknowledge`);
    return response.data;
};

// Toggle Repost
export const toggleRepost = async (id) => {
    const response = await API.post(`/feed/${id}/repost`);
    return response.data;
};

// Get Suggested Connections
export const getSuggestedConnections = async () => {
    const response = await API.get('/feed/suggestions');
    return response.data;
};

// Get Trending Tags
export const getTrendingTags = async () => {
    const response = await API.get('/feed/trending');
    return response.data;
};

// Toggle Follow a user
export const toggleFollow = async (userId) => {
    const response = await API.post(`/feed/follow/${userId}`);
    return response.data;
};

// Get Company Profile Stats (real member count + env-driven metadata)
export const getCompanyStats = async () => {
    const response = await API.get('/feed/company-stats');
    return response.data;
};
