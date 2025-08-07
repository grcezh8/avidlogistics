import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/api';
import { CreateSignatureInput, CreateChainOfCustodyEventInput } from '../types/chainOfCustody';

export class ChainOfCustodyService {
  static async submitSignature(signatureData: CreateSignatureInput): Promise<any> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CHAIN_OF_CUSTODY.SUBMIT_SIGNATURE, signatureData);
      return response.data;
    } catch (error) {
      console.error('Error submitting signature:', error);
      throw new Error('Failed to submit signature');
    }
  }

  static async logCustodyEvent(eventData: CreateChainOfCustodyEventInput): Promise<any> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CHAIN_OF_CUSTODY.LOG_EVENT, eventData);
      return response.data;
    } catch (error) {
      console.error('Error logging custody event:', error);
      throw new Error('Failed to log custody event');
    }
  }

  static async getAssetHistory(assetId: number): Promise<any[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CHAIN_OF_CUSTODY.GET_ASSET_HISTORY(assetId));
      return response.data;
    } catch (error) {
      console.error('Error fetching asset history:', error);
      throw new Error('Failed to fetch asset history');
    }
  }

  static async uploadSignatureImage(imageBase64: string): Promise<string> {
    try {
      // For now, we'll return the base64 string as the URL
      // In a production app, you might want to upload to a file storage service
      return `data:image/png;base64,${imageBase64}`;
    } catch (error) {
      console.error('Error uploading signature image:', error);
      throw new Error('Failed to upload signature image');
    }
  }
}
