import Constants from 'expo-constants';

export const API_BASE_URL = process.env.API_BASE_URL || 'http://192.168.1.100:5166';

export const API_ENDPOINTS = {
  MANIFESTS: {
    GET_ALL: '/api/manifests',
    GET_DETAILS: (id: number) => `/api/manifests/${id}/details`,
    GET_BY_ID: (id: number) => `/api/manifests/${id}`,
    FINISH_PACKING: (id: number) => `/api/manifests/${id}/finish-packing`,
  },
  CHAIN_OF_CUSTODY: {
    SUBMIT_SIGNATURE: '/api/chainofcustody/sign',
    LOG_EVENT: '/api/chainofcustody/event',
    GET_ASSET_HISTORY: (assetId: number) => `/api/chainofcustody/asset/${assetId}/history`,
  },
};
