import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/api';
import { ManifestWithDetailsDto } from '../types/manifest';

export class ManifestService {
  static async getManifestDetails(manifestId: number): Promise<ManifestWithDetailsDto> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MANIFESTS.GET_DETAILS(manifestId));
      return response.data;
    } catch (error) {
      console.error('Error fetching manifest details:', error);
      throw new Error('Failed to fetch manifest details');
    }
  }

  static async getManifestById(manifestId: number): Promise<any> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MANIFESTS.GET_BY_ID(manifestId));
      return response.data;
    } catch (error) {
      console.error('Error fetching manifest:', error);
      throw new Error('Failed to fetch manifest');
    }
  }

  static extractManifestIdFromUrl(url: string): number | null {
    try {
      // Extract manifest ID from URL patterns like:
      // http://localhost:5166/manifest/123
      // http://localhost:5166/api/manifests/123/details
      const patterns = [
        /\/manifest\/(\d+)/i,
        /\/manifests\/(\d+)/i,
        /manifestId[=:](\d+)/i,
        /id[=:](\d+)/i,
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return parseInt(match[1], 10);
        }
      }

      return null;
    } catch (error) {
      console.error('Error extracting manifest ID from URL:', error);
      return null;
    }
  }
}
