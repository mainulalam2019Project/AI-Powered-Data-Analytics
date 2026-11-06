import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import api from '../../services/api';
export default function MLPage() {
    const { id } = useParams(); // datasetId
    const qc = useQueryClient();
    const profile = useQuery({ queryKey: ['dataset', id], queryFn: async () => (await api.get(`/datasets/${id}`)).data });
    const models = useQuery({ queryKey: ['models', id], queryFn: async () => (await api.get(`/ml/models/${id}`)).data });
    const [name, setName] = useState('Model 1');
    const [taskType, setTaskType] = useState('Classification');
    const [algorithm, setAlgorithm] = useState('RandomForest');
    const [target, setTarget] = useState('');
    const [features, setFeatures] = useState([]);
    const [predInput, setPredInput] = useState('{}');
    const [predResult, setPredResult] = useState(null);
    const [selectedModel, setSelectedModel] = useState('');
    const train = useMutation({
        mutationFn: async () => (await api.post('/ml/train', {
            datasetId: id, name, taskType, algorithm, targetColumn: target || null, featureColumns: features
        })).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['models', id] }),
    });
    const predict = useMutation({
        mutationFn: async () => (await api.post('/ml/predict', {
            modelId: selectedModel, rows: [JSON.parse(predInput)]
        })).data,
        onSuccess: (d) => setPredResult(d),
    });
    const cols = profile.data?.columns?.map((c) => c.name) ?? [];
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Machine Learning" }), _jsxs("div", { className: "bg-white p-4 rounded-xl shadow space-y-3", children: [_jsx("h3", { className: "font-semibold", children: "Train Model" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-2", children: [_jsx("input", { className: "border rounded-lg px-3 py-2", value: name, onChange: e => setName(e.target.value), placeholder: "Name" }), _jsxs("select", { className: "border rounded-lg px-3 py-2", value: taskType, onChange: e => setTaskType(e.target.value), children: [_jsx("option", { children: "Classification" }), _jsx("option", { children: "Regression" }), _jsx("option", { children: "Clustering" })] }), _jsxs("select", { className: "border rounded-lg px-3 py-2", value: algorithm, onChange: e => setAlgorithm(e.target.value), children: [_jsx("option", { children: "RandomForest" }), _jsx("option", { children: "LogisticRegression" }), _jsx("option", { children: "LinearRegression" })] }), _jsxs("select", { className: "border rounded-lg px-3 py-2", value: target, onChange: e => setTarget(e.target.value), children: [_jsx("option", { value: "", children: "Target (none for clustering)" }), cols.map((c) => _jsx("option", { value: c, children: c }, c))] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium mb-1", children: "Features" }), _jsx("div", { className: "flex flex-wrap gap-2", children: cols.map((c) => (_jsxs("label", { className: "flex items-center gap-1 text-sm", children: [_jsx("input", { type: "checkbox", checked: features.includes(c), onChange: e => setFeatures(e.target.checked ? [...features, c] : features.filter(f => f !== c)) }), c] }, c))) })] }), _jsx("button", { onClick: () => train.mutate(), className: "bg-brand-500 text-white px-4 py-2 rounded-lg", children: "Train" }), train.isPending && _jsx("span", { className: "text-sm text-slate-500", children: "Training..." }), train.data && _jsx("pre", { className: "text-xs bg-slate-50 p-2 rounded", children: JSON.stringify(train.data, null, 2) })] }), _jsxs("div", { className: "bg-white p-4 rounded-xl shadow space-y-3", children: [_jsx("h3", { className: "font-semibold", children: "Models" }), models.data?.map((m) => (_jsxs("div", { className: "border rounded-lg p-3", children: [_jsxs("div", { className: "font-medium", children: [m.name, " \u2014 ", m.algorithm, " (", m.status, ")"] }), _jsxs("div", { className: "text-xs text-slate-500", children: ["Metrics: ", m.metrics] }), m.featureImportance && _jsxs("div", { className: "text-xs text-slate-500", children: ["Importance: ", m.featureImportance] }), _jsx("button", { onClick: () => setSelectedModel(m.id), className: "text-xs text-brand-600 mt-1", children: "Select for prediction" })] }, m.id)))] }), selectedModel && (_jsxs("div", { className: "bg-white p-4 rounded-xl shadow space-y-3", children: [_jsx("h3", { className: "font-semibold", children: "Predict" }), _jsx("textarea", { className: "w-full border rounded-lg px-3 py-2 font-mono text-sm", rows: 4, value: predInput, onChange: e => setPredInput(e.target.value) }), _jsx("button", { onClick: () => predict.mutate(), className: "bg-brand-500 text-white px-4 py-2 rounded-lg", children: "Predict" }), predResult && _jsx("pre", { className: "text-xs bg-slate-50 p-2 rounded", children: JSON.stringify(predResult, null, 2) })] }))] }));
}
