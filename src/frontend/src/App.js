import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
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
function Guard({ children }) {
    const { token } = useAuth();
    if (!token)
        return _jsx(Navigate, { to: "/login", replace: true });
    return _jsx(_Fragment, { children: children });
}
export default function App() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsxs(Route, { path: "/", element: _jsx(Guard, { children: _jsx(Layout, {}) }), children: [_jsx(Route, { index: true, element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "projects", element: _jsx(ProjectsPage, {}) }), _jsx(Route, { path: "datasets/:id", element: _jsx(DatasetPage, {}) }), _jsx(Route, { path: "analytics/:id", element: _jsx(AnalyticsPage, {}) }), _jsx(Route, { path: "ml/:id", element: _jsx(MLPage, {}) }), _jsx(Route, { path: "insights/:id", element: _jsx(InsightsPage, {}) })] })] }));
}
