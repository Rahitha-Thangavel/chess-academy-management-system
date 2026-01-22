import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import LandingPage from './pages/LandingPage';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import VerifyEmailSent from './pages/auth/VerifyEmailSent';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import CreateAdmin from './pages/admin/CreateAdmin';
import ClerkDashboard from './pages/clerk/Dashboard';
import CoachDashboard from './pages/coach/Dashboard';
import ParentDashboard from './pages/parent/Dashboard';
import ParentLayout from './components/parent/ParentLayout';
import MyChildren from './pages/parent/MyChildren';
import Attendance from './pages/parent/Attendance';
import Payments from './pages/parent/Payments';
import Tournaments from './pages/parent/Tournaments';
import RescheduleRequests from './pages/parent/RescheduleRequests';

// Error Pages
import NotFound from './pages/errors/NotFound';
import Unauthorized from './pages/errors/Unauthorized';

// CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/verify-email-sent" element={<VerifyEmailSent />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/create-admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <CreateAdmin />
              </ProtectedRoute>
            }
          />

          {/* Clerk Routes */}
          <Route
            path="/clerk/dashboard"
            element={
              <ProtectedRoute allowedRoles={['CLERK']}>
                <ClerkDashboard />
              </ProtectedRoute>
            }
          />

          {/* Coach Routes */}
          <Route
            path="/coach/dashboard"
            element={
              <ProtectedRoute allowedRoles={['COACH']}>
                <CoachDashboard />
              </ProtectedRoute>
            }
          />

          {/* Parent Routes */}
          <Route
            path="/parent/dashboard"
            element={
              <ProtectedRoute allowedRoles={['PARENT']}>
                <ParentLayout>
                  <ParentDashboard />
                </ParentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/children"
            element={
              <ProtectedRoute allowedRoles={['PARENT']}>
                <ParentLayout>
                  <MyChildren />
                </ParentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/attendance"
            element={
              <ProtectedRoute allowedRoles={['PARENT']}>
                <ParentLayout>
                  <Attendance />
                </ParentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/payments"
            element={
              <ProtectedRoute allowedRoles={['PARENT']}>
                <ParentLayout>
                  <Payments />
                </ParentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/tournaments"
            element={
              <ProtectedRoute allowedRoles={['PARENT']}>
                <ParentLayout>
                  <Tournaments />
                </ParentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/reschedule"
            element={
              <ProtectedRoute allowedRoles={['PARENT']}>
                <ParentLayout>
                  <RescheduleRequests />
                </ParentLayout>
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;