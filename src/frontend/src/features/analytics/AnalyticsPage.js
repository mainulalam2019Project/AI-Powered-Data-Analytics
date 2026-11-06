import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
export default function AnalyticsPage() {
    const { id } = useParams();
    const eda = useQuery({ queryKey: ['eda', id], queryFn: async () => (await api.get(`/analytics/${id}/eda`)).data });
    if (eda.isLoading)
        return _jsx("div", { children: "Loading analytics..." });
    const data = eda.data;
    const numerical = data?.numerical?.columns ?? {};
    const edaSummary = data?.eda ?? {};
    const meansData = Object.entries(numerical).map(([k, v]) => ({ name: k, mean: v?.mean ?? 0 }));
    const missingData = Object.entries(edaSummary.missingByColumn ?? {}).map(([k, v]) => ({ name: k, value: v }));
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Analytics" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-white p-4 rounded-xl shadow", children: [_jsx("h3", { className: "font-semibold mb-2", children: "Column Means" }), _jsx(ResponsiveContainer, { width: "100%", height: 260, children: _jsxs(BarChart, { data: meansData, children: [_jsx(XAxis, { dataKey: "name" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "mean", fill: "#4f46e5" })] }) })] }), _jsxs("div", { className: "bg-white p-4 rounded-xl shadow", children: [_jsx("h3", { className: "font-semibold mb-2", children: "Missing Values" }), _jsx(ResponsiveContainer, { width: "100%", height: 260, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: missingData, dataKey: "value", nameKey: "name", outerRadius: 90, label: true, children: missingData.map((_, i) => _jsx(Cell, { fill: `hsl(${i * 40},70%,55%)` }, i)) }), _jsx(Tooltip, {})] }) })] })] }), _jsxs("div", { className: "bg-white p-4 rounded-xl shadow", children: [_jsx("h3", { className: "font-semibold mb-2", children: "Correlation Matrix" }), _jsx("div", { className: "overflow-auto", children: _jsxs("table", { className: "text-xs", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", {}), Object.keys(data?.numerical?.correlation ?? {}).map(c => _jsx("th", { className: "p-1", children: c }, c))] }) }), _jsx("tbody", { children: Object.entries(data?.numerical?.correlation ?? {}).map(([r, row]) => (_jsxs("tr", { children: [_jsx("td", { className: "p-1 font-medium", children: r }), Object.values(row).map((v, i) => (_jsx("td", { className: "p-1 text-center", style: { background: v !== null ? `rgba(79,70,229,${Math.abs(v)})` : undefined, color: Math.abs(v || 0) > 0.5 ? 'white' : 'black' }, children: v !== null ? v.toFixed(2) : '-' }, i)))] }, r))) })] }) })] })] }));
}
