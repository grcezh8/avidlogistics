import apiClient from '../../services/apiClient';

export const login = (credentials) =>
  apiClient.post('/auth/login', credentials);

export const getProfile = () =>
  apiClient.get('/auth/profile');
