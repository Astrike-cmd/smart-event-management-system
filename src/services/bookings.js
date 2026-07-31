import api from './api';

export const createBooking = async (payload) => {
  const { data } = await api.post('/bookings', payload);
  return data.booking;
};

export const getMyBookings = async () => {
  const { data } = await api.get('/bookings');
  return data.bookings;
};

export const cancelBooking = async (bookingId) => {
  const { data } = await api.post(`/bookings/${bookingId}/cancel`);
  return data.booking;
};

export const getAdminBookings = async () => {
  const { data } = await api.get('/bookings/admin/list');
  return data.bookings;
};

export const createAdminBooking = async (payload) => {
  const { data } = await api.post('/bookings/admin/create', payload);
  return data.booking;
};

export const cancelAdminBooking = async (bookingId) => {
  const { data } = await api.post(`/bookings/admin/${bookingId}/cancel`);
  return data.booking;
};

export const transferAdminBooking = async (bookingId, payload) => {
  const { data } = await api.post(`/bookings/admin/${bookingId}/transfer`, payload);
  return data.booking;
};
