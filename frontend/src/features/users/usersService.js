import apiClient from '../../services/apiClient';

export const getUsers = () =>
  apiClient.get('/users');

export const getUserById = (id) =>
  apiClient.get(`/users/${id}`);

export const createUser = (data) =>
  apiClient.post('/users', data);
