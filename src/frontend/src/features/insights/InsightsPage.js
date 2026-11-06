import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
export default function InsightsPage() {
    const { id } = useParams();
    const insights = useQuery({ queryKey: ['insights', id], queryFn: async () => (await api.get(`/analytics/${id}/insights`)).data });
    const data = insights.data;
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-2xl font-bold", children: "AI Insights" }), insights.isLoading && _jsx("div", { children: "Loading..." }), data && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-white p-4 rounded-xl shadow", children: [_jsx("h3", { className: "font-semibold mb-2", children: "Summary" }), _jsx("p", { className: "text-slate-700", children: data.summary })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(ListCard, { title: "Trends", items: data.trends }), _jsx(ListCard, { title: "Anomalies", items: data.anomalies }), _jsx(ListCard, { title: "Recommendations", items: data.recommendations })] })] }))] }));
}
function ListCard({ title, items }) {
    return (_jsxs("div", { className: "bg-white p-4 rounded-xl shadow", children: [_jsx("h3", { className: "font-semibold mb-2", children: title }), _jsxs("ul", { className: "list-disc pl-5 text-sm space-y-1", children: [(items || []).map((x, i) => _jsx("li", { children: x }, i)), (!items || items.length === 0) && _jsx("li", { className: "text-slate-400", children: "None" })] })] }));
}
