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
import AdminLayout from './components/admin/AdminLayout';
import AdminStudentManagement from './pages/admin/StudentManagement';
import AdminCoachManagement from './pages/admin/CoachManagement';
import AdminAttendance from './pages/admin/Attendance';
import AdminPayments from './pages/admin/Payments';
import AdminTournaments from './pages/admin/Tournaments';
import AdminSchedule from './pages/admin/Schedule';
import AdminRescheduleRequests from './pages/admin/RescheduleRequests';
import AdminReports from './pages/admin/Reports';
import CreateAdmin from './pages/admin/CreateAdmin';
import ClerkDashboard from './pages/clerk/Dashboard';
import ClerkLayout from './components/clerk/ClerkLayout';
import ClerkStudents from './pages/clerk/Students';
import ClerkAttendance from './pages/clerk/Attendance';
import ClerkPayments from './pages/clerk/Payments';
import ClerkTournaments from './pages/clerk/Tournaments';
import CoachDashboard from './pages/coach/Dashboard';
import CoachLayout from './components/coach/CoachLayout';
import CoachClasses from './pages/coach/MyClasses';
import CoachAttendance from './pages/coach/Attendance';
import CoachSchedule from './pages/coach/Schedule';
import CoachSalary from './pages/coach/Salary';
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
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout>
                  <AdminStudentManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/coaches"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout>
                  <AdminCoachManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout>
                  <AdminAttendance />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout>
                  <AdminPayments />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tournaments"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout>
                  <AdminTournaments />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/schedule"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout>
                  <AdminSchedule />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reschedule-requests"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout>
                  <AdminRescheduleRequests />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout>
                  <AdminReports />
                </AdminLayout>
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
          {/* Clerk Routes */}
          <Route
            path="/clerk/dashboard"
            element={
              <ProtectedRoute allowedRoles={['CLERK']}>
                <ClerkLayout>
                  <ClerkDashboard />
                </ClerkLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/clerk/students"
            element={
              <ProtectedRoute allowedRoles={['CLERK']}>
                <ClerkLayout>
                  <ClerkStudents />
                </ClerkLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/clerk/attendance"
            element={
              <ProtectedRoute allowedRoles={['CLERK']}>
                <ClerkLayout>
                  <ClerkAttendance />
                </ClerkLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/clerk/payments"
            element={
              <ProtectedRoute allowedRoles={['CLERK']}>
                <ClerkLayout>
                  <ClerkPayments />
                </ClerkLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/clerk/tournaments"
            element={
              <ProtectedRoute allowedRoles={['CLERK']}>
                <ClerkLayout>
                  <ClerkTournaments />
                </ClerkLayout>
              </ProtectedRoute>
            }
          />

          {/* Coach Routes */}
          <Route
            path="/coach/dashboard"
            element={
              <ProtectedRoute allowedRoles={['COACH']}>
                <CoachLayout>
                  <CoachDashboard />
                </CoachLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/coach/classes"
            element={
              <ProtectedRoute allowedRoles={['COACH']}>
                <CoachLayout>
                  <CoachClasses />
                </CoachLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/coach/attendance"
            element={
              <ProtectedRoute allowedRoles={['COACH']}>
                <CoachLayout>
                  <CoachAttendance />
                </CoachLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/coach/schedule"
            element={
              <ProtectedRoute allowedRoles={['COACH']}>
                <CoachLayout>
                  <CoachSchedule />
                </CoachLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/coach/salary"
            element={
              <ProtectedRoute allowedRoles={['COACH']}>
                <CoachLayout>
                  <CoachSalary />
                </CoachLayout>
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