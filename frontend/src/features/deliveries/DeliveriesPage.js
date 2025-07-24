import React, { useState, useEffect } from 'react';
import { Truck, Search, Filter, MapPin, Clock, CheckCircle } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { getDeliveries, getDeliveriesByStatus } from './deliveryService';
import { getFacilities } from '../facilities/facilityService';

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFacility, setFilterFacility] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Mock delivery data
      const mockDeliveries = [
        {
          id: 1,
          deliveryNumber: 'D-2024-001',
          manifestNumber: 'M-2024-001',
          driver: 'John Smith',
          truckNumber: 'TRK-101',
          fromFacility: 'Main Warehouse',
          toFacility: 'District 7 Center',
          status: 'In Transit',
          departureTime: '2024-01-15T08:30:00',
          estimatedArrival: '2024-01-15T10:30:00',
          actualArrival: null,
          itemCount: 25,
          progress: 65
        },
        {
          id: 2,
          deliveryNumber: 'D-2024-002',
          manifestNumber: 'M-2024-002',
          driver: 'Jane Doe',
          truckNumber: 'TRK-102',
          fromFacility: 'Main Warehouse',
          toFacility: 'Precinct 15',
          status: 'Delivered',
          departureTime: '2024-01-14T09:00:00',
          estimatedArrival: '2024-01-14T11:00:00',
          actualArrival: '2024-01-14T10:45:00',
          itemCount: 18,
          progress: 100
        },
        {
          id: 3,
          deliveryNumber: 'D-2024-003',
          manifestNumber: 'M-2024-003',
          driver: 'Mike Johnson',
          truckNumber: 'TRK-103',
          fromFacility: 'Warehouse B',
          toFacility: 'District 3 Center',
          status: 'Scheduled',
          departureTime: '2024-01-16T07:00:00',
          estimatedArrival: '2024-01-16T09:00:00',
          actualArrival: null,
          itemCount: 32,
          progress: 0
        },
        {
          id: 4,
          deliveryNumber: 'D-2024-004',
          manifestNumber: 'M-2024-004',
          driver: 'Sarah Wilson',
          truckNumber: 'TRK-104',
          fromFacility: 'Main Warehouse',
          toFacility: 'Precinct 8',
          status: 'In Transit',
          departureTime: '2024-01-15T07:00:00',
          estimatedArrival: '2024-01-15T09:30:00',
          actualArrival: null,
          itemCount: 15,
          progress: 80
        }
      ];

      // Mock facilities
      const mockFacilities = [
        { id: 1, name: 'Main Warehouse' },
        { id: 2, name: 'Warehouse B' },
        { id: 3, name: 'District 7 Center' },
        { id: 4, name: 'Precinct 15' }
      ];
      
      setDeliveries(mockDeliveries);
      setFacilities(mockFacilities);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = delivery.deliveryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.truckNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || delivery.status === filterStatus;
    const matchesFacility = filterFacility === 'all' || 
                           delivery.fromFacility === filterFacility || 
                           delivery.toFacility === filterFacility;
    return matchesSearch && matchesStatus && matchesFacility;
  });

  const getStatusBadge = (status) => {
    const badges = {
      'Scheduled': 'bg-gray-100 text-gray-800',
      'In Transit': 'bg-blue-100 text-blue-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Delayed': 'bg-yellow-100 text-yellow-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar links={['Dashboard', 'Inventory', 'Packing', 'Returns', 'Manifests', 'Deliveries', 'Alerts']} />
      <div className="flex-1 flex flex-col">
        <TopBar title="Deliveries Tracking" />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Active Deliveries</h1>
            <p className="text-gray-600">Track and monitor all ongoing deliveries in real-time</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Deliveries</p>
                  <p className="text-2xl font-bold text-gray-900">{deliveries.length}</p>
                </div>
                <Truck className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">In Transit</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {deliveries.filter(d => d.status === 'In Transit').length}
                  </p>
                </div>
                <Truck className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Delivered Today</p>
                  <p className="text-2xl font-bold text-green-600">
                    {deliveries.filter(d => d.status === 'Delivered').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Scheduled</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {deliveries.filter(d => d.status === 'Scheduled').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-gray-400" />
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
                    placeholder="Search deliveries..."
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
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Delayed">Delayed</option>
                </select>
                <select
                  value={filterFacility}
                  onChange={(e) => setFilterFacility(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Facilities</option>
                  {facilities.map(facility => (
                    <option key={facility.id} value={facility.name}>{facility.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Deliveries List */}
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Truck className="h-8 w-8 text-gray-400 animate-pulse" />
                </div>
                <p className="text-gray-500">Loading deliveries...</p>
              </div>
            ) : (
              filteredDeliveries.map((delivery) => (
                <div key={delivery.id} className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {delivery.deliveryNumber}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Manifest: {delivery.manifestNumber} • Driver: {delivery.driver} • Truck: {delivery.truckNumber}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(delivery.status)}`}>
                      {delivery.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">From</p>
                        <p className="text-sm text-gray-500">{delivery.fromFacility}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">To</p>
                        <p className="text-sm text-gray-500">{delivery.toFacility}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">ETA</p>
                        <p className="text-sm text-gray-500">{formatTime(delivery.estimatedArrival)}</p>
                      </div>
                    </div>
                  </div>

                  {delivery.status === 'In Transit' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{delivery.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(delivery.progress)}`}
                          style={{ width: `${delivery.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {delivery.itemCount} items • Departed: {formatTime(delivery.departureTime)}
                    </span>
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      Track Delivery →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}