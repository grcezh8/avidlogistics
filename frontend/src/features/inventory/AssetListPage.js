import React, { useState, useEffect } from 'react';
import { Search, Filter, Scan, Package, MapPin, Shield, Eye, Edit, AlertCircle } from 'lucide-react';
import apiClient from '../../services/apiClient';

const WarehouseInventory = () => {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    election: '',
    location: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [elections, setElections] = useState([]);
  const [locations, setLocations] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [assets, searchTerm, filters]);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      
      // Fetch assets
      const assetsResponse = await apiClient.get('/assets');
      const assetsData = assetsResponse.data || [];
      setAssets(assetsData);

      // Fetch elections - may not exist yet
      try {
        const electionsResponse = await apiClient.get('/elections');
        setElections(electionsResponse.data || []);
      } catch (err) {
        console.warn('Elections API not available:', err);
        setElections([]);
      }

      // Fetch locations/facilities
      try {
        const locationsResponse = await apiClient.get('/facilities');
        setLocations(locationsResponse.data || []);
      } catch (err) {
        console.warn('Facilities API not available:', err);
        setLocations([]);
      }

      // Extract unique asset types
      const types = [...new Set(assetsData.map(asset => asset.assetType))];
      setAssetTypes(types);

    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = assets;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.assetType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(asset => asset.assetType === filters.type);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(asset => asset.status === filters.status);
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(asset => asset.facilityId === parseInt(filters.location));
    }

    setFilteredAssets(filtered);
  };

  const handleBarcodeScanner = () => {
    // In a real implementation, this would open a barcode scanner
    const scannedCode = prompt('Enter barcode or serial number:');
    if (scannedCode) {
      setSearchTerm(scannedCode);
    }
  };

  const getStatusColor = (status) => {
    // Map backend status enum values to colors
    const colors = {
      0: 'gray',    // Unregistered
      1: 'green',   // Available
      2: 'blue',    // Assigned
      3: 'orange',  // In Transit
      4: 'purple',  // Deployed
      5: 'red',     // In Maintenance
      6: 'gray'     // Out of Service
    };
    return colors[status] || 'gray';
  };

  const getStatusName = (status) => {
    const statusMap = {
      0: 'Unregistered',
      1: 'Available',
      2: 'Assigned',
      3: 'In Transit',
      4: 'Deployed',
      5: 'In Maintenance',
      6: 'Out of Service'
    };
    return statusMap[status] || 'Unknown';
  };

  const AssetCard = ({ asset }) => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <Package className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">{asset.serialNumber}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-1">{asset.assetType}</p>
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{asset.location || 'Warehouse'}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${getStatusColor(asset.status)}-100 text-${getStatusColor(asset.status)}-800`}>
            {getStatusName(asset.status)}
          </span>
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <div className="flex space-x-2">
          <button
            onClick={() => window.location.href = `/warehouse/asset/${asset.id}`}
            className="flex items-center px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </button>
          <button
            onClick={() => window.location.href = `/warehouse/asset/${asset.id}/edit`}
            className="flex items-center px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </button>
        </div>
        {asset.notes && (
          <div className="flex items-center text-gray-400">
            <AlertCircle className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );

  const FilterPanel = () => (
    <div className={`bg-white rounded-lg shadow-md p-4 mb-6 ${showFilters ? 'block' : 'hidden'}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Asset Type</label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            {assetTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="1">Available</option>
            <option value="2">Assigned</option>
            <option value="3">In Transit</option>
            <option value="4">Deployed</option>
            <option value="5">In Maintenance</option>
            <option value="6">Out of Service</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <select
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Locations</option>
            {locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.facilityName || location.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={() => {
              setFilters({ type: '', status: '', election: '', location: '' });
              setSearchTerm('');
            }}
            className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Warehouse Inventory</h1>
        
        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by serial number, type, or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleBarcodeScanner}
              className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
            >
              <Scan className="h-5 w-5 mr-2" />
              Scan Barcode
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            Showing <span className="font-semibold">{filteredAssets.length}</span> of <span className="font-semibold">{assets.length}</span> assets
          </p>
        </div>
      </div>

      {/* Filters Panel */}
      <FilterPanel />

      {/* Assets Grid */}
      {filteredAssets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
          <p className="text-gray-500">
            {searchTerm || Object.values(filters).some(f => f) 
              ? 'Try adjusting your search or filters'
              : 'No assets have been registered yet'
            }
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5, 6].map(statusCode => {
          const count = assets.filter(asset => asset.status === statusCode).length;
          return (
            <div key={statusCode} className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className={`text-2xl font-bold text-${getStatusColor(statusCode)}-600 mb-1`}>
                {count}
              </div>
              <div className="text-sm text-gray-600">{getStatusName(statusCode)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WarehouseInventory;
