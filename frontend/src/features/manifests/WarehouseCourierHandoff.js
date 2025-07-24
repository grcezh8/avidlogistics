import React, { useState, useEffect } from 'react';
import { User, Truck, Shield, Camera, FileText, Check, AlertTriangle, Signature } from 'lucide-react';

const WarehouseCourierHandoff = () => {
  const [manifests, setManifests] = useState([]);
  const [selectedManifest, setSelectedManifest] = useState(null);
  const [manifestItems, setManifestItems] = useState([]);
  const [handoffData, setHandoffData] = useState({
    courierName: '',
    courierPhone: '',
    courierLicense: '',
    truckId: '',
    signature: '',
    notes: ''
  });
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [signatureCanvas, setSignatureCanvas] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    fetchReadyManifests();
    fetchTrucks();
  }, []);

  useEffect(() => {
    if (selectedManifest) {
      fetchManifestItems();
    }
  }, [selectedManifest]);

  const fetchReadyManifests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/manifests?status=ReadyForDispatch');
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

  const fetchTrucks = async () => {
    try {
      const response = await fetch('/api/trucks');
      const data = await response.json();
      setTrucks(data.filter(truck => truck.isActive));
    } catch (error) {
      console.error('Error fetching trucks:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!handoffData.courierName.trim()) {
      newErrors.courierName = 'Courier name is required';
    }
    if (!handoffData.courierPhone.trim()) {
      newErrors.courierPhone = 'Courier phone is required';
    }
    if (!handoffData.courierLicense.trim()) {
      newErrors.courierLicense = 'Driver license is required';
    }
    if (!handoffData.truckId) {
      newErrors.truckId = 'Please select a truck';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const initializeSignatureCanvas = (canvas) => {
    if (!canvas) return;
    
    setSignatureCanvas(canvas);
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  };

  const startDrawing = (e) => {
    if (!signatureCanvas) return;
    setIsDrawing(true);
    
    const rect = signatureCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = signatureCanvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || !signatureCanvas) return;
    
    const rect = signatureCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = signatureCanvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    if (!signatureCanvas) return;
    const ctx = signatureCanvas.getContext('2d');
    ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
  };

  const captureSignature = () => {
    if (!signatureCanvas) return '';
    return signatureCanvas.toDataURL();
  };

  const submitHandoff = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const signature = captureSignature();
      
      // Create chain of custody events for each asset
      for (const item of manifestItems) {
        const custodyEvent = {
          electionID: selectedManifest.electionID,
          assetID: item.assetID,
          fromParty: `Warehouse Staff: ${getCurrentUser()}`,
          toParty: `Courier: ${handoffData.courierName}`,
          sealNumber: item.sealNumber,
          notes: `Handed off for delivery to ${selectedManifest.toLocation}. Truck: ${getTruckInfo(handoffData.truckId)}. ${handoffData.notes}`
        };

        const response = await fetch('/api/chainofcustody', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(custodyEvent)
        });

        if (!response.ok) throw new Error('Failed to create custody event');
        
        const event = await response.json();

        // Upload signature as scanned form if signature exists
        if (signature && signature !== 'data:,') {
          await fetch(`/api/chainofcustody/${event.eventID}/upload-form`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uploadedBy: 1, // Current user ID
              formType: 'Chain of Custody',
              notes: 'Digital signature capture',
              imageData: signature
            })
          });
        }

        // Update asset status
        await fetch(`/api/assets/${item.assetID}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'Out for Delivery',
            locationID: selectedManifest.toLocationID,
            electionID: selectedManifest.electionID,
            userID: 1,
            notes: `In transit with courier ${handoffData.courierName}`
          })
        });
      }

      // Update manifest status
      await fetch(`/api/manifests/${selectedManifest.manifestID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selectedManifest,
          status: 'InTransit',
          courierName: handoffData.courierName,
          truckId: handoffData.truckId
        })
      });

      // Success - redirect to dashboard
      window.location.href = '/warehouse/dashboard';

    } catch (error) {
      console.error('Error submitting handoff:', error);
      setErrors({ submit: 'Failed to complete handoff. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const getCurrentUser = () => {
    // In a real app, this would come from authentication context
    return 'John Smith';
  };

  const getTruckInfo = (truckId) => {
    const truck = trucks.find(t => t.id === parseInt(truckId));
    return truck ? `${truck.make} ${truck.model} (${truck.licensePlate})` : 'Unknown';
  };

  const ManifestSelector = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select Manifest for Handoff</h2>
      
      {manifests.length === 0 ? (
        <div className="text-center py-8">
          <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No manifests ready for handoff</h3>
          <p className="text-gray-500">Complete packing first before handing off to couriers.</p>
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
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Ready for Dispatch
                </span>
              </div>
              
              <div className="text-sm text-gray-500 mb-3">
                <p>From: {manifest.fromLocation}</p>
                <p>Packed: {new Date(manifest.modifiedDate).toLocaleDateString()}</p>
              </div>
              
              <button className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium">
                Start Handoff
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const HandoffInterface = () => (
    <div className="space-y-6">
      {/* Manifest Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Courier Handoff</h2>
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Assets Being Transferred</h3>
          <p className="text-blue-700">{manifestItems.length} items ready for delivery</p>
        </div>
      </div>

      {/* Courier Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <User className="inline h-5 w-5 mr-2" />
          Courier Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Courier Name *
            </label>
            <input
              type="text"
              value={handoffData.courierName}
              onChange={(e) => setHandoffData({ ...handoffData, courierName: e.target.value })}
              className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                errors.courierName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter courier's full name"
            />
            {errors.courierName && <p className="text-red-500 text-sm mt-1">{errors.courierName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={handoffData.courierPhone}
              onChange={(e) => setHandoffData({ ...handoffData, courierPhone: e.target.value })}
              className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                errors.courierPhone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="(555) 123-4567"
            />
            {errors.courierPhone && <p className="text-red-500 text-sm mt-1">{errors.courierPhone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Driver License Number *
            </label>
            <input
              type="text"
              value={handoffData.courierLicense}
              onChange={(e) => setHandoffData({ ...handoffData, courierLicense: e.target.value })}
              className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                errors.courierLicense ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="DL123456789"
            />
            {errors.courierLicense && <p className="text-red-500 text-sm mt-1">{errors.courierLicense}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Truck className="inline h-4 w-4 mr-1" />
              Truck *
            </label>
            <select
              value={handoffData.truckId}
              onChange={(e) => setHandoffData({ ...handoffData, truckId: e.target.value })}
              className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                errors.truckId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a truck...</option>
              {trucks.map(truck => (
                <option key={truck.id} value={truck.id}>
                  {truck.licensePlate} - {truck.make} {truck.model}
                </option>
              ))}
            </select>
            {errors.truckId && <p className="text-red-500 text-sm mt-1">{errors.truckId}</p>}
          </div>
        </div>
      </div>

      {/* Assets List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assets Being Transferred</h3>
        
        <div className="space-y-3">
          {manifestItems.map((item) => (
            <div key={item.assetID} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">{item.serialNumber}</h4>
                  <p className="text-sm text-gray-600">{item.type} {item.model && `- ${item.model}`}</p>
                  {item.sealNumber && (
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Shield className="h-4 w-4 mr-1" />
                      <span>Seal: {item.sealNumber}</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    Ready
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Digital Signature */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <Signature className="inline h-5 w-5 mr-2" />
          Digital Signature
        </h3>
        
        <div className="border border-gray-300 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-3">
            Courier signature confirming receipt of assets:
          </p>
          
          <div className="border border-gray-300 rounded-lg bg-gray-50">
            <canvas
              ref={initializeSignatureCanvas}
              width={600}
              height={200}
              className="w-full h-48 cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>
          
          <div className="flex justify-between items-center mt-3">
            <p className="text-xs text-gray-500">Sign above to confirm receipt</p>
            <button
              onClick={clearSignature}
              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
        <textarea
          value={handoffData.notes}
          onChange={(e) => setHandoffData({ ...handoffData, notes: e.target.value })}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          placeholder="Any additional notes about this handoff..."
        />
      </div>

      {/* Submit */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Complete Handoff</h3>
            <p className="text-gray-600">
              This will create chain-of-custody records and transfer assets to courier
            </p>
          </div>
          
          <button
            onClick={submitHandoff}
            disabled={submitting}
            className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium disabled:opacity-50"
          >
            {submitting ? (
              'Processing...'
            ) : (
              <>
                <Check className="h-5 w-5 mr-2" />
                Complete Handoff
              </>
            )}
          </button>
        </div>
        
        {errors.submit && (
          <div className="flex items-center mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{errors.submit}</p>
          </div>
        )}
      </div>
    </div>
  );

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Courier Handoff</h1>
          <p className="text-gray-600">
            {selectedManifest 
              ? 'Record official chain-of-custody transfer to courier'
              : 'Select a manifest ready for courier handoff'
            }
          </p>
        </div>

        {/* Content */}
        {selectedManifest ? <HandoffInterface /> : <ManifestSelector />}
      </div>
    </div>
  );
};

export default WarehouseCourierHandoff;
