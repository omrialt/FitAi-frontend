import { Routes, Route } from "react-router-dom";
import {
  AdminUsersPage,
  CalendarPage,
  CompleteProfilePage,
  DashboardPage,
  GoogleCallbackPage,
  LoginPage,
  MyNutritionsPage,
  MyTrainingsPage,
  NotFoundPage,
  NutritionPlanDetailsPage,
  ProfilePage,
  RegisterPage,
  ResetPasswordPage,
  TrainingPlanDetailsPage,
  PhysicalDataPage
} from "./pages";
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
        path="/training-plans/:id"
        element={
          <ProtectedRoute>
            <TrainingPlanDetailsPage />
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
      <Route
        path="/nutrition-plans/:id"
        element={
          <ProtectedRoute>
            <NutritionPlanDetailsPage />
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

      {/* Physical Data Page - requires authentication */}
      <Route
        path="/physical-data"
        element={
          <ProtectedRoute>
            <PhysicalDataPage />
          </ProtectedRoute>
        }
      />

      {/* Calendar Page - requires authentication */}
      <Route
        path="/schedule"
        element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        }
      />

      {/* 404 Not Found - catch all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
