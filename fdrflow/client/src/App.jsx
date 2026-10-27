import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import FDRList from './pages/FDRList';
import FDRDetail from './pages/FDRDetail';
import SubmitFDR from './pages/SubmitFDR';
import AuditLog from './pages/AuditLog';
import Institutions from './pages/Institutions';
import './index.css';

const PrivateRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="fdrs" element={<FDRList />} />
        <Route path="fdrs/:id" element={<FDRDetail />} />
        <Route path="fdrs/new" element={
          <PrivateRoute roles={['institution_admin', 'aicte_officer']}>
            <SubmitFDR />
          </PrivateRoute>
        } />
        <Route path="audit" element={<AuditLog />} />
        <Route path="institutions" element={
          <PrivateRoute roles={['aicte_officer', 'auditor']}>
            <Institutions />
          </PrivateRoute>
        } />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#0d1f38', color: '#f0f6ff', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '8px' },
            success: { iconTheme: { primary: '#10b981', secondary: '#f0f6ff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#f0f6ff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
