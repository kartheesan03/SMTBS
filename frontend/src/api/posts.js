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
