import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
export default function DashboardPage() {
    const projects = useQuery({ queryKey: ['projects'], queryFn: async () => (await api.get('/projects')).data });
    const totalProjects = projects.data?.length ?? 0;
    const totalDatasets = projects.data?.reduce((a, p) => a + p.datasetCount, 0) ?? 0;
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Dashboard" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-white p-6 rounded-xl shadow", children: [_jsx("div", { className: "text-sm text-slate-500", children: "Projects" }), _jsx("div", { className: "text-3xl font-bold", children: totalProjects })] }), _jsxs("div", { className: "bg-white p-6 rounded-xl shadow", children: [_jsx("div", { className: "text-sm text-slate-500", children: "Datasets" }), _jsx("div", { className: "text-3xl font-bold", children: totalDatasets })] }), _jsxs("div", { className: "bg-white p-6 rounded-xl shadow", children: [_jsx("div", { className: "text-sm text-slate-500", children: "Status" }), _jsx("div", { className: "text-3xl font-bold text-green-600", children: "Active" })] })] }), _jsxs("div", { className: "bg-white p-6 rounded-xl shadow", children: [_jsx("h3", { className: "font-semibold mb-2", children: "Welcome" }), _jsx("p", { className: "text-slate-600", children: "Upload datasets in Projects, explore analytics, train ML models, and generate insights." })] })] }));
}
