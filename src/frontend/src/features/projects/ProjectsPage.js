import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
export default function ProjectsPage() {
    const qc = useQueryClient();
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [file, setFile] = useState(null);
    const [datasetName, setDatasetName] = useState('');
    const projects = useQuery({ queryKey: ['projects'], queryFn: async () => (await api.get('/projects')).data });
    const create = useMutation({
        mutationFn: async () => (await api.post('/projects', { name, description: desc })).data,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); setName(''); setDesc(''); }
    });
    const upload = useMutation({
        mutationFn: async () => {
            const fd = new FormData();
            fd.append('projectId', selectedProject);
            if (datasetName)
                fd.append('name', datasetName);
            fd.append('file', file);
            return (await api.post('/datasets', fd, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
        },
        onSuccess: () => { setFile(null); setDatasetName(''); alert('Uploaded'); }
    });
    const datasets = useQuery({
        queryKey: ['datasets', selectedProject],
        queryFn: async () => (await api.get(`/datasets/project/${selectedProject}`)).data,
        enabled: !!selectedProject,
    });
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Projects" }), _jsxs("div", { className: "bg-white p-4 rounded-xl shadow space-y-3", children: [_jsx("h3", { className: "font-semibold", children: "Create Project" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { className: "border rounded-lg px-3 py-2 flex-1", placeholder: "Name", value: name, onChange: e => setName(e.target.value) }), _jsx("input", { className: "border rounded-lg px-3 py-2 flex-1", placeholder: "Description", value: desc, onChange: e => setDesc(e.target.value) }), _jsx("button", { onClick: () => create.mutate(), className: "bg-brand-500 text-white px-4 rounded-lg", children: "Create" })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: projects.data?.map(p => (_jsxs("div", { className: `bg-white p-4 rounded-xl shadow cursor-pointer ${selectedProject === p.id ? 'ring-2 ring-brand-500' : ''}`, onClick: () => setSelectedProject(p.id), children: [_jsx("div", { className: "font-semibold", children: p.name }), _jsx("div", { className: "text-sm text-slate-500", children: p.description }), _jsxs("div", { className: "text-xs text-slate-400 mt-2", children: [p.datasetCount, " datasets"] }), _jsx("div", { className: "mt-2 flex gap-2", children: _jsx(Link, { to: `/analytics/${p.id}`, className: "text-xs text-brand-600", children: "Analytics" }) })] }, p.id))) }), selectedProject && (_jsxs("div", { className: "bg-white p-4 rounded-xl shadow space-y-3", children: [_jsx("h3", { className: "font-semibold", children: "Upload Dataset" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { className: "border rounded-lg px-3 py-2 flex-1", placeholder: "Dataset name", value: datasetName, onChange: e => setDatasetName(e.target.value) }), _jsx("input", { type: "file", accept: ".csv,.xlsx,.xls", onChange: e => setFile(e.target.files?.[0] || null) }), _jsx("button", { onClick: () => upload.mutate(), disabled: !file, className: "bg-brand-500 text-white px-4 rounded-lg disabled:opacity-50", children: "Upload" })] }), _jsx("div", { className: "space-y-2", children: datasets.data?.map(d => (_jsxs("div", { className: "border rounded-lg p-3 flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: d.name }), _jsxs("div", { className: "text-xs text-slate-500", children: [d.status, " \u00B7 ", d.rowCount ?? '?', " rows \u00B7 ", d.columnCount ?? '?', " cols"] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Link, { to: `/datasets/${d.id}`, className: "text-sm text-brand-600", children: "View" }), _jsx(Link, { to: `/analytics/${d.id}`, className: "text-sm text-brand-600", children: "Analytics" }), _jsx(Link, { to: `/ml/${d.id}`, className: "text-sm text-brand-600", children: "ML" }), _jsx(Link, { to: `/insights/${d.id}`, className: "text-sm text-brand-600", children: "Insights" })] })] }, d.id))) })] }))] }));
}
