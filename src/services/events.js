import api from './api';

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const getEvents = async (params = {}) => {
  const { data } = await api.get(`/events${buildQueryString(params)}`);
  return data.events;
};

export const getFeaturedEvents = async (limit = 3) => {
  const { data } = await api.get(`/events${buildQueryString({ featured: true, limit })}`);
  return data.events;
};

export const getAdminEvents = async () => {
  const { data } = await api.get('/events/admin/list');
  return data.events;
};

export const createEvent = async (payload) => {
  const { data } = await api.post('/events', payload);
  return data.event;
};

export const updateEvent = async (eventId, payload) => {
  const { data } = await api.put(`/events/${eventId}`, payload);
  return data.event;
};
