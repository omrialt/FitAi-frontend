import { Routes, Route } from "react-router-dom";
import {
  AdminUsersPage,
  CalendarPage,
  CompleteProfilePage,
  DashboardPage,
  GoogleCallbackPage,
  LoginPage,
  MyClientsPage,
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
      {/* "/" is intentionally unguarded: DashboardPage renders the public
          landing hero for guests and the dashboard for signed-in users */}
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

      <Route path="/reset-password" element={<ResetPasswordPage />} />
      {/* Admin Users Page - admin only */}
      <Route
        path="/users"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />
      {/* My Clients - trainer/admin only */}
      <Route
        path="/clients"
        element={
          <ProtectedRoute roles={["trainer", "admin"]}>
            <MyClientsPage />
          </ProtectedRoute>
        }
      />
      {/* Complete Profile - intentionally unguarded: the Google OAuth redirect
          lands here with tokens in the URL, which the page stores itself */}
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
