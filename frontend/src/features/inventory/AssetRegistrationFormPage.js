import React, { useState, useEffect } from 'react';
import { Plus, Package, AlertCircle, CheckCircle } from 'lucide-react';
// import consolidatedApiService from '../services/consolidatedApi';
import apiService from '../../services/apiClient'; // Keep for fallback

const AssetRegistrationForm = ({ onAssetRegistered }) => {
  const [formData, setFormData] = useState({
    itemId: '',
    sku: '',
    barcode: '',
    facilityId: 1,
    reorderLevel: '',
    maxStockLevel: '',
    storageLocation: '',
    notes: '',
    initialQuantity: 1,
    registeredBy: 1
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
      const response = await apiService.request('/facilities');
      setFacilities(response);
    } catch (err) {
      console.warn('Facilities API not available, using mock data:', err.message);
      setFacilities([
        { Id: 1, FacilityName: 'Main Warehouse' },
        { Id: 2, FacilityName: 'East Warehouse' },
        { Id: 3, FacilityName: 'South Distribution Center' }
      ]);
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
    if (!formData.itemId.trim()) {
      setError('Item ID is required');
      setLoading(false);
      return;
    }

    if (!formData.initialQuantity || formData.initialQuantity < 0) {
      setError('Initial quantity must be a positive number');
      setLoading(false);
      return;
    }

    try {
      // Prepare data for API
      const assetData = {
        ItemId: formData.itemId,
        SKU: formData.sku || null,
        Barcode: formData.barcode || null,
        FacilityId: parseInt(formData.facilityId),
        ReorderLevel: parseInt(formData.reorderLevel) || 0,
        MaxStockLevel: parseInt(formData.maxStockLevel) || 100,
        StorageLocation: formData.storageLocation || null,
        Notes: formData.notes || null,
        InitialQuantity: parseInt(formData.initialQuantity),
        RegisteredBy: formData.registeredBy
      };

      // Use legacy API directly since consolidated API is not available
      const response = await apiService.request('/warehouse/assets/register', {
        method: 'POST',
        body: JSON.stringify(assetData)
      });

      setSuccess(`Asset "${formData.itemId}" registered successfully with ${formData.initialQuantity} units in inventory!`);
      
      // Reset form
      setFormData({
        itemId: '',
        sku: '',
        barcode: '',
        facilityId: 1,
        reorderLevel: '',
        maxStockLevel: '',
        storageLocation: '',
        notes: '',
        initialQuantity: 1,
        registeredBy: 1
      });

      // Notify parent component
      if (onAssetRegistered) {
        onAssetRegistered(response);
      }

    } catch (error) {
      console.error('Asset registration failed:', error);
      setError(`Failed to register asset: ${error.message}`);
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
                Item ID *
              </label>
              <input
                type="text"
                name="itemId"
                value={formData.itemId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter item ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Quantity *
              </label>
              <input
                type="number"
                name="initialQuantity"
                value={formData.initialQuantity}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter initial quantity"
              />
            </div>
          </div>

          {/* Identification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter SKU"
              />
            </div>

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
          </div>

          {/* Location and Facility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facility
              </label>
              <select
                name="facilityId"
                value={formData.facilityId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {facilities.map(facility => (
                  <option key={facility.Id} value={facility.Id}>
                    {facility.FacilityName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Storage Location
              </label>
              <input
                type="text"
                name="storageLocation"
                value={formData.storageLocation}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., A1-B2-C3"
              />
            </div>
          </div>

          {/* Stock Levels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reorder Level
              </label>
              <input
                type="number"
                name="reorderLevel"
                value={formData.reorderLevel}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Minimum stock level"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Stock Level
              </label>
              <input
                type="number"
                name="maxStockLevel"
                value={formData.maxStockLevel}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Maximum stock level"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes about the asset"
            />
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
