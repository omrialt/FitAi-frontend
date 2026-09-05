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
  PhysicalDataPage,
  VerifyEmailPage,
  WorkoutSessionPage,
  WorkoutHistoryPage,
  ClientDetailPage
} from "./pages";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";
import LogMealPage from './pages/LogMealPage';

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
      {/* Email verification link target — unguarded: the whole point is that
          the recipient may not be signed in on this device */}
      <Route path="/verify-email" element={<VerifyEmailPage />} />
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

      {/* Live workout logger — one plan day at a time */}
      <Route
        path="/workout/:planId/:dayIndex"
        element={
          <ProtectedRoute>
            <WorkoutSessionPage />
          </ProtectedRoute>
        }
      />

      {/* The user's own training log — the read side of the logger above */}
      <Route
        path="/workout-history"
        element={
          <ProtectedRoute>
            <WorkoutHistoryPage />
          </ProtectedRoute>
        }
      />

      {/* A single client's data, read-only. The backend still enforces that
          the connection is accepted; this route only hides the entry point. */}
      <Route
        path="/clients/:clientId"
        element={
          <ProtectedRoute roles={["trainer", "admin"]}>
            <ClientDetailPage />
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
      <Route
        path="/log-meal"
        element={
          <ProtectedRoute>
            <LogMealPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
