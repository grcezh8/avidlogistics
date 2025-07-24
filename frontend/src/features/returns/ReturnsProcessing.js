import React, { useState, useEffect } from 'react';
import { Package, Scan, AlertCircle, CheckCircle2, Camera, MapPin, User, FileText, Clock, RefreshCw, Eye, ChevronDown, ChevronUp, Smartphone, Monitor, Plus, Search } from 'lucide-react';
import apiService from '../../services/apiClient';

const ReturnsProcessing = () => {
  const [activeTab, setActiveTab] = useState('process');
  const [isMobile, setIsMobile] = useState(false);
  
  // Asset Return Form Data
  const [returnData, setReturnData] = useState({
    // Asset Information
    serialNumber: '',
    assetType: '',
    barcode: '',
    manufacturer: '',
    model: '',
    
    // Return Information
    returnedBy: '',
    returnLocation: '',
    returnReason: '',
    returnDate: new Date().toISOString().split('T')[0],
    
    // Condition Assessment
    conditionOnReturn: 1, // Default to Good
    conditionNotes: '',
    damageDescription: '',
    functionalStatus: 'working', // working, partial, not-working
    
    // Processing Information
    processedBy: '',
    warehouseLocation: 'Warehouse A',
    processingNotes: '',
    photoUrl: '',
    requiresMaintenance: false
  });

  const [conditions, setConditions] = useState([]);
  const [recentReturns, setRecentReturns] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [expandedReturn, setExpandedReturn] = useState(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  useEffect(() => {
    loadInitialData();
    // Detect if user is on mobile
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);

  const loadInitialData = async () => {
    try {
      const [conditionsData, recentData, statsData] = await Promise.all([
        apiService.getReturnConditions(),
        apiService.getRecentReturns(),
        apiService.getReturnStats()
      ]);

      setConditions(conditionsData);
      setRecentReturns(recentData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      // Set fallback data
      setConditions([
        { id: 0, name: 'Excellent', description: 'Perfect condition', requiresMaintenance: false },
        { id: 1, name: 'Good', description: 'Good condition with minor wear', requiresMaintenance: false },
        { id: 2, name: 'Fair', description: 'Moderate wear but functional', requiresMaintenance: false },
        { id: 3, name: 'Poor', description: 'Significant wear, needs maintenance', requiresMaintenance: true },
        { id: 4, name: 'Damaged', description: 'Major damage, requires repair', requiresMaintenance: true },
        { id: 5, name: 'Non-Functional', description: 'Not working, extensive repair needed', requiresMaintenance: true }
      ]);
      setStats({
        pendingReturns: 0,
        processedToday: 0,
        processedThisWeek: 0,
        requireingMaintenance: 0,
        assetsInWarehouse: 0
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReturnData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-set maintenance requirement based on condition
    if (name === 'conditionOnReturn') {
      const condition = conditions.find(c => c.id === parseInt(value));
      if (condition) {
        setReturnData(prev => ({
          ...prev,
          requiresMaintenance: condition.requiresMaintenance
        }));
      }
    }
  };

  const handleBarcodeScanned = (barcode) => {
    setReturnData(prev => ({
      ...prev,
      barcode: barcode
    }));
    setShowBarcodeScanner(false);
    setMessage('Barcode scanned successfully!');
    setMessageType('success');
    setTimeout(() => setMessage(null), 3000);
  };

  const simulateBarcodeScan = () => {
    const simulatedBarcode = `BC${Date.now().toString().slice(-6)}`;
    handleBarcodeScanned(simulatedBarcode);
  };

  const lookupAssetByBarcode = async () => {
    if (!returnData.barcode) {
      setMessage('Please enter a barcode first');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    try {
      const asset = await apiService.getAssetByBarcode(returnData.barcode);
      if (asset) {
        setReturnData(prev => ({
          ...prev,
          serialNumber: asset.SerialNumber || asset.serialNumber,
          assetType: asset.AssetType || asset.assetType,
          manufacturer: asset.Manufacturer || asset.manufacturer || '',
          model: asset.Model || asset.model || ''
        }));
        setMessage('Asset information loaded successfully!');
        setMessageType('success');
      } else {
        setMessage('Asset not found. Please fill in details manually.');
        setMessageType('warning');
      }
    } catch (error) {
      setMessage('Asset not found. Please fill in details manually.');
      setMessageType('warning');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!returnData.serialNumber || !returnData.assetType || !returnData.returnedBy || !returnData.returnLocation || !returnData.processedBy) {
      setMessage('Please fill in all required fields');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // First scan the returned asset
      const scanResult = await apiService.scanReturnedAsset(
        returnData.barcode || returnData.serialNumber,
        returnData.returnedBy,
        returnData.returnLocation,
        returnData.returnReason
      );

      if (scanResult.success) {
        // Then process the return
        const processResult = await apiService.processReturn(
          scanResult.assetReturnId,
          returnData.conditionOnReturn,
          returnData.conditionNotes,
          returnData.processingNotes,
          returnData.processedBy,
          returnData.photoUrl,
          returnData.warehouseLocation
        );

        if (processResult.success) {
          setMessage('Asset return processed successfully!');
          setMessageType('success');
          
          // Reset form
          setReturnData({
            serialNumber: '',
            assetType: '',
            barcode: '',
            manufacturer: '',
            model: '',
            returnedBy: '',
            returnLocation: '',
            returnReason: '',
            returnDate: new Date().toISOString().split('T')[0],
            conditionOnReturn: 1,
            conditionNotes: '',
            damageDescription: '',
            functionalStatus: 'working',
            processedBy: '',
            warehouseLocation: 'Warehouse A',
            processingNotes: '',
            photoUrl: '',
            requiresMaintenance: false
          });
          
          // Refresh data
          loadInitialData();
          setActiveTab('recent');
        } else {
          setMessage(processResult.message || 'Error processing return');
          setMessageType('error');
        }
      } else {
        setMessage(scanResult.message || 'Error scanning asset');
        setMessageType('error');
      }
    } catch (error) {
      setMessage(error.message || 'Error processing return');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getConditionBadgeColor = (conditionId) => {
    switch (conditionId) {
      case 0: return 'bg-green-100 text-green-800'; // Excellent
      case 1: return 'bg-blue-100 text-blue-800'; // Good
      case 2: return 'bg-yellow-100 text-yellow-800'; // Fair
      case 3: return 'bg-orange-100 text-orange-800'; // Poor
      case 4: return 'bg-red-100 text-red-800'; // Damaged
      case 5: return 'bg-gray-100 text-gray-800'; // Non-Functional
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <RefreshCw className="h-8 w-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Returns Processing</h2>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {isMobile ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
            <span>{isMobile ? 'Mobile' : 'Desktop'} Mode</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">Pending Returns</p>
            <p className="text-2xl font-bold text-blue-900">{stats.pendingReturns || 0}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium">Processed Today</p>
            <p className="text-2xl font-bold text-green-900">{stats.processedToday || 0}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600 font-medium">This Week</p>
            <p className="text-2xl font-bold text-purple-900">{stats.processedThisWeek || 0}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-orange-600 font-medium">Need Maintenance</p>
            <p className="text-2xl font-bold text-orange-900">{stats.requireingMaintenance || 0}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-medium">In Warehouse</p>
            <p className="text-2xl font-bold text-gray-900">{stats.assetsInWarehouse || 0}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('process')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'process'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Plus className="h-4 w-4 inline mr-2" />
            Process Return
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'recent'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock className="h-4 w-4 inline mr-2" />
            Recent Returns
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          messageType === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : messageType === 'warning'
            ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {messageType === 'success' ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message}</span>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'process' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-medium mb-6">Process Asset Return</h3>
          
          <form onSubmit={handleSubmitReturn} className="space-y-8">
            {/* Asset Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Asset Information</h4>
              
              {/* Barcode Section with Optional Scanning */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset Barcode
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="barcode"
                    value={returnData.barcode}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter or scan asset barcode"
                  />
                  {isMobile && (
                    <button
                      type="button"
                      onClick={() => setShowBarcodeScanner(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Scan</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={simulateBarcodeScan}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Scan className="h-4 w-4" />
                    <span>Simulate</span>
                  </button>
                  <button
                    type="button"
                    onClick={lookupAssetByBarcode}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 disabled:bg-gray-400"
                  >
                    <Search className="h-4 w-4" />
                    <span>Lookup</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {isMobile ? 'Use camera to scan barcode or enter manually' : 'Enter barcode manually or use simulate button'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Serial Number *
                  </label>
                  <input
                    type="text"
                    name="serialNumber"
                    value={returnData.serialNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Asset serial number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset Type *
                  </label>
                  <select
                    name="assetType"
                    value={returnData.assetType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select asset type...</option>
                    <option value="Ballot Box">Ballot Box</option>
                    <option value="Voting Booth">Voting Booth</option>
                    <option value="Scanner">Scanner</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Printer">Printer</option>
                    <option value="Supplies">Supplies</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={returnData.manufacturer}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Asset manufacturer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={returnData.model}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Asset model"
                  />
                </div>
              </div>
            </div>

            {/* Return Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Return Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Returned By *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="returnedBy"
                      value={returnData.returnedBy}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Name of person returning asset"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="returnLocation"
                      value={returnData.returnLocation}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Poll site or location name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Date
                  </label>
                  <input
                    type="date"
                    name="returnDate"
                    value={returnData.returnDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Functional Status
                  </label>
                  <select
                    name="functionalStatus"
                    value={returnData.functionalStatus}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="working">Working Properly</option>
                    <option value="partial">Partially Working</option>
                    <option value="not-working">Not Working</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Reason
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea
                    name="returnReason"
                    value={returnData.returnReason}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Reason for return (e.g., end of election, equipment issue, etc.)"
                  />
                </div>
              </div>
            </div>

            {/* Condition Assessment Section */}
            <div className="border-b border-gray-200 pb-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Condition Assessment</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overall Condition *
                  </label>
                  <select
                    name="conditionOnReturn"
                    value={returnData.conditionOnReturn}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {conditions.map(condition => (
                      <option key={condition.id} value={condition.id}>
                        {condition.name} - {condition.description}
                        {condition.requiresMaintenance ? ' (Requires Maintenance)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo URL
                  </label>
                  <div className="relative">
                    <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="url"
                      name="photoUrl"
                      value={returnData.photoUrl}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="URL to photo of asset condition"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition Notes
                </label>
                <textarea
                  name="conditionNotes"
                  value={returnData.conditionNotes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Detailed notes about the asset's condition..."
                />
              </div>

              {returnData.functionalStatus !== 'working' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Damage Description
                  </label>
                  <textarea
                    name="damageDescription"
                    value={returnData.damageDescription}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe any damage or issues found..."
                  />
                </div>
              )}

              {returnData.requiresMaintenance && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <span className="text-orange-800 font-medium">This asset will require maintenance</span>
                  </div>
                  <p className="text-orange-700 text-sm mt-1">
                    Based on the condition assessment, this asset will be automatically added to the maintenance queue.
                  </p>
                </div>
              )}
            </div>

            {/* Processing Information Section */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Processing Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Processed By *
                  </label>
                  <input
                    type="text"
                    name="processedBy"
                    value={returnData.processedBy}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warehouse Location
                  </label>
                  <select
                    name="warehouseLocation"
                    value={returnData.warehouseLocation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Warehouse A">Warehouse A</option>
                    <option value="Warehouse B">Warehouse B</option>
                    <option value="Warehouse C">Warehouse C</option>
                    <option value="Maintenance Area">Maintenance Area</option>
                    <option value="Quarantine Area">Quarantine Area</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Processing Notes
                </label>
                <textarea
                  name="processingNotes"
                  value={returnData.processingNotes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional processing notes..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing Return...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Process Asset Return</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setReturnData({
                    serialNumber: '',
                    assetType: '',
                    barcode: '',
                    manufacturer: '',
                    model: '',
                    returnedBy: '',
                    returnLocation: '',
                    returnReason: '',
                    returnDate: new Date().toISOString().split('T')[0],
                    conditionOnReturn: 1,
                    conditionNotes: '',
                    damageDescription: '',
                    functionalStatus: 'working',
                    processedBy: '',
                    warehouseLocation: 'Warehouse A',
                    processingNotes: '',
                    photoUrl: '',
                    requiresMaintenance: false
                  });
                  setMessage('Form cleared successfully');
                  setMessageType('success');
                  setTimeout(() => setMessage(null), 2000);
                }}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Clear Form</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recent Returns Tab */}
      {activeTab === 'recent' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium">Recent Returns</h3>
            <button
              onClick={loadInitialData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>

          {recentReturns.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No recent returns found</p>
              <p className="text-gray-400 text-sm">Returns will appear here once processed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentReturns.map((returnItem, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Package className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {returnItem.serialNumber} - {returnItem.assetType}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Returned by {returnItem.returnedBy} from {returnItem.returnLocation}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(returnItem.returnDate)} • Processed by {returnItem.processedBy}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionBadgeColor(returnItem.conditionOnReturn)}`}>
                        {conditions.find(c => c.id === returnItem.conditionOnReturn)?.name || 'Unknown'}
                      </span>
                      <button
                        onClick={() => setExpandedReturn(expandedReturn === index ? null : index)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        {expandedReturn === index ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {expandedReturn === index && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Asset Details</p>
                          <p className="text-gray-600">Barcode: {returnItem.barcode || 'N/A'}</p>
                          <p className="text-gray-600">Manufacturer: {returnItem.manufacturer || 'N/A'}</p>
                          <p className="text-gray-600">Model: {returnItem.model || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Return Details</p>
                          <p className="text-gray-600">Status: {returnItem.functionalStatus || 'N/A'}</p>
                          <p className="text-gray-600">Location: {returnItem.warehouseLocation || 'N/A'}</p>
                          <p className="text-gray-600">Maintenance: {returnItem.requiresMaintenance ? 'Required' : 'Not Required'}</p>
                        </div>
                      </div>
                      {returnItem.returnReason && (
                        <div className="mt-3">
                          <p className="font-medium text-gray-700 text-sm">Return Reason</p>
                          <p className="text-gray-600 text-sm">{returnItem.returnReason}</p>
                        </div>
                      )}
                      {returnItem.conditionNotes && (
                        <div className="mt-3">
                          <p className="font-medium text-gray-700 text-sm">Condition Notes</p>
                          <p className="text-gray-600 text-sm">{returnItem.conditionNotes}</p>
                        </div>
                      )}
                      {returnItem.processingNotes && (
                        <div className="mt-3">
                          <p className="font-medium text-gray-700 text-sm">Processing Notes</p>
                          <p className="text-gray-600 text-sm">{returnItem.processingNotes}</p>
                        </div>
                      )}
                      {returnItem.photoUrl && (
                        <div className="mt-3">
                          <p className="font-medium text-gray-700 text-sm">Photo</p>
                          <a
                            href={returnItem.photoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Photo</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Barcode Scanner Modal (for mobile) */}
      {showBarcodeScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Scan Barcode</h3>
              <button
                onClick={() => setShowBarcodeScanner(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-center py-8">
              <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Camera scanner would appear here</p>
              <button
                onClick={simulateBarcodeScan}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Simulate Scan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnsProcessing;
