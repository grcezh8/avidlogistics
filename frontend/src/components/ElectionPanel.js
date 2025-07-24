import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { getElections, getElection } from '../features/elections/electionsService';

export default function ElectionPanel({ onElectionChange }) {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    try {
      setLoading(true);
      const response = await getElections();
      const electionsData = response.data || [];
      setElections(electionsData);
      
      // Set the first active or upcoming election as selected
      const activeElection = electionsData.find(e => e.status === 'Active') || 
                            electionsData.find(e => e.status === 'Upcoming') ||
                            electionsData[0];
      
      if (activeElection) {
        setSelectedElection(activeElection);
        if (onElectionChange) {
          onElectionChange(activeElection);
        }
      }
    } catch (error) {
      console.error('Error loading elections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleElectionSelect = async (election) => {
    try {
      const response = await getElection(election.id);
      setSelectedElection(response.data);
      setIsDropdownOpen(false);
      if (onElectionChange) {
        onElectionChange(response.data);
      }
    } catch (error) {
      console.error('Error selecting election:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-800',
      'Upcoming': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-gray-100 text-gray-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded p-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Current Election
        </h2>
        {selectedElection && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedElection.status)}`}>
            {selectedElection.status}
          </span>
        )}
      </div>

      {selectedElection ? (
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full text-left p-3 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{selectedElection.name}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(selectedElection.electionDate)} • {selectedElection.electionType}
                </p>
              </div>
              <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
              {elections.map((election) => (
                <button
                  key={election.id}
                  onClick={() => handleElectionSelect(election)}
                  className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                    selectedElection.id === election.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{election.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(election.electionDate)} • {election.electionType}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(election.status)}`}>
                      {election.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          <p>No elections available</p>
        </div>
      )}

      {selectedElection && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Total Facilities</p>
              <p className="font-medium">{selectedElection.totalFacilities || 0}</p>
            </div>
            <div>
              <p className="text-gray-500">Active Manifests</p>
              <p className="font-medium">{selectedElection.activeManifests || 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}