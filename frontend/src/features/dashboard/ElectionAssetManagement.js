import React, { useState, useEffect } from 'react';
import { 
  Package, Scan, Shield, FileText, MapPin, Calendar, User, 
  CheckCircle2, AlertTriangle, Clock, Search, Filter, Download,
  Eye, Edit, Trash2, Plus, X, ChevronRight, ChevronDown
} from 'lucide-react';
import apiService from '../../services/apiClient';

const ElectionAssetManagement = () => {
  const [activeElection, setActiveElection] = useState(null);
  const [elections, setElections] = useState([]);
  const [assets, setAssets] = useState([]);
  const [chainOfCustody, setChainOfCustody] = useState([]);
  const [seals, setSeals] = useState([]);
  const [manifests, setManifests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assets');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showAssetDetails, setShowAssetDetails] = useState(false);

  useEffect(() => {
    loadElectionData();
  }, []);

  const loadElectionData = async () => {
    setIsLoading(true);
    try {
      // Load elections and set the first one as active
      const electionsData = await apiService.getElections();
      setElections(electionsData);
      
      if (electionsData.length > 0) {
        const firstElection = electionsData[0];
        setActiveElection(firstElection);
        await loadElectionAssets(firstElection.ElectionID);
      }
    } catch (error) {
      console.error('Failed to load election data:', error);
      // Fallback to mock data
      const mockElections = [
        { ElectionID: 1, Name: '2024 General Election', StartDate: '2024-11-01', EndDate: '2024-11-06' },
        { ElectionID: 2, Name: '2024 Primary Election', StartDate: '2024-06-01', EndDate: '2024-06-01' }
      ];
      setElections(mockElections);
      setActiveElection(mockElections[0]);
      await loadMockElectionData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadElectionAssets = async (electionId) => {
    try {
      const [assetsData, custodyData, sealsData, manifestsData] = await Promise.all([
        apiService.getAssetsByElection ? apiService.getAssetsByElection(electionId) : apiService.getAvailableAssets(),
        apiService.getElectionChainOfCustody(electionId),
        apiService.getSealsByElection(electionId),
        apiService.getManifestsByElection(electionId)
      ]);

      setAssets(assetsData);
      setChainOfCustody(custodyData);
      setSeals(sealsData);
      setManifests(manifestsData);
    } catch (error) {
      console.error('Failed to load election assets:', error);
      await loadMockElectionData();
    }
  };

  const loadMockElectionData = async () => {
    // Mock election-specific data
    const mockAssets = [
      { AssetID: 1, SerialNumber: 'SCN-4457', Type: 'Scanner', Model: 'DS200', Status: 'Assigned', LocationName: 'Site 27 - Community Center', SealNumber: '99201' },
      { AssetID: 2, SerialNumber: 'SCN-4458', Type: 'Scanner', Model: 'DS200', Status: 'Assigned', LocationName: 'Site 28 - Elementary School', SealNumber: '99204' },
      { AssetID: 3, SerialNumber: 'PMD-1001', Type: 'PMD', Model: 'ExpressPoll 5000', Status: 'Assigned', LocationName: 'Site 27 - Community Center', SealNumber: '99202' },
      { AssetID: 4, SerialNumber: 'PMD-1002', Type: 'PMD', Model: 'ExpressPoll 5000', Status: 'Assigned', LocationName: 'Site 28 - Elementary School', SealNumber: '99205' },
      { AssetID: 5, SerialNumber: 'BB-2001', Type: 'BallotBox', Model: 'Standard', Status: 'Assigned', LocationName: 'Site 27 - Community Center', SealNumber: '99203' },
      { AssetID: 6, SerialNumber: 'BB-2002', Type: 'BallotBox', Model: 'Standard', Status: 'Assigned', LocationName: 'Site 28 - Elementary School', SealNumber: '99206' }
    ];

    const mockCustody = [
      { EventID: 1, AssetID: 1, FromParty: 'Warehouse Staff: John Smith', ToParty: 'Courier: Sarah Garcia', DateTime: '2024-10-29T08:00:00Z', SealNumber: '99201' },
      { EventID: 2, AssetID: 3, FromParty: 'Warehouse Staff: John Smith', ToParty: 'Courier: Sarah Garcia', DateTime: '2024-10-29T08:05:00Z', SealNumber: '99202' },
      { EventID: 3, AssetID: 5, FromParty: 'Warehouse Staff: John Smith', ToParty: 'Courier: Sarah Garcia', DateTime: '2024-10-29T08:10:00Z', SealNumber: '99203' }
    ];

    const mockSeals = [
      { SealNumber: '99201', Status: 'Used', AppliedToAssetID: 1, ElectionID: 1 },
      { SealNumber: '99202', Status: 'Used', AppliedToAssetID: 3, ElectionID: 1 },
      { SealNumber: '99203', Status: 'Used', AppliedToAssetID: 5, ElectionID: 1 },
      { SealNumber: '99204', Status: 'Used', AppliedToAssetID: 2, ElectionID: 1 },
      { SealNumber: '99205', Status: 'Used', AppliedToAssetID: 4, ElectionID: 1 },
      { SealNumber: '99206', Status: 'Used', AppliedToAssetID: 6, ElectionID: 1 },
      { SealNumber: '99207', Status: 'Available', AppliedToAssetID: null, ElectionID: 1 },
      { SealNumber: '99208', Status: 'Available', AppliedToAssetID: null, ElectionID: 1 }
    ];

    const mockManifests = [
      { ManifestID: 1, FromLocationName: 'Main Warehouse', ToLocationName: 'Site 27 - Community Center', Status: 'Created', CreatedDate: '2024-10-28T10:00:00Z' },
      { ManifestID: 2, FromLocationName: 'Main Warehouse', ToLocationName: 'Site 28 - Elementary School', Status: 'Created', CreatedDate: '2024-10-28T10:30:00Z' }
    ];

    setAssets(mockAssets);
    setChainOfCustody(mockCustody);
    setSeals(mockSeals);
    setManifests(mockManifests);
  };

  const handleElectionChange = async (election) => {
    setActiveElection(election);
    setIsLoading(true);
    await loadElectionAssets(election.ElectionID);
    setIsLoading(false);
  };

  const handleAssetClick = (asset) => {
    setSelectedAsset(asset);
    setShowAssetDetails(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'In Storage': 'bg-gray-100 text-gray-800',
      'Assigned': 'bg-blue-100 text-blue-800',
      'Out for Delivery': 'bg-yellow-100 text-yellow-800',
      'Delivered': 'bg-green-100 text-green-800',
      'In Maintenance': 'bg-orange-100 text-orange-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getAssetTypeIcon = (type) => {
    switch (type) {
      case 'Scanner': return <Scan className="h-5 w-5 text-blue-600" />;
      case 'PMD': return <Package className="h-5 w-5 text-green-600" />;
      case 'BallotBox': return <Package className="h-5 w-5 text-purple-600" />;
      default: return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Election Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Election Asset Management</h2>
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-500" />
            <select
              value={activeElection?.ElectionID || ''}
              onChange={(e) => {
                const election = elections.find(e => e.ElectionID === parseInt(e.target.value));
                if (election) handleElectionChange(election);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {elections.map((election) => (
                <option key={election.ElectionID} value={election.ElectionID}>
                  {election.Name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeElection && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">{activeElection.Name}</h3>
                <p className="text-sm text-blue-700">
                  {activeElection.StartDate} to {activeElection.EndDate}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'assets', label: 'Election Assets', icon: Package },
              { id: 'custody', label: 'Chain of Custody', icon: FileText },
              { id: 'seals', label: 'Security Seals', icon: Shield },
              { id: 'manifests', label: 'Delivery Manifests', icon: MapPin }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Assets Tab */}
          {activeTab === 'assets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Election Assets</h3>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search assets..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Plus className="h-4 w-4 inline mr-2" />
                    Add Asset
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {assets.map((asset) => (
                      <tr key={asset.AssetID} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            {getAssetTypeIcon(asset.Type)}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{asset.SerialNumber}</p>
                              <p className="text-sm text-gray-500">{asset.Model}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {asset.Type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(asset.Status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {asset.LocationName || 'Not assigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {asset.SealNumber ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Shield className="h-3 w-3 mr-1" />
                              {asset.SealNumber}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">No seal</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleAssetClick(asset)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Eye className="h-4 w-4 inline mr-1" />
                            View
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Edit className="h-4 w-4 inline mr-1" />
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Chain of Custody Tab */}
          {activeTab === 'custody' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Chain of Custody Events</h3>
              <div className="space-y-4">
                {chainOfCustody.map((event) => (
                  <div key={event.EventID} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <FileText className="h-5 w-5 text-blue-600 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Asset Transfer: {assets.find(a => a.AssetID === event.AssetID)?.SerialNumber}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            From: <span className="font-medium">{event.FromParty}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            To: <span className="font-medium">{event.ToParty}</span>
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-gray-500">
                              {new Date(event.DateTime).toLocaleString()}
                            </span>
                            {event.SealNumber && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Shield className="h-3 w-3 mr-1" />
                                Seal: {event.SealNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-900">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seals Tab */}
          {activeTab === 'seals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Security Seals</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Used: {seals.filter(s => s.Status === 'Used').length} | 
                    Available: {seals.filter(s => s.Status === 'Available').length}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {seals.map((seal) => (
                  <div key={seal.SealNumber} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">{seal.SealNumber}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        seal.Status === 'Used' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {seal.Status}
                      </span>
                    </div>
                    {seal.AppliedToAssetID && (
                      <p className="text-sm text-gray-600">
                        Applied to: {assets.find(a => a.AssetID === seal.AppliedToAssetID)?.SerialNumber}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manifests Tab */}
          {activeTab === 'manifests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Delivery Manifests</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus className="h-4 w-4 inline mr-2" />
                  Create Manifest
                </button>
              </div>

              <div className="space-y-4">
                {manifests.map((manifest) => (
                  <div key={manifest.ManifestID} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {manifest.FromLocationName} → {manifest.ToLocationName}
                          </p>
                          <p className="text-sm text-gray-600">
                            Created: {new Date(manifest.CreatedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(manifest.Status)}
                        <button className="text-blue-600 hover:text-blue-900">
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Asset Details Modal */}
      {showAssetDetails && selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Asset Details</h3>
              <button
                onClick={() => setShowAssetDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Serial Number</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedAsset.SerialNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedAsset.Type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Model</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedAsset.Model}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedAsset.Status)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Location</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedAsset.LocationName || 'Not assigned'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Security Seal</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedAsset.SealNumber || 'No seal applied'}</p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium mb-3">Chain of Custody History</h4>
                <div className="space-y-3">
                  {chainOfCustody
                    .filter(event => event.AssetID === selectedAsset.AssetID)
                    .map((event) => (
                      <div key={event.EventID} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {event.FromParty} → {event.ToParty}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(event.DateTime).toLocaleString()}
                            </p>
                          </div>
                          {event.SealNumber && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Shield className="h-3 w-3 mr-1" />
                              {event.SealNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAssetDetails(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Edit Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectionAssetManagement;
