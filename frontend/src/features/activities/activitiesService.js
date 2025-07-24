import apiClient from '../../services/apiClient';

export const getActivities = () =>
  apiClient.get('/activities');

export const getActivityById = (id) =>
  apiClient.get(`/activities/${id}`);

export const createActivity = (data) =>
  apiClient.post('/activities', data);
