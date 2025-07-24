import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Calendar, MapPin, Package, Shield, Plus, Trash2, Check, AlertTriangle } from 'lucide-react';

const WarehouseAssignAssets = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [elections, setElections] = useState([]);
  const [locations, setLocations] = useState([]);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [availableSeals, setAvailableSeals] = useState([]);
  const [formData, setFormData] = useState({
    electionId: '',
    fromLocationId: '',
    toLocationId: '',
    assignedAssets: [],
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (formData.electionId) {
      fetchAvailableAssets();
      fetchAvailableSeals();
    }
  }, [formData.electionId]);

  const fetchInitialData = async () => {
    try {
      // Fetch elections
      const electionsResponse = await fetch('/api/elections');
      const electionsData = await electionsResponse.json();
      setElections(electionsData);

      // Fetch locations
      const locationsResponse = await fetch('/api/locations');
      const locationsData = await locationsResponse.json();
      setLocations(locationsData);

    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchAvailableAssets = async () => {
    try {
      const response = await fetch('/api/assets/available');
      const data = await response.json();
      setAvailableAssets(data);
    } catch (error) {
      console.error('Error fetching available assets:', error);
    }
  };

  const fetchAvailableSeals = async () => {
    try {
      const response = await fetch(`/api/seals/available?electionId=${formData.electionId}`);
      const data = await response.json();
      setAvailableSeals(data);
    } catch (error) {
      console.error('Error fetching available seals:', error);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.electionId) newErrors.electionId = 'Please select an election';
        if (!formData.fromLocationId) newErrors.fromLocationId = 'Please select origin location';
        if (!formData.toLocationId) newErrors.toLocationId = 'Please select destination location';
        if (formData.fromLocationId === formData.toLocationId) {
          newErrors.toLocationId = 'Destination must be different from origin';
        }
        break;
      case 2:
        if (formData.assignedAssets.length === 0) {
          newErrors.assets = 'Please assign at least one asset';
        }
        break;
      case 3:
        // Check if all assets have seals assigned
        const assetsWithoutSeals = formData.assignedAssets.filter(asset => !asset.sealNumber);
        if (assetsWithoutSeals.length > 0) {
          newErrors.seals = `${assetsWithoutSeals.length} assets need seal assignments`;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const addAsset = (asset) => {
    const newAsset = {
      ...asset,
      sealNumber: ''
    };
    setFormData({
      ...formData,
      assignedAssets: [...formData.assignedAssets, newAsset]
    });
  };

  const removeAsset = (assetId) => {
    setFormData({
      ...formData,
      assignedAssets: formData.assignedAssets.filter(asset => asset.assetID !== assetId)
    });
  };

  const assignSeal = (assetId, sealNumber) => {
    setFormData({
      ...formData,
      assignedAssets: formData.assignedAssets.map(asset =>
        asset.assetID === assetId ? { ...asset, sealNumber } : asset
      )
    });
  };

  const submitManifest = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      // Create manifest
      const manifestResponse = await fetch('/api/manifests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          electionID: parseInt(formData.electionId),
          fromLocationID: parseInt(formData.fromLocationId),
          toLocationID: parseInt(formData.toLocationId),
          createdBy: 1, // Current user ID
          notes: formData.notes
        })
      });

      if (!manifestResponse.ok) throw new Error('Failed to create manifest');
      const manifest = await manifestResponse.json();

      // Add manifest items
      for (const asset of formData.assignedAssets) {
        await fetch('/api/manifestitems', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            manifestID: manifest.manifestID,
            assetID: asset.assetID,
            sealNumber: asset.sealNumber
          })
        });

        // Apply seals to assets
        if (asset.sealNumber) {
          await fetch(`/api/seals/${asset.sealNumber}/apply`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              assetID: asset.assetID,
              appliedBy: 1 // Current user ID
            })
          });
        }

        // Update asset status
        await fetch(`/api/assets/${asset.assetID}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'Assigned',
            locationID: parseInt(formData.toLocationId),
            electionID: parseInt(formData.electionId),
            userID: 1,
            notes: `Assigned to ${locations.find(l => l.locationID === parseInt(formData.toLocationId))?.name}`
          })
        });
      }

      // Success - redirect to manifest view
      window.location.href = `/warehouse/manifest/${manifest.manifestID}`;

    } catch (error) {
      console.error('Error creating manifest:', error);
      setErrors({ submit: 'Failed to create manifest. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
            step <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {step < currentStep ? <Check className="h-5 w-5" /> : step}
          </div>
          {step < 4 && (
            <ChevronRight className={`h-5 w-5 mx-2 ${
              step < currentStep ? 'text-blue-500' : 'text-gray-400'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const Step1ElectionAndLocation = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select Election and Locations</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            Election
          </label>
          <select
            value={formData.electionId}
            onChange={(e) => setFormData({ ...formData, electionId: e.target.value })}
            className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
              errors.electionId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select an election...</option>
            {elections.map(election => (
              <option key={election.electionID} value={election.electionID}>
                {election.name} ({new Date(election.startDate).toLocaleDateString()})
              </option>
            ))}
          </select>
          {errors.electionId && <p className="text-red-500 text-sm mt-1">{errors.electionId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline h-4 w-4 mr-1" />
            From Location (Origin)
          </label>
          <select
            value={formData.fromLocationId}
            onChange={(e) => setFormData({ ...formData, fromLocationId: e.target.value })}
            className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
              errors.fromLocationId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select origin location...</option>
            {locations.filter(loc => loc.type === 'Warehouse').map(location => (
              <option key={location.locationID} value={location.locationID}>
                {location.name} ({location.type})
              </option>
            ))}
          </select>
          {errors.fromLocationId && <p className="text-red-500 text-sm mt-1">{errors.fromLocationId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline h-4 w-4 mr-1" />
            To Location (Destination)
          </label>
          <select
            value={formData.toLocationId}
            onChange={(e) => setFormData({ ...formData, toLocationId: e.target.value })}
            className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
              errors.toLocationId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select destination location...</option>
            {locations.filter(loc => loc.type !== 'Warehouse').map(location => (
              <option key={location.locationID} value={location.locationID}>
                {location.name} ({location.type})
              </option>
            ))}
          </select>
          {errors.toLocationId && <p className="text-red-500 text-sm mt-1">{errors.toLocationId}</p>}
        </div>
      </div>
    </div>
  );

  const Step2SelectAssets = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select Assets</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Assets */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Available Assets</h3>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {availableAssets.filter(asset => 
              !formData.assignedAssets.find(assigned => assigned.assetID === asset.assetID)
            ).map(asset => (
              <div key={asset.assetID} className="border border-gray-200 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{asset.serialNumber}</p>
                  <p className="text-sm text-gray-600">{asset.type} {asset.model && `- ${asset.model}`}</p>
                </div>
                <button
                  onClick={() => addAsset(asset)}
                  className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Assets */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Assigned Assets ({formData.assignedAssets.length})
          </h3>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {formData.assignedAssets.map(asset => (
              <div key={asset.assetID} className="border border-gray-200 rounded-lg p-3 flex justify-between items-center bg-blue-50">
                <div>
                  <p className="font-medium">{asset.serialNumber}</p>
                  <p className="text-sm text-gray-600">{asset.type} {asset.model && `- ${asset.model}`}</p>
                </div>
                <button
                  onClick={() => removeAsset(asset.assetID)}
                  className="flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </button>
              </div>
            ))}
          </div>
          {errors.assets && <p className="text-red-500 text-sm mt-2">{errors.assets}</p>}
        </div>
      </div>
    </div>
  );

  const Step3AssignSeals = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Assign Seals</h2>
      
      <div className="space-y-4">
        {formData.assignedAssets.map(asset => (
          <div key={asset.assetID} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{asset.serialNumber}</h4>
                <p className="text-sm text-gray-600">{asset.type} {asset.model && `- ${asset.model}`}</p>
              </div>
              <div className="flex items-center">
                <Shield className={`h-5 w-5 mr-2 ${asset.sealNumber ? 'text-green-500' : 'text-gray-400'}`} />
                <span className={`text-sm ${asset.sealNumber ? 'text-green-600' : 'text-gray-500'}`}>
                  {asset.sealNumber ? 'Sealed' : 'No Seal'}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign Seal</label>
              <select
                value={asset.sealNumber || ''}
                onChange={(e) => assignSeal(asset.assetID, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a seal...</option>
                {availableSeals.filter(seal => 
                  !formData.assignedAssets.find(a => a.sealNumber === seal.sealNumber && a.assetID !== asset.assetID)
                ).map(seal => (
                  <option key={seal.sealNumber} value={seal.sealNumber}>
                    {seal.sealNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
        {errors.seals && (
          <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            <p className="text-yellow-700">{errors.seals}</p>
          </div>
        )}
      </div>
    </div>
  );

  const Step4Review = () => {
    const selectedElection = elections.find(e => e.electionID === parseInt(formData.electionId));
    const fromLocation = locations.find(l => l.locationID === parseInt(formData.fromLocationId));
    const toLocation = locations.find(l => l.locationID === parseInt(formData.toLocationId));

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Review Manifest</h2>
        
        <div className="space-y-6">
          {/* Election and Location Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Manifest Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Election</p>
                <p className="font-medium">{selectedElection?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">From</p>
                <p className="font-medium">{fromLocation?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">To</p>
                <p className="font-medium">{toLocation?.name}</p>
              </div>
            </div>
          </div>

          {/* Assets Summary */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Assets ({formData.assignedAssets.length})
            </h3>
            <div className="space-y-2">
              {formData.assignedAssets.map(asset => (
                <div key={asset.assetID} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium">{asset.serialNumber}</p>
                    <p className="text-sm text-gray-600">{asset.type} {asset.model && `- ${asset.model}`}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Seal</p>
                    <p className="font-medium">{asset.sealNumber || 'No Seal'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any additional notes for this manifest..."
            />
          </div>

          {errors.submit && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{errors.submit}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return <Step1ElectionAndLocation />;
      case 2: return <Step2SelectAssets />;
      case 3: return <Step3AssignSeals />;
      case 4: return <Step4Review />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assign Assets to Election</h1>
          <p className="text-gray-600">Create a new manifest for asset delivery</p>
        </div>

        {/* Step Indicator */}
        <StepIndicator />

        {/* Current Step Content */}
        {renderCurrentStep()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center px-6 py-3 rounded-lg font-medium ${
              currentStep === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Previous
          </button>

          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
            >
              Next
              <ChevronRight className="h-5 w-5 ml-2" />
            </button>
          ) : (
            <button
              onClick={submitManifest}
              disabled={loading}
              className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Manifest'}
              <Check className="h-5 w-5 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManifestPlanningPage;
