import api from './api';

export const getEventFeedback = async (eventId) => {
  const { data } = await api.get(`/feedback/event/${eventId}`);
  return data;
};

export const getMyFeedbackForEvent = async (eventId) => {
  const { data } = await api.get(`/feedback/mine/${eventId}`);
  return data;
};

export const createFeedback = async (payload) => {
  const { data } = await api.post('/feedback', payload);
  return data.feedback;
};

export const updateFeedback = async (feedbackId, payload) => {
  const { data } = await api.put(`/feedback/${feedbackId}`, payload);
  return data.feedback;
};

export const deleteFeedback = async (feedbackId) => {
  const { data } = await api.delete(`/feedback/${feedbackId}`);
  return data;
};

export const getAdminFeedback = async () => {
  const { data } = await api.get('/feedback/admin/list');
  return data.feedback;
};

export const deleteAdminFeedback = async (feedbackId) => {
  const { data } = await api.delete(`/feedback/admin/${feedbackId}`);
  return data;
};
