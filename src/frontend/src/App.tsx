import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import DashboardPage from './features/dashboard/DashboardPage';
import ProjectsPage from './features/projects/ProjectsPage';
import DatasetPage from './features/datasets/DatasetPage';
import AnalyticsPage from './features/analytics/AnalyticsPage';
import MLPage from './features/ml/MLPage';
import InsightsPage from './features/insights/InsightsPage';

function Guard({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<Guard><Layout /></Guard>}>
        <Route index element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="datasets/:id" element={<DatasetPage />} />
        <Route path="analytics/:id" element={<AnalyticsPage />} />
        <Route path="ml/:id" element={<MLPage />} />
        <Route path="insights/:id" element={<InsightsPage />} />
      </Route>
    </Routes>
  );
}