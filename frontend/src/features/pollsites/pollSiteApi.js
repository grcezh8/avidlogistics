import apiClient from '../../services/apiClient';

export const getPollSites = () => {
  return apiClient.get('/pollsites');
};

export const getPollSite = (id) => {
  return apiClient.get(`/pollsites/${id}`);
};
