import React, { useState, useEffect } from 'react';
import { Scan, Package, Shield, AlertTriangle, Check, RotateCcw, Calendar, MapPin, FileText } from 'lucide-react';

const WarehouseReceiveReturns = () => {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [scannedCode, setScannedCode] = useState('');
  const [currentAsset, setCurrentAsset] = useState(null);
  const [returnData, setReturnData] = useState({
    sealNumber: '',
    condition: 'Good',
    damages: '',
    notes: ''
  });
  const [processedReturns, setProcessedReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/elections');
      const data = await response.json();
      // Filter to elections that might have returns (past or current)
      const eligibleElections = data.filter(election => 
        new Date(election.startDate) <= new Date()
      );
      setElections(eligibleElections);
    } catch (error) {
      console.error('Error fetching elections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScanAsset = async (code) => {
    if (!code || !selectedElection) return;

    try {
      setErrors({});
      
      // Find asset by serial number
      const response = await fetch(`/api/assets/serial/${encodeURIComponent(code)}`);
      
      if (!response.ok) {
        setErrors({ scan: `Asset ${code} not found` });
        return;
      }

      const asset = await response.json();

      // Check if asset was assigned to this election
      const statusResponse = await fetch(`/api/assets/${asset.assetID}/history`);
      const statusHistory = await statusResponse.json();
      
      const wasAssignedToElection = statusHistory.some(status => 
        status.electionName === selectedElection.name && 
        ['Assigned', 'Out for Delivery', 'Delivered'].includes(status.status)
      );

      if (!wasAssignedToElection) {
        setErrors({ scan: `Asset ${code} was not assigned to ${selectedElection.name}` });
        return;
      }

      // Check if already processed
      if (processedReturns.find(r => r.assetID === asset.assetID)) {
        setErrors({ scan: `Asset ${code} has already been processed` });
        return;
      }

      setCurrentAsset(asset);
      
      // Try to get current seal information
      const sealsResponse = await fetch(`/api/seals/asset/${asset.assetID}`);
      if (sealsResponse.ok) {
        const seals = await sealsResponse.json();
        const currentSeal = seals.find(seal => seal.status === 'Used');
        if (currentSeal) {
          setReturnData({ ...returnData, sealNumber: currentSeal.sealNumber });
        }
      }

    } catch (error) {
      console.error('Error scanning asset:', error);
      setErrors({ scan: 'Error looking up asset. Please try again.' });
    }
    
    setScannedCode('');
  };

  const processReturn = async () => {
    if (!currentAsset || !selectedElection) return;

    setProcessing(true);
    try {
      // Update asset status back to storage
      await fetch(`/api/assets/${currentAsset.assetID}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: returnData.condition === 'Damaged' ? 'In Maintenance' : 'In Storage',
          locationID: 1, // Main warehouse
          electionID: selectedElection.electionID,
          userID: 1,
          notes: `Returned from ${selectedElection.name}. Condition: ${returnData.condition}. ${returnData.notes}`
        })
      });

      // Handle seal status
      if (returnData.sealNumber) {
        const sealStatus = returnData.condition === 'Good' ? 'Used' : 'Broken';
        await fetch(`/api/seals/${returnData.sealNumber}/break`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brokenBy: 1,
            notes: `Seal removed during return processing. Asset condition: ${returnData.condition}`
          })
        });
      }

      // Create chain of custody event for return
      await fetch('/api/chainofcustody', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          electionID: selectedElection.electionID,
          assetID: currentAsset.assetID,
          fromParty: `Poll Site: ${currentAsset.locationName || 'Unknown'}`,
          toParty: `Warehouse Staff: ${getCurrentUser()}`,
          sealNumber: returnData.sealNumber,
          notes: `Asset returned after ${selectedElection.name}. Condition: ${returnData.condition}. ${returnData.damages ? `Damages: ${returnData.damages}` : ''}`
        })
      });

      // Log activity
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetID: currentAsset.assetID,
          electionID: selectedElection.electionID,
          activityCodeID: 7, // RETURNED
          userID: 1,
          notes: `Returned from ${selectedElection.name}. Condition: ${returnData.condition}`
        })
      });

      // Add to processed returns
      const processedReturn = {
        ...currentAsset,
        ...returnData,
        processedAt: new Date().toISOString(),
        processedBy: getCurrentUser()
      };
      setProcessedReturns([...processedReturns, processedReturn]);

      // Reset form
      setCurrentAsset(null);
      setReturnData({
        sealNumber: '',
        condition: 'Good',
        damages: '',
        notes: ''
      });
      setErrors({});

    } catch (error) {
      console.error('Error processing return:', error);
      setErrors({ process: 'Failed to process return. Please try again.' });
    } finally {
      setProcessing(false);
    }
  };

  const getCurrentUser = () => {
    // In a real app, this would come from authentication context
    return 'John Smith';
  };

  const ElectionSelector = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Election</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {elections.map((election) => (
          <button
            key={election.electionID}
            onClick={() => setSelectedElection(election)}
            className={`p-4 border rounded-lg text-left transition-all ${
              selectedElection?.electionID === election.electionID
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <h3 className="font-medium text-gray-900">{election.name}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
            </p>
            {election.notes && (
              <p className="text-xs text-gray-500 mt-1">{election.notes}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const ScannerInterface = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Scan Returned Asset</h2>
      
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Scan or enter asset serial number..."
            value={scannedCode}
            onChange={(e) => setScannedCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleScanAsset(scannedCode)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg"
            autoFocus
          />
        </div>
        <button
          onClick={() => handleScanAsset(scannedCode)}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
        >
          <Scan className="h-5 w-5" />
        </button>
      </div>

      {errors.scan && (
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-700">{errors.scan}</p>
        </div>
      )}
    </div>
  );

  const AssetReturnForm = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Process Return</h2>
          <div className="flex items-center mt-2">
            <Package className="h-5 w-5 text-gray-500 mr-2" />
            <span className="font-medium">{currentAsset.serialNumber}</span>
          </div>
          <p className="text-sm text-gray-600">{currentAsset.type} {currentAsset.model && `- ${currentAsset.model}`}</p>
        </div>
        <button
          onClick={() => setCurrentAsset(null)}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Shield className="inline h-4 w-4 mr-1" />
            Seal Number
          </label>
          <input
            type="text"
            value={returnData.sealNumber}
            onChange={(e) => setReturnData({ ...returnData, sealNumber: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter seal number if present"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Asset Condition *
          </label>
          <select
            value={returnData.condition}
            onChange={(e) => setReturnData({ ...returnData, condition: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Good">Good - No issues</option>
            <option value="Minor Wear">Minor Wear - Normal usage</option>
            <option value="Damaged">Damaged - Needs repair</option>
            <option value="Missing">Missing - Asset not returned</option>
          </select>
        </div>
      </div>

      {returnData.condition === 'Damaged' && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Damage Description *
          </label>
          <textarea
            value={returnData.damages}
            onChange={(e) => setReturnData({ ...returnData, damages: e.target.value })}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe the damage in detail..."
          />
        </div>
      )}

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes
        </label>
        <textarea
          value={returnData.notes}
          onChange={(e) => setReturnData({ ...returnData, notes: e.target.value })}
          rows={2}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          placeholder="Any additional notes about this return..."
        />
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={processReturn}
          disabled={processing || (returnData.condition === 'Damaged' && !returnData.damages)}
          className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium disabled:opacity-50"
        >
          {processing ? (
            'Processing...'
          ) : (
            <>
              <Check className="h-5 w-5 mr-2" />
              Process Return
            </>
          )}
        </button>
      </div>

      {errors.process && (
        <div className="flex items-center mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-700">{errors.process}</p>
        </div>
      )}
    </div>
  );

  const ProcessedReturnsList = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Processed Returns ({processedReturns.length})
      </h2>
      
      {processedReturns.length === 0 ? (
        <div className="text-center py-8">
          <RotateCcw className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No returns processed yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {processedReturns.map((returnItem, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{returnItem.serialNumber}</h4>
                  <p className="text-sm text-gray-600">{returnItem.type} {returnItem.model && `- ${returnItem.model}`}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span>Condition: </span>
                    <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                      returnItem.condition === 'Good' ? 'bg-green-100 text-green-800' :
                      returnItem.condition === 'Minor Wear' ? 'bg-yellow-100 text-yellow-800' :
                      returnItem.condition === 'Damaged' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {returnItem.condition}
                    </span>
                  </div>
                  {returnItem.sealNumber && (
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Shield className="h-4 w-4 mr-1" />
                      <span>Seal: {returnItem.sealNumber}</span>
                    </div>
                  )}
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>{new Date(returnItem.processedAt).toLocaleTimeString()}</p>
                  <p>by {returnItem.processedBy}</p>
                </div>
              </div>
              
              {returnItem.damages && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-800">
                    <strong>Damages:</strong> {returnItem.damages}
                  </p>
                </div>
              )}
              
              {returnItem.notes && (
                <div className="mt-2 p-2 bg-gray-50 rounded">
                  <p className="text-sm text-gray-700">{returnItem.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading elections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Receive Returns</h1>
          <p className="text-gray-600">
            Check in assets returned after election day
          </p>
          {selectedElection && (
            <div className="mt-4 flex items-center text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <Calendar className="h-5 w-5 mr-2" />
              <span>Processing returns for: <strong>{selectedElection.name}</strong></span>
            </div>
          )}
        </div>

        {/* Election Selection */}
        {!selectedElection && <ElectionSelector />}

        {/* Main Interface */}
        {selectedElection && (
          <>
            <ScannerInterface />
            {currentAsset && <AssetReturnForm />}
            <ProcessedReturnsList />
          </>
        )}
      </div>
    </div>
  );
};

export default WarehouseReceiveReturns;
