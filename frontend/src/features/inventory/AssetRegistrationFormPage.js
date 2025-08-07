import React, { useState, useEffect } from 'react';
import { Plus, Package, AlertCircle, CheckCircle } from 'lucide-react';
import apiClient from '../../services/apiClient';

const AssetRegistrationForm = ({ onAssetRegistered }) => {
  const [formData, setFormData] = useState({
    serialNumber: '',
    assetType: '',
    barcode: '',
    rfidTag: ''
  });

  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    try {
      const response = await apiClient.get('/facilities');
      setFacilities(response.data || []);
    } catch (err) {
      console.warn('Facilities API not available:', err.message);
      // For now, we'll just have empty facilities
      setFacilities([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.serialNumber.trim()) {
      setError('Serial number is required');
      setLoading(false);
      return;
    }

    if (!formData.assetType.trim()) {
      setError('Asset type is required');
      setLoading(false);
      return;
    }

    try {
      // Create the asset using apiClient directly
      const response = await apiClient.post('/assets', formData);

      setSuccess(`Asset "${formData.serialNumber}" registered successfully!`);
      
      // Reset form
      setFormData({
        serialNumber: '',
        assetType: '',
        barcode: '',
        rfidTag: ''
      });

      // Notify parent component
      if (onAssetRegistered) {
        onAssetRegistered(response.data);
      }

    } catch (error) {
      console.error('Asset registration failed:', error);
      setError(`Failed to register asset: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Package className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Register New Asset</h2>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Serial Number *
              </label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter serial number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset Type *
              </label>
              <select
                name="assetType"
                value={formData.assetType}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select asset type</option>
                <option value="Ballot Box">Ballot Box</option>
                <option value="Voting Machine">Voting Machine</option>
                <option value="Poll Book">Poll Book</option>
                <option value="Seal">Seal</option>
                <option value="Backup Battery">Backup Battery</option>
              </select>
            </div>
          </div>

          {/* Identification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Barcode
              </label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter barcode"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RFID Tag
              </label>
              <input
                type="text"
                name="rfidTag"
                value={formData.rfidTag}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter RFID tag"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Register Asset</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetRegistrationForm;
