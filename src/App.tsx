import { Suspense, lazy, type ComponentType } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader } from "@mantine/core";
// Direct paths, not the `./pages` barrel: importing anything through the
// barrel evaluates every page it re-exports and undoes the splitting below.
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";

/**
 * Every page but the two a visit can open on is its own chunk.
 *
 * The app shipped as one 2.6MB script, so the home screen downloaded the
 * spreadsheet and PDF exporters, the drag-and-drop editor and every trainer
 * screen before it could draw anything. `/` (dashboard or landing) and
 * `/login` stay in the entry bundle because they are where a visit starts;
 * everything else loads on first navigation.
 *
 * A deploy replaces the chunk files, so a tab opened before it can ask for a
 * chunk that no longer exists. That rejection reloads the page once — which
 * fetches the new index and its new chunk names — instead of leaving the
 * error boundary on screen. The session flag stops a genuinely missing chunk
 * from looping.
 */
const RELOAD_FLAG = "fitai:chunk-reload";

function lazyPage<T extends ComponentType<object>>(
  load: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      const module = await load();
      try {
        sessionStorage.removeItem(RELOAD_FLAG);
      } catch {
        // Storage can be blocked; the reload guard is best-effort.
      }
      return module;
    } catch (error) {
      let reloaded = false;
      try {
        reloaded = sessionStorage.getItem(RELOAD_FLAG) === "1";
        if (!reloaded) sessionStorage.setItem(RELOAD_FLAG, "1");
      } catch {
        reloaded = true;
      }
      if (!reloaded) window.location.reload();
      throw error;
    }
  });
}

const AdminUsersPage = lazyPage(() => import("./pages/AdminUsersPage"));
const CalendarPage = lazyPage(() => import("./pages/CalendarPage"));
const CompleteProfilePage = lazyPage(
  () => import("./pages/CompleteProfilePage"),
);
const GoogleCallbackPage = lazyPage(() => import("./pages/GoogleCallbackPage"));
const MyClientsPage = lazyPage(() => import("./pages/MyClientsPage"));
const MyNutritionsPage = lazyPage(() => import("./pages/MyNutritionsPage"));
const MyTrainingsPage = lazyPage(() => import("./pages/MyTrainingsPage"));
const NotFoundPage = lazyPage(() => import("./pages/NotFoundPage"));
const NutritionPlanDetailsPage = lazyPage(
  () => import("./pages/NutritionPlanDetailsPage"),
);
const ProfilePage = lazyPage(() => import("./pages/ProfilePage"));
const RegisterPage = lazyPage(() => import("./pages/RegisterPage"));
const ResetPasswordPage = lazyPage(() => import("./pages/ResetPasswordPage"));
const TrainingPlanDetailsPage = lazyPage(
  () => import("./pages/TrainingPlanDetailsPage"),
);
const PhysicalDataPage = lazyPage(() => import("./pages/PhysicalDataPage"));
const VerifyEmailPage = lazyPage(() => import("./pages/VerifyEmailPage"));
const WorkoutSessionPage = lazyPage(() => import("./pages/WorkoutSessionPage"));
const WorkoutHistoryPage = lazyPage(() => import("./pages/WorkoutHistoryPage"));
const ClientDetailPage = lazyPage(() => import("./pages/ClientDetailPage"));
const TrainerDashboardPage = lazyPage(
  () => import("./pages/TrainerDashboardPage"),
);
const MessagesPage = lazyPage(() => import("./pages/MessagesPage"));
const PlanLibraryPage = lazyPage(() => import("./pages/PlanLibraryPage"));
const LogMealPage = lazyPage(() => import("./pages/LogMealPage"));

/** Shown for the moment a page's chunk is in flight. */
function PageFallback() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      aria-busy="true"
    >
      <Loader color="indigo" size="md" />
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<PageFallback />}>
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

        {/* The roster overview. A static segment outranks the `:clientId`
          route below it in React Router's matcher, so "overview" is never
          read as a client id. */}
        <Route
          path="/clients/overview"
          element={
            <ProtectedRoute roles={["trainer", "admin"]}>
              <TrainerDashboardPage />
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

        {/* The trainer's template library and bulk assignment. */}
        <Route
          path="/plan-library"
          element={
            <ProtectedRoute roles={["trainer", "admin"]}>
              <PlanLibraryPage />
            </ProtectedRoute>
          }
        />

        {/* Messaging. Open to every signed-in role: the client half of a
          trainer↔client conversation has role "user". */}
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
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
    </Suspense>
  );
}

export default App;
