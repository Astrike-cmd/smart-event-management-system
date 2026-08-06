import api from './api';

export const getAdminUsers = async () => {
  const { data } = await api.get('/auth/admin/users');
  return data.users;
};

export const updateProfilePhoto = async (imageData) => {
  const { data } = await api.put('/auth/profile-photo', { imageData });
  return data.user;
};
