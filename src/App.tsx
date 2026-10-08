import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../frontend/src/context/AuthContext';

// Components
import Navbar from '../frontend/src/components/Navbar';
import Sidebar from '../frontend/src/components/Sidebar';
import ProtectedRoute from '../frontend/src/components/ProtectedRoute';

// Auth Pages
import Login from '../frontend/src/pages/Login';
import Register from '../frontend/src/pages/Register';
import Dashboard from '../frontend/src/pages/Dashboard';

// Admin Pages
import AdminDashboard from '../frontend/src/pages/admin/AdminDashboard';
import ManageStudents from '../frontend/src/pages/admin/ManageStudents';
import ManageTeachers from '../frontend/src/pages/admin/ManageTeachers';
import ManageClasses from '../frontend/src/pages/admin/ManageClasses';
import ManageNotices from '../frontend/src/pages/admin/ManageNotices';
import ManageFees from '../frontend/src/pages/admin/ManageFees';

// Teacher Pages
import TeacherDashboard from '../frontend/src/pages/teacher/TeacherDashboard';
import MarkAttendance from '../frontend/src/pages/teacher/MarkAttendance';
import Assignments from '../frontend/src/pages/teacher/Assignments';
import ManageResults from '../frontend/src/pages/teacher/ManageResults';

// Student Pages
import StudentDashboard from '../frontend/src/pages/student/StudentDashboard';
import MyAttendance from '../frontend/src/pages/student/MyAttendance';
import MyAssignments from '../frontend/src/pages/student/MyAssignments';
import MyResults from '../frontend/src/pages/student/MyResults';
import MyFees from '../frontend/src/pages/student/MyFees';
import Notices from '../frontend/src/pages/student/Notices';

// Main App Layout wrapper
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout-wrapper">
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <div className="app-layout-body">
        {currentUser && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        <main className="app-main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

// Root index redirect based on user role
const RootRedirect = () => {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role === 'admin') return <Navigate to="/admin" replace />;
  if (currentUser.role === 'teacher') return <Navigate to="/teacher" replace />;
  if (currentUser.role === 'student') return <Navigate to="/student" replace />;
  return <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root Redirection */}
          <Route path="/" element={<RootRedirect />} />

          {/* Shared Profile Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <AdminDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <ManageStudents />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/teachers"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <ManageTeachers />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/classes"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <ManageClasses />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/fees"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <ManageFees />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notices"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <ManageNotices />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Teacher Routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <AppLayout>
                  <TeacherDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/students"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <AppLayout>
                  <ManageStudents />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/attendance"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <AppLayout>
                  <MarkAttendance />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/assignments"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <AppLayout>
                  <Assignments />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/results"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <AppLayout>
                  <ManageResults />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <AppLayout>
                  <StudentDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/attendance"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <AppLayout>
                  <MyAttendance />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/assignments"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <AppLayout>
                  <MyAssignments />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/results"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <AppLayout>
                  <MyResults />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/fees"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <AppLayout>
                  <MyFees />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/notices"
            element={
              <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                <AppLayout>
                  <Notices />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
