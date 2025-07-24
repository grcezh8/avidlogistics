import apiClient from '../../services/apiClient';

export const getElections = () =>
  apiClient.get('/elections');

export const getElection = (id) =>
  apiClient.get(`/elections/${id}`);

export const createElection = (data) =>
  apiClient.post('/elections', data);
