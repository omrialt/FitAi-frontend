import { Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import MyTrainingsPage from "./pages/MyTrainingsPage";
import MyNutritionsPage from "./pages/MyNutritionsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import GoogleCallbackPage from "./pages/GoogleCallbackPage";
import CompleteProfilePage from "./pages/CompleteProfilePage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Protected Routes - require authentication */}
      <Route path="/" element={<DashboardPage />} />
      <Route
        path="/my-trainings"
        element={
          <ProtectedRoute>
            <MyTrainingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nutrition-plans"
        element={
          <ProtectedRoute>
            <MyNutritionsPage />
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

      {/* Complete Profile - for Google OAuth users */}
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      {/* Admin Users Page */}
      <Route path="/users" element={<AdminUsersPage />} />
      <Route path="/complete-profile" element={<CompleteProfilePage />} />

      {/* Profile Page - requires authentication */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* 404 Not Found - catch all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
