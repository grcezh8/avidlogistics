import apiClient from '../../services/apiClient';

export const getChainOfCustody = (filters = '') =>
  apiClient.get(`/chainofcustody${filters ? `?${filters}` : ''}`);

export const getChainOfCustodyById = (id) =>
  apiClient.get(`/chainofcustody/${id}`);

export const createChainOfCustodyEvent = (data) =>
  apiClient.post('/chainofcustody', data);

// New CoC Form Generation APIs
export const generateCoCForm = (data) =>
  apiClient.post('/chainofcustody/generate-form', data);

export const getCoCFormByManifest = (manifestId) =>
  apiClient.get(`/chainofcustody/manifest/${manifestId}/form`);

export const getCoCFormHtml = (formId) =>
  apiClient.get(`/chainofcustody/form/${formId}`);

export const submitSignature = (data) =>
  apiClient.post('/chainofcustody/sign', data);

export const getUnresolvedForms = () =>
  apiClient.get('/chainofcustody/unresolved');

export const getAssetCustodyHistory = (assetId) =>
  apiClient.get(`/chainofcustody/asset/${assetId}/history`);

export const logCustodyEvent = (data) =>
  apiClient.post('/chainofcustody/event', data);

// Manifest CoC Integration
export const generateManifestCoCForm = (manifestId, data = {}) =>
  apiClient.post(`/manifests/${manifestId}/generate-digital-coc`, data);

// Upload a scanned chain of custody form. Expects a FormData object with
// keys: file (Blob), electionId, assetId, formType, uploadedBy, and optional
// description. Returns the scannedFormId and any extracted fields.
export const uploadScannedForm = (formData) =>
  apiClient.post('/scannedforms/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

// Finalize a chain of custody event based on a previously uploaded scanned form.
// Accepts an object containing electionId, assetId, fromParty, toParty,
// sealNumber, notes, scannedFormId, createdBy. Returns the created event.
export const finalizeScannedEvent = (data) =>
  apiClient.post('/scannedforms/finalize', data);
