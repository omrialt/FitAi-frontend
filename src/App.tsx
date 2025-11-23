import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import TrainingPlansPage from './pages/TrainingPlansPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GoogleCallbackPage from './pages/GoogleCallbackPage';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Protected Routes - require authentication */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/training-plans"
        element={
          <ProtectedRoute>
            <TrainingPlansPage />
          </ProtectedRoute>
        }
      />

      {/* Public Routes - redirect if authenticated */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      
      {/* Auth callback - no protection needed */}
      <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
    </Routes>
  );
}

export default App;
