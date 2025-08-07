import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { 
  getChainOfCustody, 
  getUnresolvedForms, 
  generateCoCForm,
  getAssetCustodyHistory,
  logCustodyEvent 
} from './chainOfCustodyService';

const ChainOfCustodyPage = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [unresolvedForms, setUnresolvedForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [assetHistory, setAssetHistory] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'events') {
        const response = await getChainOfCustody();
        setEvents(response.data || []);
      } else if (activeTab === 'unresolved') {
        const response = await getUnresolvedForms();
        setUnresolvedForms(response.data || []);
      }
    } catch (err) {
      setError('Failed to load data: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAssetHistorySearch = async () => {
    if (!selectedAsset) return;
    
    setLoading(true);
    try {
      const response = await getAssetCustodyHistory(selectedAsset);
      setAssetHistory(response.data || []);
    } catch (err) {
      setError('Failed to load asset history: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'inprogress':
        return 'bg-yellow-100 text-yellow-800';
      case 'generated':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const EventsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Chain of Custody Events</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Log New Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No chain of custody events found
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {events.map((event) => (
              <li key={event.eventId} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        Asset ID: {event.assetId}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {event.eventType || 'Transfer'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          From: <span className="ml-1 font-medium">{event.fromParty}</span>
                          {event.fromOrg && <span className="ml-1">({event.fromOrg})</span>}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          To: <span className="ml-1 font-medium">{event.toParty}</span>
                          {event.toOrg && <span className="ml-1">({event.toOrg})</span>}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>{formatDateTime(event.dateTime)}</p>
                      </div>
                    </div>
                    {event.sealNumber && (
                      <p className="mt-1 text-sm text-gray-600">
                        Seal: {event.sealNumber}
                      </p>
                    )}
                    {event.notes && (
                      <p className="mt-1 text-sm text-gray-600">
                        Notes: {event.notes}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const UnresolvedFormsTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Unresolved CoC Forms</h3>
      
      {unresolvedForms.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No unresolved forms found
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {unresolvedForms.map((form) => (
              <li key={form.coCFormStatusId} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        Manifest ID: {form.manifestId}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(form.status)}`}>
                          {form.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          Signatures: {form.completedSignatures} of {form.requiredSignatures}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          Accessed: {form.accessCount} times
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>Created: {formatDateTime(form.createdAt)}</p>
                      </div>
                    </div>
                    {form.expiresAt && (
                      <p className="mt-1 text-sm text-gray-600">
                        Expires: {formatDateTime(form.expiresAt)}
                      </p>
                    )}
                    <div className="mt-2">
                      <a
                        href={form.formUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900 text-sm"
                      >
                        View Form →
                      </a>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const AssetHistoryTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Asset Custody History</h3>
      
      <div className="flex space-x-4">
        <input
          type="number"
          placeholder="Enter Asset ID"
          value={selectedAsset}
          onChange={(e) => setSelectedAsset(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2"
        />
        <button
          onClick={handleAssetHistorySearch}
          disabled={!selectedAsset || loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Search History
        </button>
      </div>

      {assetHistory.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h4 className="text-lg leading-6 font-medium text-gray-900">
              Custody History for Asset {selectedAsset}
            </h4>
          </div>
          <ul className="divide-y divide-gray-200">
            {assetHistory.map((event, index) => (
              <li key={event.eventId} className="px-6 py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {event.fromParty} → {event.toParty}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(event.dateTime)}
                      </p>
                    </div>
                    {event.sealNumber && (
                      <p className="text-sm text-gray-600">Seal: {event.sealNumber}</p>
                    )}
                    {event.notes && (
                      <p className="text-sm text-gray-600">Notes: {event.notes}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const CreateEventForm = () => {
    const [formData, setFormData] = useState({
      electionId: 1,
      assetId: '',
      fromParty: '',
      toParty: '',
      fromOrg: '',
      toOrg: '',
      sealNumber: '',
      notes: '',
      eventType: 'Transfer'
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        await logCustodyEvent(formData);
        setShowCreateForm(false);
        loadData();
        setFormData({
          electionId: 1,
          assetId: '',
          fromParty: '',
          toParty: '',
          fromOrg: '',
          toOrg: '',
          sealNumber: '',
          notes: '',
          eventType: 'Transfer'
        });
      } catch (err) {
        setError('Failed to create event: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Log New Custody Event</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Asset ID</label>
                <input
                  type="number"
                  required
                  value={formData.assetId}
                  onChange={(e) => setFormData({...formData, assetId: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">From Party</label>
                <input
                  type="text"
                  required
                  value={formData.fromParty}
                  onChange={(e) => setFormData({...formData, fromParty: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">To Party</label>
                <input
                  type="text"
                  required
                  value={formData.toParty}
                  onChange={(e) => setFormData({...formData, toParty: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Event Type</label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({...formData, eventType: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="Transfer">Transfer</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Received">Received</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Seal Number</label>
                <input
                  type="text"
                  value={formData.sealNumber}
                  onChange={(e) => setFormData({...formData, sealNumber: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar links={['Dashboard', 'Inventory', 'Packing', 'Custody']} />
      <div className="flex-1 flex flex-col">
        <TopBar title="Chain of Custody Management" />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Chain of Custody Management</h1>
            <p className="mt-2 text-gray-600">
              Track and manage asset custody transfers and digital form signatures
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'events', label: 'Custody Events' },
                { id: 'unresolved', label: 'Unresolved Forms' },
                { id: 'history', label: 'Asset History' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          )}

          {!loading && (
            <>
              {activeTab === 'events' && <EventsTab />}
              {activeTab === 'unresolved' && <UnresolvedFormsTab />}
              {activeTab === 'history' && <AssetHistoryTab />}
            </>
          )}

          {showCreateForm && <CreateEventForm />}
        </main>
      </div>
    </div>
  );
};

export default ChainOfCustodyPage;
