import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import TenantDashboard from './pages/TenantDashboard';
import Properties from './pages/Properties';
import Payments from './pages/Payments';
import Maintenance from './pages/Maintenance';
import Leases from './pages/Leases';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/owner" element={<OwnerDashboard />} />
        <Route path="/tenant" element={<TenantDashboard />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/leases" element={<Leases />} />
      </Routes>
    </Router>
  );
}

export default App;
