import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Package, Truck, MapPin, BarChart3, AlertCircle, CheckCircle2, Clock, Search, 
  Plus, X, Home, Box, Users, Settings, Menu, ChevronRight, Scan, AlertTriangle,
  FileText, UserCheck, Wrench, Shield, Navigation, Phone, Mail, Hash, Calendar,
  RefreshCw, Download, Upload, Camera, Wifi, WifiOff, Battery, BatteryLow,
  LogIn, LogOut, Eye, EyeOff, User, ClipboardList
} from 'lucide-react';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5166/api';

// API Service
const apiService = {
  // Authentication
  login: async (credentials) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    return response.data;
  },

  // Reference Data
  getAssetTypes: async () => {
    const response = await axios.get(`${API_BASE_URL}/referencedata/asset-types`);
    return response.data;
  },

  getLocations: async (type = null) => {
    const url = type ? `${API_BASE_URL}/referencedata/locations?type=${type}` : `${API_BASE_URL}/referencedata/locations`;
    const response = await axios.get(url);
    return response.data;
  },

  getAssetStatusDefinitions: async () => {
    const response = await axios.get(`${API_BASE_URL}/referencedata/asset-status-definitions`);
    return response.data;
  },

  // Assets
  getAssets: async (status = null) => {
    const url = status !== null ? `${API_BASE_URL}/assets?status=${status}` : `${API_BASE_URL}/assets`;
    const response = await axios.get(url);
    return response.data;
  },

  createAsset: async (assetData) => {
    const response = await axios.post(`${API_BASE_URL}/assets`, assetData);
    return response.data;
  },

  // Dashboard
  getDashboardStats: async () => {
    const response = await axios.get(`${API_BASE_URL}/dashboard/stats`);
    return response.data;
  }
};

// Main Application Component
const AVIDLogisticsApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Handle login with API call
  const handleLogin = async (credentials) => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      const response = await apiService.login(credentials);
      
      if (response.success) {
        setCurrentUser(response.user);
        setIsAuthenticated(true);
      } else {
        setApiError(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setApiError(error.response?.data?.message || 'Network error. Using demo mode.');
      
      // Fallback to demo mode if API is not available
      const roleMap = {
        'warehouse1': { id: 1, name: 'John Smith', role: 'warehouse_staff', username: 'warehouse1' },
        'fleet1': { id: 2, name: 'Emma Wilson', role: 'fleet_manager', username: 'fleet1' },
        'logistics1': { id: 3, name: 'Mike Johnson', role: 'logistics_coordinator', username: 'logistics1' },
        'poll1': { id: 4, name: 'Sarah Davis', role: 'poll_worker', username: 'poll1', pollSiteName: 'Downtown Community Center' }
      };
      
      const user = roleMap[credentials.username];
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
    }
    
    setIsLoading(false);
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setApiError(null);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} isLoading={isLoading} apiError={apiError} />;
  }

  // Render role-specific dashboard
  return <RoleBasedDashboard user={currentUser} onLogout={handleLogout} />;
};

// Login Screen Component
const LoginScreen = ({ onLogin, isLoading, apiError }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!credentials.username || !credentials.password) {
      alert('Please enter both username and password');
      return;
    }
    onLogin(credentials);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-xl mb-4">
            <Package className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AVID Logistics</h1>
          <p className="text-gray-600 mt-2">Sign in to access your dashboard</p>
          {apiError && (
            <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-sm text-yellow-800">
              {apiError}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          {/* Dev Mode: Quick Login Buttons */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Development Quick Login:</p>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => onLogin({ username: 'warehouse1', password: 'demo' })}
                className="text-xs py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                Warehouse Staff
              </button>
              <button 
                onClick={() => onLogin({ username: 'fleet1', password: 'demo' })}
                className="text-xs py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                Fleet Manager
              </button>
              <button 
                onClick={() => onLogin({ username: 'logistics1', password: 'demo' })}
                className="text-xs py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                Logistics
              </button>
              <button 
                onClick={() => onLogin({ username: 'poll1', password: 'demo' })}
                className="text-xs py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                Poll Worker
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Role-Based Dashboard Router
const RoleBasedDashboard = ({ user, onLogout }) => {
  const dashboards = {
    'warehouse_staff': WarehouseStaffDashboard,
    'fleet_manager': FleetManagerDashboard,
    'logistics_coordinator': LogisticsCoordinatorDashboard,
    'poll_worker': PollWorkerDashboard
  };

  const DashboardComponent = dashboards[user.role] || WarehouseStaffDashboard;

  return <DashboardComponent user={user} onLogout={onLogout} />;
};

// Warehouse Staff Dashboard with Database Integration
const WarehouseStaffDashboard = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [assets, setAssets] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [statusDefinitions, setStatusDefinitions] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load all reference data in parallel
        const [
          assetsData,
          assetTypesData,
          locationsData,
          statusData,
          statsData
        ] = await Promise.all([
          apiService.getAssets().catch(() => []),
          apiService.getAssetTypes().catch(() => []),
          apiService.getLocations('Warehouse').catch(() => []),
          apiService.getAssetStatusDefinitions().catch(() => []),
          apiService.getDashboardStats().catch(() => null)
        ]);

        setAssets(assetsData);
        setAssetTypes(assetTypesData);
        setLocations(locationsData);
        setStatusDefinitions(statusData);
        setDashboardStats(statsData);
        
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data from server. Using demo mode.');
        
        // Fallback to demo data
        setAssets([
          { id: 1, serialNumber: 'BB-001', assetType: 'Ballot Box', barcode: '123456789', status: 1, statusDisplayName: 'Available', statusColor: 'bg-green-100 text-green-800', location: 'Warehouse A' },
          { id: 2, serialNumber: 'VB-101', assetType: 'Voting Booth', barcode: '987654321', status: 2, statusDisplayName: 'Assigned', statusColor: 'bg-blue-100 text-blue-800', location: 'Warehouse A' },
          { id: 3, serialNumber: 'SC-201', assetType: 'Scanner', barcode: '456789123', status: 3, statusDisplayName: 'In Transit', statusColor: 'bg-yellow-100 text-yellow-800', location: 'Route 5' },
        ]);
        setAssetTypes([
          { name: 'Ballot Box' },
          { name: 'Voting Booth' },
          { name: 'Scanner' },
          { name: 'Accessible Voting Device' },
          { name: 'Signage' },
          { name: 'Supplies' }
        ]);
        setLocations([
          { name: 'Warehouse A' },
          { name: 'Warehouse B' },
          { name: 'Distribution Center' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'register', label: 'Register Assets', icon: Plus },
    { id: 'inventory', label: 'Inventory', icon: Box },
    { id: 'packing', label: 'Packing Lists', icon: ClipboardList },
    { id: 'returns', label: 'Process Returns', icon: RefreshCw },
    { id: 'reports', label: 'Reports', icon: FileText }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">AVID Logistics</h2>
                <p className="text-xs text-gray-500">Warehouse</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-2 bg-yellow-100 border border-yellow-400 rounded text-xs text-yellow-800">
              {error}
            </div>
          )}

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                  activeView === item.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8 p-1 bg-gray-200 rounded-full" />
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </div>
            <button onClick={onLogout} className="p-2 hover:bg-gray-100 rounded">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <header className="bg-white border-b px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            {navItems.find(item => item.id === activeView)?.label || 'Dashboard'}
          </h1>
        </header>

        <div className="p-6">
          {activeView === 'dashboard' && <WarehouseDashboardView stats={dashboardStats} />}
          {activeView === 'register' && <AssetRegistrationView assetTypes={assetTypes} locations={locations} onAssetCreated={() => window.location.reload()} />}
          {activeView === 'inventory' && <InventoryView assets={assets} statusDefinitions={statusDefinitions} />}
          {activeView === 'packing' && <PackingListsView />}
          {activeView === 'returns' && <ReturnsProcessingView />}
          {activeView === 'reports' && <WarehouseReportsView />}
        </div>
      </main>
    </div>
  );
};

// Updated Warehouse Dashboard View with real stats
const WarehouseDashboardView = ({ stats }) => {
  const defaultStats = {
    assets: { total: 0, available: 0, assigned: 0, inTransit: 0 },
    kits: { total: 0, draft: 0, packed: 0, readyForDispatch: 0 },
    recentActivity: []
  };

  const displayStats = stats || defaultStats;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Assets</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{displayStats.assets.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Available Assets</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{displayStats.assets.available}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Assigned Assets</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{displayStats.assets.assigned}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">In Transit</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{displayStats.assets.inTransit}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50">
            <Scan className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm">Scan Asset</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50">
            <Package className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm">Pack Kit</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50">
            <RefreshCw className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm">Process Return</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50">
            <FileText className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm">Generate Report</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      {displayStats.recentActivity && displayStats.recentActivity.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
          <div className="space-y-2">
            {displayStats.recentActivity.map((activity, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">{activity.activityType}: {activity.itemName}</span>
                <span className="text-xs text-gray-500">{activity.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Updated Asset Registration View with database integration
const AssetRegistrationView = ({ assetTypes, locations, onAssetCreated }) => {
  const [mode, setMode] = useState('single');
  const [assetData, setAssetData] = useState({
    serialNumber: '',
    assetType: '',
    location: locations.length > 0 ? locations[0].name : 'Warehouse A',
    barcode: '',
    rfidTag: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!assetData.serialNumber || !assetData.assetType) {
      alert('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiService.createAsset(assetData);
      
      if (response.success) {
        alert(`Asset registered successfully!\nSerial: ${assetData.serialNumber}\nType: ${assetData.assetType}`);
        setAssetData({
          serialNumber: '',
          assetType: '',
          location: locations.length > 0 ? locations[0].name : 'Warehouse A',
          barcode: '',
          rfidTag: ''
        });
        if (onAssetCreated) onAssetCreated();
      } else {
        alert(`Registration failed: ${response.message}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        {/* Mode Toggle */}
        <div className="p-6 border-b">
          <div className="flex space-x-4">
            <button
              onClick={() => setMode('single')}
              className={`px-4 py-2 rounded-lg ${
                mode === 'single' ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              Single Asset
            </button>
            <button
              onClick={() => setMode('bulk')}
              className={`px-4 py-2 rounded-lg ${
                mode === 'bulk' ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              Bulk Import
            </button>
          </div>
        </div>

        {mode === 'single' ? (
          <div className="p-6 space-y-4">
            {/* Scanner */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Scanner simulation</p>
              <button className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg">
                <Scan className="h-5 w-5 inline mr-2" />
                Simulate Scan
              </button>
            </div>

            {/* Manual Entry */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serial Number *
                </label>
                <input
                  type="text"
                  value={assetData.serialNumber}
                  onChange={(e) => setAssetData({...assetData, serialNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter serial number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asset Type *
                </label>
                <select
                  value={assetData.assetType}
                  onChange={(e) => setAssetData({...assetData, assetType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select type...</option>
                  {assetTypes.map((type) => (
                    <option key={type.name} value={type.name}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Barcode
                </label>
                <input
                  type="text"
                  value={assetData.barcode}
                  onChange={(e) => setAssetData({...assetData, barcode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter barcode"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RFID Tag
                </label>
                <input
                  type="text"
                  value={assetData.rfidTag}
                  onChange={(e) => setAssetData({...assetData, rfidTag: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter RFID tag"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Location
                </label>
                <select
                  value={assetData.location}
                  onChange={(e) => setAssetData({...assetData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {locations.map((location) => (
                    <option key={location.name} value={location.name}>{location.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleRegister}
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isSubmitting ? 'Registering...' : 'Register Asset'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Drop CSV file here or click to browse</p>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg">
                Select File
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              CSV Format: SerialNumber, AssetType, Location, Barcode, RfidTag
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Updated Inventory View with database data
const InventoryView = ({ assets, statusDefinitions }) => {
  const assetsByType = assets.reduce((acc, asset) => {
    acc[asset.assetType] = (acc[asset.assetType] || 0) + 1;
    return acc;
  }, {});

  const getStatusBadge = (asset) => {
    const statusDef = statusDefinitions.find(s => s.statusCode === asset.status);
    const color = statusDef?.color || 'bg-gray-100 text-gray-800';
    const displayName = asset.statusDisplayName || statusDef?.displayName || 'Unknown';
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}>
        {displayName}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(assetsByType).map(([type, count]) => (
          <div key={type} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-2">{type}</h3>
            <p className="text-3xl font-bold text-gray-900">{count}</p>
            <p className="text-sm text-gray-600 mt-1">Total in inventory</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium">Asset Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barcode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {assets.map((asset) => (
                <tr key={asset.id}>
                  <td className="px-6 py-4 text-sm">{asset.serialNumber}</td>
                  <td className="px-6 py-4 text-sm">{asset.assetType}</td>
                  <td className="px-6 py-4 text-sm font-mono">{asset.barcode}</td>
                  <td className="px-6 py-4">
                    {getStatusBadge(asset)}
                  </td>
                  <td className="px-6 py-4 text-sm">{asset.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for other views
const PackingListsView = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-medium mb-4">Active Packing Lists</h3>
    <p className="text-gray-600">No active packing lists at this time.</p>
  </div>
);

const ReturnsProcessingView = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-medium mb-4">Process Returns</h3>
    <div className="text-center py-12">
      <Scan className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600 mb-4">Scan returned asset</p>
      <button className="px-6 py-3 bg-blue-600 text-white rounded-lg">
        Start Scanning
      </button>
    </div>
  </div>
);

const WarehouseReportsView = () => {
  const reportTypes = [
    { id: 'low-stock', name: 'Low Stock Alert', icon: AlertTriangle },
    { id: 'maintenance', name: 'Maintenance Schedule', icon: Wrench },
    { id: 'damaged', name: 'Damaged Equipment', icon: AlertCircle },
    { id: 'inventory', name: 'Full Inventory', icon: Box }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {reportTypes.map((report) => (
        <div key={report.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <report.icon className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium">{report.name}</h3>
          </div>
          <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Generate Report
          </button>
        </div>
      ))}
    </div>
  );
};

// Placeholder components for other role dashboards
const FleetManagerDashboard = ({ user, onLogout }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Fleet Manager Dashboard</h2>
      <p className="text-gray-600 mb-4">Welcome, {user.name}</p>
      <p className="text-sm text-gray-500 mb-4">Database integration in progress...</p>
      <button onClick={onLogout} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
        Logout
      </button>
    </div>
  </div>
);

const LogisticsCoordinatorDashboard = ({ user, onLogout }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Logistics Coordinator Dashboard</h2>
      <p className="text-gray-600 mb-4">Welcome, {user.name}</p>
      <p className="text-sm text-gray-500 mb-4">Database integration in progress...</p>
      <button onClick={onLogout} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
        Logout
      </button>
    </div>
  </div>
);

const PollWorkerDashboard = ({ user, onLogout }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Poll Worker Dashboard</h2>
      <p className="text-gray-600 mb-4">Welcome, {user.name}</p>
      <p className="text-sm text-gray-500 mb-4">Database integration in progress...</p>
      <button onClick={onLogout} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
        Logout
      </button>
    </div>
  </div>
);

export default AVIDLogisticsApp;
