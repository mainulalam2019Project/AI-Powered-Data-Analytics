import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
export default function DatasetPage() {
    const { id } = useParams();
    const profile = useQuery({ queryKey: ['dataset', id], queryFn: async () => (await api.get(`/datasets/${id}`)).data });
    if (profile.isLoading)
        return _jsx("div", { children: "Loading..." });
    if (!profile.data)
        return _jsx("div", { children: "Not found" });
    const d = profile.data.dataset;
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-2xl font-bold", children: d.name }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsx(Kpi, { label: "Rows", value: d.rowCount ?? 0 }), _jsx(Kpi, { label: "Columns", value: d.columnCount ?? 0 }), _jsx(Kpi, { label: "Missing", value: d.missingValueCount ?? 0 }), _jsx(Kpi, { label: "Duplicates", value: d.duplicateRowCount ?? 0 })] }), _jsx("div", { className: "bg-white rounded-xl shadow overflow-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-slate-100", children: _jsxs("tr", { children: [_jsx("th", { className: "p-2 text-left", children: "Column" }), _jsx("th", { className: "p-2 text-left", children: "Type" }), _jsx("th", { className: "p-2 text-left", children: "Missing" }), _jsx("th", { className: "p-2 text-left", children: "Distinct" }), _jsx("th", { className: "p-2 text-left", children: "Sample" })] }) }), _jsx("tbody", { children: profile.data.columns.map(c => (_jsxs("tr", { className: "border-t", children: [_jsx("td", { className: "p-2 font-medium", children: c.name }), _jsx("td", { className: "p-2", children: c.dataType }), _jsx("td", { className: "p-2", children: c.missingCount }), _jsx("td", { className: "p-2", children: c.distinctCount ?? '-' }), _jsx("td", { className: "p-2 text-xs", children: Array.isArray(c.sampleValues) ? c.sampleValues.join(', ') : '' })] }, c.id))) })] }) })] }));
}
function Kpi({ label, value }) {
    return (_jsxs("div", { className: "bg-white p-4 rounded-xl shadow", children: [_jsx("div", { className: "text-sm text-slate-500", children: label }), _jsx("div", { className: "text-2xl font-bold", children: value })] }));
}
