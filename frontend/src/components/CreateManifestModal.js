import React, { useState, useEffect } from 'react';
import { X, Package, MapPin, CheckSquare, Square } from 'lucide-react';
import { getPollSites } from '../features/pollsites/pollSiteApi';
import { getAvailableAssets } from '../features/assets/assetsApi';
import { createManifestWithAssets } from '../features/manifest/manifestApi';

export default function CreateManifestModal({ isOpen, onClose, onSuccess }) {
  const [pollSites, setPollSites] = useState([]);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [selectedPollSite, setSelectedPollSite] = useState('');
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadData();
      // Reset form
      setSelectedPollSite('');
      setSelectedAssets([]);
      setError('');
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pollSitesRes, assetsRes] = await Promise.all([
        getPollSites(),
        getAvailableAssets()
      ]);
      
      setPollSites(pollSitesRes.data || []);
      setAvailableAssets(assetsRes.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssetToggle = (assetId) => {
    setSelectedAssets(prev => 
      prev.includes(assetId)
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPollSite) {
      setError('Please select a poll site');
      return;
    }
    
    if (selectedAssets.length === 0) {
      setError('Please select at least one asset');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        pollSiteId: parseInt(selectedPollSite),
        electionId: 1, // TODO: Get from context or user selection
        assetIds: selectedAssets,
        fromFacilityId: 1 // Default warehouse
      };

      await createManifestWithAssets(payload);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating manifest:', err);
      setError(err.response?.data?.message || 'Failed to create manifest. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const groupedAssets = availableAssets.reduce((acc, asset) => {
    const type = asset.assetType || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(asset);
    return acc;
  }, {});

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Create New Manifest</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={submitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading data...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Poll Site Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Select Poll Site *
                </label>
                <select
                  value={selectedPollSite}
                  onChange={(e) => setSelectedPollSite(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a poll site...</option>
                  {pollSites.map(site => (
                    <option key={site.pollSiteId} value={site.pollSiteId}>
                      {site.displayName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Asset Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Package className="h-4 w-4 inline mr-1" />
                  Select Assets * ({selectedAssets.length} selected)
                </label>
                
                {Object.keys(groupedAssets).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No available assets found</p>
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-md max-h-96 overflow-y-auto">
                    {Object.entries(groupedAssets).map(([assetType, assets]) => (
                      <div key={assetType} className="border-b border-gray-200 last:border-b-0">
                        <div className="bg-gray-50 px-4 py-2 font-medium text-gray-700">
                          {assetType} ({assets.length})
                        </div>
                        <div className="divide-y divide-gray-100">
                          {assets.map(asset => (
                            <div
                              key={asset.id}
                              className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleAssetToggle(asset.id)}
                            >
                              <div className="flex-shrink-0 mr-3">
                                {selectedAssets.includes(asset.id) ? (
                                  <CheckSquare className="h-5 w-5 text-blue-600" />
                                ) : (
                                  <Square className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {asset.serialNumber}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {asset.location} • {asset.status}
                                </p>
                              </div>
                              {asset.barcode && (
                                <div className="text-xs text-gray-400 font-mono">
                                  {asset.barcode}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || loading || !selectedPollSite || selectedAssets.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating...' : 'Create Manifest'}
          </button>
        </div>
      </div>
    </div>
  );
}
