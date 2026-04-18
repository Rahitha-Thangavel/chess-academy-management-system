import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AppUIProvider } from './contexts/AppUIContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
import AdminBatchManagement from './pages/admin/batches/List';
import CreateAdmin from './pages/admin/CreateAdmin';
import ClerkDashboard from './pages/clerk/Dashboard';
import ClerkLayout from './components/clerk/ClerkLayout';
import ClerkStudents from './pages/clerk/Students';
import ClerkAttendance from './pages/clerk/Attendance';
import ClerkPayments from './pages/clerk/Payments';
import ClerkTournaments from './pages/clerk/Tournaments';
import ClerkBatches from './pages/clerk/Batches';
import ClerkRescheduleRequests from './pages/clerk/RescheduleRequests';
import CoachDashboard from './pages/coach/Dashboard';
import CoachLayout from './components/coach/CoachLayout';
import CoachClasses from './pages/coach/MyClasses';
import CoachAttendance from './pages/coach/Attendance';
import CoachSchedule from './pages/coach/Schedule';
import CoachSalary from './pages/coach/Salary';
import BatchApplications from './pages/coach/BatchApplications';
import ParentDashboard from './pages/parent/Dashboard';
import ParentLayout from './components/parent/ParentLayout';
import MyChildren from './pages/parent/MyChildren';
import Attendance from './pages/parent/Attendance';
import Payments from './pages/parent/Payments';
import Tournaments from './pages/parent/Tournaments';

import RescheduleRequests from './pages/parent/RescheduleRequests';
import Notifications from './pages/common/Notifications';
import AddChild from './pages/parent/AddChild';
import RegistrationSuccess from './pages/parent/RegistrationSuccess';
import PaymentCheckout from './pages/parent/PaymentCheckout';
import PaymentReceipt from './pages/parent/PaymentReceipt';
import TournamentRegistration from './pages/parent/TournamentRegistration';
import NewRescheduleRequest from './pages/parent/NewRescheduleRequest';

// Error Pages
import NotFound from './pages/errors/NotFound';
import Unauthorized from './pages/errors/Unauthorized';

// CSS
// CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import MarkAttendance from './pages/coach/MarkAttendance';
import Profile from './pages/common/Profile';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppUIProvider>
          <Router>
            <ToastContainer position="top-center" autoClose={3000} />
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
            path="/admin/profile"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout>
                  <Profile />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout>
                  <Notifications />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/batches"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout>
                  <AdminBatchManagement />
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
          <Route
            path="/clerk/batches"
            element={
              <ProtectedRoute allowedRoles={['CLERK']}>
                <ClerkLayout>
                  <ClerkBatches />
                </ClerkLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/clerk/reschedule-requests"
            element={
              <ProtectedRoute allowedRoles={['CLERK']}>
                <ClerkLayout>
                  <ClerkRescheduleRequests />
                </ClerkLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/clerk/notifications"
            element={
              <ProtectedRoute allowedRoles={['CLERK']}>
                <ClerkLayout>
                  <Notifications />
                </ClerkLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/clerk/profile"
            element={
              <ProtectedRoute allowedRoles={['CLERK']}>
                <ClerkLayout>
                  <Profile />
                </ClerkLayout>
              </ProtectedRoute>
            }
          />
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
            path="/coach/batch-applications"
            element={
              <ProtectedRoute allowedRoles={['COACH']}>
                <CoachLayout>
                  <BatchApplications />
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
          <Route
            path="/coach/mark-attendance"
            element={
              <ProtectedRoute allowedRoles={['COACH']}>
                <CoachLayout>
                  <MarkAttendance />
                </CoachLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/coach/notifications"
            element={
              <ProtectedRoute allowedRoles={['COACH']}>
                <CoachLayout>
                  <Notifications />
                </CoachLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/coach/profile"
            element={
              <ProtectedRoute allowedRoles={['COACH']}>
                <CoachLayout>
                  <Profile />
                </CoachLayout>
              </ProtectedRoute>
            }
          />

          {/* Parent Routes */}
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
            path="/parent/add-child"
            element={
              <ProtectedRoute allowedRoles={['PARENT']}>
                <ParentLayout>
                  <AddChild />
                </ParentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/registration-success"
            element={
              <ProtectedRoute allowedRoles={['PARENT']}>
                <RegistrationSuccess />
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
            path="/parent/payment/checkout/:id"
            element={
              <ProtectedRoute allowedRoles={['PARENT']}>
                <ParentLayout>
                  <PaymentCheckout />
                </ParentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/payment/receipt/:id"
            element={
              <ProtectedRoute allowedRoles={['PARENT']}>
                <ParentLayout>
                  <PaymentReceipt />
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
            path="/parent/tournaments/register/:id"
            element={
              <ProtectedRoute allowedRoles={['PARENT']}>
                <ParentLayout>
                  <TournamentRegistration />
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
          <Route
            path="/parent/reschedule/new"
            element={
              <ProtectedRoute allowedRoles={['PARENT']}>
                <ParentLayout>
                  <NewRescheduleRequest />
                </ParentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/notifications"
            element={
              <ProtectedRoute allowedRoles={['PARENT']}>
                <ParentLayout>
                  <Notifications />
                </ParentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/profile"
            element={
              <ProtectedRoute allowedRoles={['PARENT']}>
                <ParentLayout>
                  <Profile />
                </ParentLayout>
              </ProtectedRoute>
            }
          />

          {/* Common Routes */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'CLERK', 'COACH', 'PARENT']}>
                {/* Layout will be handled by the specific page or component if needed, 
                      but typically notifications need to be wrapped in the user's role layout. 
                      For simplicity, we might render it without layout or need a wrapper. 
                      Let's assume for now it renders inside the role-specific layout which is tricky here. 
                      Actually, better to having per-role routes or a wrapper that detects role.
                      For this specific architecture, let's just make it a standalone page with a back button.
                   */}
                <div className="bg-light min-vh-100 p-4">
                  <Notifications />
                </div>
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
            </Routes>
          </Router >
        </AppUIProvider>
      </NotificationProvider>
    </AuthProvider >
  );
}

export default App;
