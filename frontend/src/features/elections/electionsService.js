import apiClient from '../../services/apiClient';

export const getElections = () =>
  apiClient.get('/elections');

export const getElection = (id) =>
  apiClient.get(`/elections/${id}`);

export const createElection = (data) =>
  apiClient.post('/elections', data);

export const getCurrentElection = () =>
  apiClient.get('/elections/current');

export const getUpcomingElections = () =>
  apiClient.get('/elections?status=upcoming');

export const getActiveElections = () =>
  apiClient.get('/elections?status=active');
