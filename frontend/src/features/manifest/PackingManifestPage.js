import React, { useState, useEffect } from 'react';
import { Plus, Package, Archive } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import CreateManifestModal from '../../components/CreateManifestModal';
import {
  getManifestsWithDetails,
  getManifestWithDetails,
  packManifestItem,
  finishPacking
} from './manifestApi';
import { getPackedKits, getKitDetails } from '../kits/kitsApi';

export default function PackingManifestPage() {
  const [activeTab, setActiveTab] = useState('packing');
  const [manifests, setManifests] = useState([]);
  const [selectedManifestId, setSelectedManifestId] = useState(null);
  const [selectedManifest, setSelectedManifest] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Packed kits state
  const [packedKits, setPackedKits] = useState([]);
  const [selectedKitId, setSelectedKitId] = useState(null);
  const [selectedKit, setSelectedKit] = useState(null);
  const [loadingKits, setLoadingKits] = useState(false);
  const [loadingKitDetail, setLoadingKitDetail] = useState(false);

  // load manifests ready for packing
  useEffect(() => {
    loadManifestsList();
  }, []);

  // load manifest details when selected
  useEffect(() => {
    if (!selectedManifestId) return;
    loadManifestDetails();
  }, [selectedManifestId]);

  const loadManifestsList = async () => {
    setLoadingList(true);
    try {
      const res = await getManifestsWithDetails('ReadyForPacking');
      setManifests(res.data);
    } catch (error) {
      console.error('Error loading manifests:', error);
    } finally {
      setLoadingList(false);
    }
  };

  const loadManifestDetails = async () => {
    setLoadingDetail(true);
    try {
      const res = await getManifestWithDetails(selectedManifestId);
      setSelectedManifest(res.data);
    } catch (error) {
      console.error('Error loading manifest details:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSelectManifest = (id) => {
    setSelectedManifestId(id);
  };

  const handlePackItem = async (assetId) => {
    if (!selectedManifestId) return;
    try {
      await packManifestItem(selectedManifestId, assetId);
      // reload manifest details to reflect packing status
      await loadManifestDetails();
    } catch (error) {
      console.error('Error packing item:', error);
    }
  };

  const handleFinishPacking = async () => {
    if (!selectedManifestId) return;
    try {
      await finishPacking(selectedManifestId);
      // refresh list and clear selection
      await loadManifestsList();
      setSelectedManifestId(null);
      setSelectedManifest(null);
      
      // Load packed kits and switch to packed kits tab to show the newly created kit
      await loadPackedKits();
      setActiveTab('packed-kits');
    } catch (error) {
      console.error('Error finishing packing:', error);
    }
  };

  const handleCreateManifestSuccess = async () => {
    // Refresh the manifests list after successful creation
    await loadManifestsList();
  };

  // Packed kits functions
  const loadPackedKits = async () => {
    setLoadingKits(true);
    try {
      const res = await getPackedKits();
      setPackedKits(res.data);
    } catch (error) {
      console.error('Error loading packed kits:', error);
    } finally {
      setLoadingKits(false);
    }
  };

  const loadKitDetails = async () => {
    if (!selectedKitId) return;
    setLoadingKitDetail(true);
    try {
      const res = await getKitDetails(selectedKitId);
      setSelectedKit(res.data);
    } catch (error) {
      console.error('Error loading kit details:', error);
    } finally {
      setLoadingKitDetail(false);
    }
  };

  const handleSelectKit = (id) => {
    setSelectedKitId(id);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'packed-kits') {
      loadPackedKits();
    }
  };

  // Load kit details when selected
  useEffect(() => {
    if (!selectedKitId) return;
    loadKitDetails();
  }, [selectedKitId]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar links={['Dashboard', 'Inventory', 'Packing', 'Custody']} />
      <div className="flex-1 flex flex-col">
        <TopBar title="Packing" />
        <main className="flex-1 p-6">
          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => handleTabChange('packing')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'packing'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Package className="h-5 w-5 inline mr-2" />
                  Active Packing
                </button>
                <button
                  onClick={() => handleTabChange('packed-kits')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'packed-kits'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Archive className="h-5 w-5 inline mr-2" />
                  Packed Kits
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'packing' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Left Pane: Manifest list */}
              <div className="col-span-1 bg-white rounded-lg shadow p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium">Manifests Ready for Packing</h2>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create
                  </button>
                </div>
                {loadingList ? (
                  <p>Loading manifests...</p>
                ) : (
                  <ul>
                    {manifests.map(m => (
                      <li
                        key={m.manifestId}
                        className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${m.manifestId === selectedManifestId ? 'bg-blue-50 border-blue-200' : ''}`}
                        onClick={() => handleSelectManifest(m.manifestId)}
                      >
                        <p className="font-semibold">{m.manifestNumber}</p>
                        <p className="text-sm text-gray-600 mt-1">{m.pollSiteDisplayName}</p>
                        <p className="text-sm text-gray-500">Election: {m.electionId}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-500">{m.packedCount}/{m.itemCount} packed</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${m.itemCount > 0 ? (m.packedCount / m.itemCount) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </li>
                    ))}
                    {manifests.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No manifests ready for packing.</p>
                        <p className="text-sm mt-1">Create a new manifest to get started.</p>
                      </div>
                    )}
                  </ul>
                )}
              </div>

              {/* Right Pane: Manifest details */}
              <div className="col-span-2 bg-white rounded-lg shadow p-4">
                {!selectedManifest && !loadingDetail && (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <p>Select a manifest to view details.</p>
                  </div>
                )}
                {loadingDetail && (
                  <div className="flex items-center justify-center h-64">
                    <p>Loading manifest details...</p>
                  </div>
                )}
                {selectedManifest && !loadingDetail && (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium">
                        Manifest {selectedManifest.manifestNumber} – Items
                      </h2>
                      <div className="text-sm text-gray-500">
                        Status: <span className="font-medium">{selectedManifest.status}</span>
                      </div>
                    </div>
                    
                    {selectedManifest.items && selectedManifest.items.length > 0 ? (
                      <>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Type</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seal #</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {selectedManifest.items.map(item => (
                                <tr key={item.manifestItemId} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {item.assetSerialNumber}
                                    <div className="text-xs text-gray-500">ID: {item.assetId}</div>
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.assetType}</td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 font-mono">{item.sealNumber}</td>
                                  <td className="px-4 py-2 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      item.isPacked 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {item.isPacked ? 'Packed' : 'Pending'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                                    {!item.isPacked && (
                                      <button
                                        onClick={() => handlePackItem(item.assetId)}
                                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                      >
                                        Mark Packed
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="mt-6 flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            Progress: {selectedManifest.items.filter(i => i.isPacked).length} of {selectedManifest.items.length} items packed
                          </div>
                          <button
                            onClick={handleFinishPacking}
                            disabled={selectedManifest.items.some(i => !i.isPacked)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Finish Packing
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No items in this manifest.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Packed Kits Tab Content */}
          {activeTab === 'packed-kits' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Left Pane: Packed kits list */}
              <div className="col-span-1 bg-white rounded-lg shadow p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium">Packed Kits</h2>
                  <button
                    onClick={loadPackedKits}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Refresh
                  </button>
                </div>
                {loadingKits ? (
                  <p>Loading packed kits...</p>
                ) : (
                  <ul>
                    {packedKits.map(kit => (
                      <li
                        key={kit.kitId}
                        className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${kit.kitId === selectedKitId ? 'bg-blue-50 border-blue-200' : ''}`}
                        onClick={() => handleSelectKit(kit.kitId)}
                      >
                        <p className="font-semibold">{kit.name}</p>
                        <p className="text-sm text-gray-600 mt-1">{kit.pollSiteName}</p>
                        <p className="text-sm text-gray-500">Type: {kit.type}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-500">{kit.assetCount} assets</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800`}>
                            {kit.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Created: {new Date(kit.createdDate).toLocaleDateString()}
                        </p>
                      </li>
                    ))}
                    {packedKits.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No packed kits found.</p>
                        <p className="text-sm mt-1">Kits will appear here after packing is completed.</p>
                      </div>
                    )}
                  </ul>
                )}
              </div>

              {/* Right Pane: Kit details */}
              <div className="col-span-2 bg-white rounded-lg shadow p-4">
                {!selectedKit && !loadingKitDetail && (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <p>Select a kit to view details.</p>
                  </div>
                )}
                {loadingKitDetail && (
                  <div className="flex items-center justify-center h-64">
                    <p>Loading kit details...</p>
                  </div>
                )}
                {selectedKit && !loadingKitDetail && (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium">
                        {selectedKit.name} – Assets
                      </h2>
                      <div className="text-sm text-gray-500">
                        Status: <span className="font-medium">{selectedKit.status}</span>
                      </div>
                    </div>
                    
                    {selectedKit.assets && selectedKit.assets.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Type</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Date</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedKit.assets.map(asset => (
                              <tr key={asset.assetId} className="hover:bg-gray-50">
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {asset.serialNumber}
                                  <div className="text-xs text-gray-500">ID: {asset.assetId}</div>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{asset.assetType}</td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    asset.status === 'Pending' 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-green-100 text-green-800'
                                  }`}>
                                    {asset.status}
                                  </span>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(asset.assignedDate).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No assets in this kit.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Create Manifest Modal */}
      <CreateManifestModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateManifestSuccess}
      />
    </div>
  );
}
