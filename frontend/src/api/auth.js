import API from './axios';

export const updateProfile = async (profileData) => {
    const response = await API.put('/auth/profile', profileData);
    return response.data;
};
