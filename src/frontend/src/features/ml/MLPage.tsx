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
  const [features, setFeatures] = useState<string[]>([]);
  const [predInput, setPredInput] = useState('{}');
  const [predResult, setPredResult] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<string>('');

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

  const cols = profile.data?.columns?.map((c: any) => c.name) ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Machine Learning</h2>

      <div className="bg-white p-4 rounded-xl shadow space-y-3">
        <h3 className="font-semibold">Train Model</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <input className="border rounded-lg px-3 py-2" value={name} onChange={e=>setName(e.target.value)} placeholder="Name" />
          <select className="border rounded-lg px-3 py-2" value={taskType} onChange={e=>setTaskType(e.target.value)}>
            <option>Classification</option><option>Regression</option><option>Clustering</option>
          </select>
          <select className="border rounded-lg px-3 py-2" value={algorithm} onChange={e=>setAlgorithm(e.target.value)}>
            <option>RandomForest</option><option>LogisticRegression</option><option>LinearRegression</option>
          </select>
          <select className="border rounded-lg px-3 py-2" value={target} onChange={e=>setTarget(e.target.value)}>
            <option value="">Target (none for clustering)</option>
            {cols.map((c: string) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <div className="text-sm font-medium mb-1">Features</div>
          <div className="flex flex-wrap gap-2">
            {cols.map((c: string) => (
              <label key={c} className="flex items-center gap-1 text-sm">
                <input type="checkbox" checked={features.includes(c)} onChange={e => setFeatures(e.target.checked ? [...features, c] : features.filter(f=>f!==c))} />
                {c}
              </label>
            ))}
          </div>
        </div>
        <button onClick={() => train.mutate()} className="bg-brand-500 text-white px-4 py-2 rounded-lg">Train</button>
        {train.isPending && <span className="text-sm text-slate-500">Training...</span>}
        {train.data && <pre className="text-xs bg-slate-50 p-2 rounded">{JSON.stringify(train.data, null, 2)}</pre>}
      </div>

      <div className="bg-white p-4 rounded-xl shadow space-y-3">
        <h3 className="font-semibold">Models</h3>
        {models.data?.map((m: any) => (
          <div key={m.id} className="border rounded-lg p-3">
            <div className="font-medium">{m.name} — {m.algorithm} ({m.status})</div>
            <div className="text-xs text-slate-500">Metrics: {m.metrics}</div>
            {m.featureImportance && <div className="text-xs text-slate-500">Importance: {m.featureImportance}</div>}
            <button onClick={() => setSelectedModel(m.id)} className="text-xs text-brand-600 mt-1">Select for prediction</button>
          </div>
        ))}
      </div>

      {selectedModel && (
        <div className="bg-white p-4 rounded-xl shadow space-y-3">
          <h3 className="font-semibold">Predict</h3>
          <textarea className="w-full border rounded-lg px-3 py-2 font-mono text-sm" rows={4} value={predInput} onChange={e=>setPredInput(e.target.value)} />
          <button onClick={() => predict.mutate()} className="bg-brand-500 text-white px-4 py-2 rounded-lg">Predict</button>
          {predResult && <pre className="text-xs bg-slate-50 p-2 rounded">{JSON.stringify(predResult, null, 2)}</pre>}
        </div>
      )}
    </div>
  );
}