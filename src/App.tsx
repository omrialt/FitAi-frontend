import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import TrainingPlansPage from './pages/TrainingPlansPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GoogleCallbackPage from './pages/GoogleCallbackPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/training-plans" element={<TrainingPlansPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
    </Routes>
  );
}

export default App;
