import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, Plus, Truck, Package } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { getManifests, getManifestById } from './manifestService';
import { getElections } from '../elections/electionsService';
import { generateManifestCoCForm } from '../chainofcustody/chainOfCustodyService';

export default function ManifestsPage() {
  const [manifests, setManifests] = useState([]);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterElection, setFilterElection] = useState('all');
  const [generatingCoC, setGeneratingCoC] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateCoC = async (manifestId) => {
    setGeneratingCoC(prev => ({ ...prev, [manifestId]: true }));
    try {
      const response = await generateManifestCoCForm(manifestId);
      alert(`CoC form generated successfully! URL: ${response.data.formUrl}`);
      // Optionally open the form in a new tab
      window.open(response.data.formUrl, '_blank');
    } catch (error) {
      console.error('Error generating CoC form:', error);
      alert('Failed to generate CoC form: ' + (error.response?.data?.message || error.message));
    } finally {
      setGeneratingCoC(prev => ({ ...prev, [manifestId]: false }));
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [manifestsRes, electionsRes] = await Promise.all([
        getManifests(),
        getElections()
      ]);
      
      // Mock enhanced manifest data
      const mockManifests = [
        {
          id: 1,
          manifestNumber: 'M-2024-001',
          electionId: 1,
          electionName: 'General Election 2024',
          fromFacility: 'Main Warehouse',
          toFacility: 'District 7 Center',
          status: 'Created',
          itemCount: 25,
          createdDate: '2024-01-15',
          deliveryDate: null
        },
        {
          id: 2,
          manifestNumber: 'M-2024-002',
          electionId: 1,
          electionName: 'General Election 2024',
          fromFacility: 'Main Warehouse',
          toFacility: 'Precinct 15',
          status: 'In Transit',
          itemCount: 18,
          createdDate: '2024-01-14',
          deliveryDate: null
        },
        {
          id: 3,
          manifestNumber: 'M-2024-003',
          electionId: 2,
          electionName: 'Primary Election 2024',
          fromFacility: 'Warehouse B',
          toFacility: 'District 3 Center',
          status: 'Delivered',
          itemCount: 32,
          createdDate: '2024-01-10',
          deliveryDate: '2024-01-12'
        }
      ];
      
      setManifests(mockManifests);
      setElections(electionsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredManifests = manifests.filter(manifest => {
    const matchesSearch = manifest.manifestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         manifest.toFacility.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         manifest.fromFacility.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || manifest.status === filterStatus;
    const matchesElection = filterElection === 'all' || manifest.electionId.toString() === filterElection;
    return matchesSearch && matchesStatus && matchesElection;
  });

  const getStatusBadge = (status) => {
    const badges = {
      'Created': 'bg-gray-100 text-gray-800',
      'Packed': 'bg-blue-100 text-blue-800',
      'In Transit': 'bg-yellow-100 text-yellow-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Created': <FileText className="h-4 w-4" />,
      'Packed': <Package className="h-4 w-4" />,
      'In Transit': <Truck className="h-4 w-4" />,
      'Delivered': <Package className="h-4 w-4" />
    };
    return icons[status] || <FileText className="h-4 w-4" />;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar links={['Dashboard', 'Inventory', 'Packing', 'Manifests', 'Deliveries', 'Alerts','Custody']} />
      <div className="flex-1 flex flex-col">
        <TopBar title="Manifests Management" />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Delivery Manifests</h1>
            <p className="text-gray-600">Track and manage all delivery manifests for elections</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Manifests</p>
                  <p className="text-2xl font-bold text-gray-900">{manifests.length}</p>
                </div>
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">In Transit</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {manifests.filter(m => m.status === 'In Transit').length}
                  </p>
                </div>
                <Truck className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">
                    {manifests.filter(m => m.status === 'Delivered').length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {manifests.filter(m => m.status === 'Created').length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-400" />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search manifests..."
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
                  <option value="Created">Created</option>
                  <option value="Packed">Packed</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                </select>
                <select
                  value={filterElection}
                  onChange={(e) => setFilterElection(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Elections</option>
                  {elections.map(election => (
                    <option key={election.id} value={election.id}>{election.name}</option>
                  ))}
                </select>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create Manifest
                </button>
              </div>
            </div>
          </div>

          {/* Manifests Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <FileText className="h-8 w-8 text-gray-400 animate-pulse" />
                </div>
                <p className="text-gray-500">Loading manifests...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Manifest #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Election
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        From / To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredManifests.map((manifest) => (
                      <tr key={manifest.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{manifest.manifestNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {manifest.electionName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{manifest.fromFacility}</div>
                          <div className="text-sm text-gray-500">→ {manifest.toFacility}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {manifest.itemCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${getStatusBadge(manifest.status)}`}>
                            {getStatusIcon(manifest.status)}
                            {manifest.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {manifest.createdDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Track</button>
                          <button 
                            onClick={() => handleGenerateCoC(manifest.id)}
                            disabled={generatingCoC[manifest.id]}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            {generatingCoC[manifest.id] ? 'Generating...' : 'Generate CoC'}
                          </button>
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
    </div>
  );
}
