import api from './api';

export const getAdminUsers = async () => {
  const { data } = await api.get('/auth/admin/users');
  return data.users;
};
