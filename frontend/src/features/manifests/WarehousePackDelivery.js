import React, { useState, useEffect } from 'react';
import { Package, Scan, Check, AlertTriangle, Printer, Shield, MapPin, Calendar, CheckCircle, XCircle } from 'lucide-react';

const WarehousePackDelivery = () => {
  const [manifests, setManifests] = useState([]);
  const [selectedManifest, setSelectedManifest] = useState(null);
  const [manifestItems, setManifestItems] = useState([]);
  const [packedItems, setPackedItems] = useState(new Set());
  const [scannedCode, setScannedCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    fetchPendingManifests();
  }, []);

  useEffect(() => {
    if (selectedManifest) {
      fetchManifestItems();
    }
  }, [selectedManifest]);

  const fetchPendingManifests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/manifests?status=Created');
      const data = await response.json();
      setManifests(data);
    } catch (error) {
      console.error('Error fetching manifests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchManifestItems = async () => {
    try {
      const response = await fetch(`/api/manifests/${selectedManifest.manifestID}/items`);
      const data = await response.json();
      setManifestItems(data);
    } catch (error) {
      console.error('Error fetching manifest items:', error);
    }
  };

  const handleScanCode = (code) => {
    if (!code) return;

    // Find the asset by serial number
    const item = manifestItems.find(item => 
      item.serialNumber.toLowerCase() === code.toLowerCase()
    );

    if (item) {
      if (packedItems.has(item.assetID)) {
        setErrors({ scan: `${item.serialNumber} is already packed` });
      } else {
        setPackedItems(new Set([...packedItems, item.assetID]));
        setErrors({});
        // Show success feedback
        setTimeout(() => setScannedCode(''), 2000);
      }
    } else {
      setErrors({ scan: `Asset ${code} not found in this manifest` });
    }
    
    setScannedCode('');
  };

  const toggleItemPacked = (assetId) => {
    const newPackedItems = new Set(packedItems);
    if (newPackedItems.has(assetId)) {
      newPackedItems.delete(assetId);
    } else {
      newPackedItems.add(assetId);
    }
    setPackedItems(newPackedItems);
    setErrors({});
  };

  const completeManifest = async () => {
    if (packedItems.size !== manifestItems.length) {
      setErrors({ complete: 'All items must be packed before completing' });
      return;
    }

    try {
      // Update manifest status
      await fetch(`/api/manifests/${selectedManifest.manifestID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selectedManifest,
          status: 'ReadyForDispatch'
        })
      });

      // Update asset statuses
      for (const item of manifestItems) {
        await fetch(`/api/assets/${item.assetID}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'Out for Delivery',
            locationID: selectedManifest.toLocationID,
            electionID: selectedManifest.electionID,
            userID: 1,
            notes: 'Packed and ready for delivery'
          })
        });
      }

      // Redirect to courier handoff
      window.location.href = `/warehouse/courier-handoff/${selectedManifest.manifestID}`;

    } catch (error) {
      console.error('Error completing manifest:', error);
      setErrors({ complete: 'Failed to complete manifest. Please try again.' });
    }
  };

  const printManifest = () => {
    window.print();
  };

  const ManifestSelector = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select Manifest to Pack</h2>
      
      {manifests.length === 0 ? (
        <div className="text-center py-8">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No manifests ready for packing</h3>
          <p className="text-gray-500">All manifests have been packed or no manifests exist.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {manifests.map((manifest) => (
            <div
              key={manifest.manifestID}
              onClick={() => setSelectedManifest(manifest)}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{manifest.toLocation}</h3>
                  <p className="text-sm text-gray-600">{manifest.electionName}</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {manifest.status}
                </span>
              </div>
              
              <div className="space-y-1 text-sm text-gray-500">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>From: {manifest.fromLocation}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Created: {new Date(manifest.createdDate).toLocaleDateString()}</span>
                </div>
              </div>
              
              <button className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium">
                Start Packing
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const PackingInterface = () => {
    const packedCount = packedItems.size;
    const totalCount = manifestItems.length;
    const isComplete = packedCount === totalCount;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Packing Manifest</h2>
              <p className="text-gray-600">{selectedManifest.toLocation}</p>
              <p className="text-sm text-gray-500">{selectedManifest.electionName}</p>
            </div>
            <button
              onClick={() => setSelectedManifest(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Back to Manifests
            </button>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress: {packedCount} of {totalCount} items packed
              </span>
              <span className={`text-sm font-medium ${isComplete ? 'text-green-600' : 'text-blue-600'}`}>
                {Math.round((packedCount / totalCount) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`}
                style={{ width: `${(packedCount / totalCount) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Scanner */}
          <div className="border-t pt-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Scan or enter asset serial number..."
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleScanCode(scannedCode)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg"
                  autoFocus
                />
              </div>
              <button
                onClick={() => handleScanCode(scannedCode)}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
              >
                <Scan className="h-5 w-5" />
              </button>
            </div>
            
            {errors.scan && (
              <div className="flex items-center mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700">{errors.scan}</p>
              </div>
            )}
          </div>
        </div>

        {/* Items List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Items to Pack</h3>
          
          <div className="space-y-3">
            {manifestItems.map((item) => {
              const isPacked = packedItems.has(item.assetID);
              
              return (
                <div
                  key={item.assetID}
                  className={`border rounded-lg p-4 transition-all ${
                    isPacked 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Package className="h-5 w-5 text-gray-500 mr-2" />
                        <h4 className="font-semibold text-gray-900">{item.serialNumber}</h4>
                        {isPacked && <CheckCircle className="h-5 w-5 text-green-500 ml-2" />}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        {item.type} {item.model && `- ${item.model}`}
                      </p>
                      
                      {item.sealNumber && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Shield className="h-4 w-4 mr-1" />
                          <span>Seal: {item.sealNumber}</span>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => toggleItemPacked(item.assetID)}
                      className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                        isPacked
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {isPacked ? (
                        <>
                          <Check className="h-5 w-5 mr-2 inline" />
                          Packed
                        </>
                      ) : (
                        'Mark Packed'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Complete Packing</h3>
              <p className="text-gray-600">
                {isComplete 
                  ? 'All items packed and ready for dispatch'
                  : `${totalCount - packedCount} items remaining`
                }
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={printManifest}
                className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                <Printer className="h-5 w-5 mr-2" />
                Print
              </button>
              
              <button
                onClick={completeManifest}
                disabled={!isComplete}
                className={`flex items-center px-6 py-3 rounded-lg font-medium ${
                  isComplete
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isComplete ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Complete & Ready for Dispatch
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 mr-2" />
                    Pack All Items First
                  </>
                )}
              </button>
            </div>
          </div>
          
          {errors.complete && (
            <div className="flex items-center mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{errors.complete}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading manifests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pack for Delivery</h1>
          <p className="text-gray-600">
            {selectedManifest 
              ? 'Scan or check off items as they are packed'
              : 'Select a manifest to start packing'
            }
          </p>
        </div>

        {/* Content */}
        {selectedManifest ? <PackingInterface /> : <ManifestSelector />}
      </div>
    </div>
  );
};

export default WarehousePackDelivery;
