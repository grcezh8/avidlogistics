import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, Plus } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import AssetRegistrationModal from '../../components/AssetRegistrationModal';
import apiClient from '../../services/apiClient';

export default function InventoryPage() {
  const [assets, setAssets] = useState([]);
  const [facilities, setFacilities] = useState([]); // ✅ defined properly
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadAssets();
  }, [filterStatus]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      
      // Load facilities
      try {
        const facilitiesRes = await apiClient.get('/facilities');
        setFacilities(facilitiesRes.data || []);
      } catch (err) {
        console.warn('Facilities API not available:', err);
      }
      
      // Load assets with optional status filter
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const assetsRes = await apiClient.get('/assets', { params });
      setAssets(assetsRes.data || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = assets.filter(asset => {
    const matchesSearch =
      asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assetType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.barcode?.toLowerCase().includes(searchTerm.toLowerCase());

    // Handle both string and numeric status filtering
    let matchesFilter = filterStatus === 'all';
    if (!matchesFilter) {
      // Map numeric filter values to string status values
      const statusMapping = {
        '0': 'Available',
        '1': 'Pending', 
        '2': 'Unavailable'
      };
      const expectedStatus = statusMapping[filterStatus];
      matchesFilter = asset.status === expectedStatus || asset.status === parseInt(filterStatus);
    }

    return matchesSearch && matchesFilter;
  });

  const getFacilityName = (facilityId) => {
    const facility = facilities.find(f => f.id === facilityId);
    return facility ? facility.name : `Facility ${facilityId}`;
  };

  const formatAssetType = (type) => {
    return type.replace(/([A-Z])/g, ' $1').trim();
  };

  const getStatusBadge = (status) => {
    // Handle both string and numeric status values
    const statusMap = {
      // Numeric values (from database)
      0: { name: 'Available', color: 'bg-green-100 text-green-800' },
      1: { name: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      2: { name: 'Unavailable', color: 'bg-red-100 text-red-800' },
      // String values (from API serialization)
      'Available': { name: 'Available', color: 'bg-green-100 text-green-800' },
      'Pending': { name: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      'Unavailable': { name: 'Unavailable', color: 'bg-red-100 text-red-800' }
    };
    return statusMap[status]?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusName = (status) => {
    // Handle both string and numeric status values
    const statusMap = {
      // Numeric values (from database)
      0: 'Available',
      1: 'Pending',
      2: 'Unavailable',
      // String values (from API serialization)
      'Available': 'Available',
      'Pending': 'Pending',
      'Unavailable': 'Unavailable'
    };
    return statusMap[status] || 'Available'; // Default to Available instead of Unknown
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAssetRegistered = (newAsset) => {
    // Refresh the assets list to include the new asset
    loadAssets();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar links={['Dashboard', 'Inventory', 'Packing', 'Custody']} />
      <div className="flex-1 flex flex-col">
        <TopBar title="Inventory Management" />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Inventory Overview</h1>
            <p className="text-gray-600">Manage and track all warehouse assets and equipment</p>
          </div>

          {/* Controls */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search inventory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="0">Available</option>
                  <option value="1">Pending</option>
                  <option value="2">Unavailable</option>
                </select>
                <button 
                  onClick={handleOpenModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Add Asset
                </button>
              </div>
            </div>
          </div>

          {/* Assets Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Package className="h-8 w-8 text-gray-400 animate-pulse" />
                </div>
                <p className="text-gray-500">Loading assets...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Serial Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Asset Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Barcode
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Condition
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInventory.map((asset) => (
                      <tr key={asset.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Package className="h-5 w-5 text-gray-400 mr-3" />
                            <div className="text-sm font-medium text-gray-900">{asset.serialNumber || asset.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {asset.assetType || asset.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {asset.barcode || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(asset.status)}`}>
                            {getStatusName(asset.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {asset.condition || 'Good'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {asset.location || `Facility ${asset.facilityId || ''}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                          <button className="text-blue-600 hover:text-blue-900">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Asset Registration Modal */}
      <AssetRegistrationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAssetRegistered={handleAssetRegistered}
      />
    </div>
  );
}
