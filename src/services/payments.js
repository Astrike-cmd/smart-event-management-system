import api from './api';

export const completeDemoPayment = async (payload) => {
  const { data } = await api.post('/payments/demo', payload);
  return data.booking;
};

export const submitUpiPayment = async (payload) => {
  const { data } = await api.post('/payments/upi', payload);
  return data.booking;
};

export const confirmUpiPayment = async (bookingId) => {
  const { data } = await api.post(`/payments/admin/${bookingId}/confirm-upi`);
  return data.booking;
};