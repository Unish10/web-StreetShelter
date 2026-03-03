import { Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense } from 'react';

const Landing = React.lazy(() => import('./pages/public/Landing.jsx'));
const RoleSelection = React.lazy(() => import('./pages/public/RoleSelection.jsx'));
const Login = React.lazy(() => import('./pages/public/Login.jsx'));
const Register = React.lazy(() => import('./pages/public/Register.jsx'));
const ForgotPassword = React.lazy(() => import('./pages/public/ForgotPassword.jsx'));
const VerifyOTP = React.lazy(() => import('./pages/public/VerifyOTP.jsx'));
const ResetPassword = React.lazy(() => import('./pages/public/ResetPassword.jsx'));
const Home = React.lazy(() => import('./pages/private/Home.jsx'));
const ReportDog = React.lazy(() => import('./pages/private/ReportDog.jsx'));
const OwnerRegistration = React.lazy(() => import('./pages/private/OwnerRegistration.jsx'));
const DogReports = React.lazy(() => import('./pages/private/DogReports.jsx'));
const AdminLogin = React.lazy(() => import('./pages/private/AdminLogin.jsx'));
const AdminDashboard = React.lazy(() => import('./pages/private/AdminDashboard.jsx'));
const ReporterDashboard = React.lazy(() => import('./pages/private/ReporterDashboard.jsx'));
const OwnerDashboard = React.lazy(() => import('./pages/private/OwnerDashboard.jsx'));

const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="spinner"></div>
  </div>
);


const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/" replace />;
};


const AdminRoute = ({ children }) => {
  const isAdminAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
  return isAdminAuthenticated ? children : <Navigate to="/admin/login" replace />;
};


const OwnerVerifiedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role === 'owner' && user.isOwner === true && user.ownerVerified === true) {
    return children;
  }
  
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>   
      <Routes>
        
        <Route path="/" element={<Landing />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/reporter" element={
          <ProtectedRoute>
            <ReporterDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/owner" element={
          <ProtectedRoute>
            <OwnerDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        
        <Route path="/dashboard/report-dog" element={
          <ProtectedRoute>
            <ReportDog />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/owner-registration" element={
          <ProtectedRoute>
            <OwnerRegistration />
          </ProtectedRoute>
        } />
        
        
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route path="/admin/dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />

        
        <Route path="/dashboard/dog-reports" element={
          <ProtectedRoute>
            <DogReports />
          </ProtectedRoute>
        } />

        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
