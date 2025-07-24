import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Package, AlertCircle, Truck, Wrench, MapPin, CheckCircle, XCircle, Clock } from 'lucide-react';
import apiService from '../../services/apiClient';

const AssetList = ({ refreshTrigger }) => {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const assetStatuses = {
    0: { label: 'Unregistered', color: 'bg-gray-100 text-gray-800' },
    1: { label: 'Available', color: 'bg-green-100 text-green-800' },
    2: { label: 'Assigned', color: 'bg-blue-100 text-blue-800' },
    3: { label: 'In Transit', color: 'bg-yellow-100 text-yellow-800' },
    4: { label: 'Deployed', color: 'bg-purple-100 text-purple-800' },
    5: { label: 'In Maintenance', color: 'bg-orange-100 text-orange-800' },
    6: { label: 'Out of Service', color: 'bg-red-100 text-red-800' }
  };

  const assetConditions = {
    0: 'New',
    1: 'Good',
    2: 'Fair',
    3: 'Needs Repair',
    4: 'Retired'
  };

  useEffect(() => {
    loadAssets();
  }, [refreshTrigger]);

  useEffect(() => {
    filterAssets();
  }, [assets, searchTerm, statusFilter, typeFilter]);

  const loadAssets = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try inventory dashboard first, fallback to assets endpoint
      let data;
      try {
        data = await apiService.getInventoryDashboard();
      } catch (inventoryError) {
        console.warn('Inventory dashboard not available, trying assets endpoint:', inventoryError.message);
        // Fallback to assets endpoint
        data = await apiService.getAvailableAssets();
      }
      setAssets(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load assets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAssets = () => {
    let filtered = [...assets];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.assetType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(asset => asset.status === parseInt(statusFilter));
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(asset => asset.assetType === typeFilter);
    }

    setFilteredAssets(filtered);
  };

  const getUniqueAssetTypes = () => {
    const types = [...new Set(assets.map(asset => asset.assetType))];
    return types.filter(Boolean).sort();
  };

  const handleStatusUpdate = async (assetId, newStatus) => {
    try {
      setError(null); // Clear any previous errors
      console.log(`Updating asset ${assetId} to status ${newStatus}`);
      
      // Send the status as integer to match backend enum
      await apiService.updateAssetStatus(assetId, parseInt(newStatus));
      console.log(`Successfully updated asset ${assetId} to status ${newStatus}`);
      
      await loadAssets(); // Refresh the list
    } catch (err) {
      console.error('Status update failed:', err);
      setError(`Failed to update asset status: ${err.message}`);
      
      // Refresh the list anyway to show current state
      await loadAssets();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading assets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-800">Error loading assets: {error}</span>
        </div>
        <button
          onClick={loadAssets}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Asset Inventory</h3>
          </div>
          <button
            onClick={loadAssets}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            {Object.entries(assetStatuses).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            {getUniqueAssetTypes().map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Asset List - Responsive Design */}
      <div className="overflow-x-auto">
        {filteredAssets.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {assets.length === 0 ? 'No assets found' : 'No assets match your filters'}
            </p>
          </div>
        ) : (
          <div className="min-w-full">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Asset Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Change Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {asset.serialNumber}
                          </div>
                          {asset.barcode && (
                            <div className="text-xs text-gray-500 font-mono">
                              {asset.barcode}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {asset.assetType}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          assetStatuses[asset.status]?.color || 'bg-gray-100 text-gray-800'
                        }`}>
                          {assetStatuses[asset.status]?.label || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {asset.location || 'Warehouse'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <select
                          value={asset.status}
                          onChange={(e) => handleStatusUpdate(asset.id, parseInt(e.target.value))}
                          className="text-sm border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white hover:bg-gray-50 cursor-pointer w-full max-w-[150px]"
                          title="Change Status"
                        >
                          {Object.entries(assetStatuses).map(([value, { label }]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              <div className="space-y-4 p-4">
                {filteredAssets.map((asset) => (
                  <div key={asset.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{asset.serialNumber}</div>
                        <div className="text-sm text-gray-600">{asset.assetType}</div>
                        {asset.barcode && (
                          <div className="text-xs text-gray-500 font-mono">{asset.barcode}</div>
                        )}
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        assetStatuses[asset.status]?.color || 'bg-gray-100 text-gray-800'
                      }`}>
                        {assetStatuses[asset.status]?.label || 'Unknown'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Location: {asset.location || 'Warehouse'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Change Status:
                      </label>
                      <select
                        value={asset.status}
                        onChange={(e) => handleStatusUpdate(asset.id, parseInt(e.target.value))}
                        className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                      >
                        {Object.entries(assetStatuses).map(([value, { label }]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="text-sm text-gray-700">
          Showing {filteredAssets.length} of {assets.length} assets
        </div>
      </div>
    </div>
  );
};

export default AssetList;
