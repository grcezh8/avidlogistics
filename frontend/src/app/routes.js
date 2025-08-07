import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../pages/LoginPage';
import WarehouseDashboardPage from '../features/dashboard/WarehouseDashboardPage';
import InventoryPage from '../features/inventory/InventoryPage';
import ManifestsPage from '../features/manifests/ManifestsPage';
import PackingManifestPage from '../features/manifest/PackingManifestPage';
import DeliveriesPage from '../features/deliveries/DeliveriesPage';
import AlertsPage from '../features/alerts/AlertsPage';
import ChainOfCustodyPage from '../features/chainofcustody/ChainOfCustodyPage';

export default function AppRoutes() {
  const { user, loading } = useAuth();

  // Show loading screen while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-full mb-4">
            <svg className="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<WarehouseDashboardPage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/manifests" element={<ManifestsPage />} />
      <Route path="/deliveries" element={<DeliveriesPage />} />
      <Route path="/alerts" element={<AlertsPage />} />
      <Route path="/custody" element={<ChainOfCustodyPage />} />
      {/* Existing routes that might be implemented later */}
      <Route path="/packing" element={<PackingManifestPage />} />
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
