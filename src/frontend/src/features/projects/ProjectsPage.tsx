import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../services/api';
import { Project, Dataset } from '../../types';
import { Link } from 'react-router-dom';

export default function ProjectsPage() {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState('');

  const projects = useQuery<Project[]>({ queryKey: ['projects'], queryFn: async () => (await api.get('/projects')).data });
  const create = useMutation({
    mutationFn: async () => (await api.post('/projects', { name, description: desc })).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); setName(''); setDesc(''); }
  });
  const upload = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('projectId', selectedProject!);
      if (datasetName) fd.append('name', datasetName);
      fd.append('file', file!);
      return (await api.post('/datasets', fd, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
    },
    onSuccess: () => { setFile(null); setDatasetName(''); alert('Uploaded'); }
  });

  const datasets = useQuery<Dataset[]>({
    queryKey: ['datasets', selectedProject],
    queryFn: async () => (await api.get(`/datasets/project/${selectedProject}`)).data,
    enabled: !!selectedProject,
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Projects</h2>
      <div className="bg-white p-4 rounded-xl shadow space-y-3">
        <h3 className="font-semibold">Create Project</h3>
        <div className="flex gap-2">
          <input className="border rounded-lg px-3 py-2 flex-1" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
          <input className="border rounded-lg px-3 py-2 flex-1" placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} />
          <button onClick={() => create.mutate()} className="bg-brand-500 text-white px-4 rounded-lg">Create</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.data?.map(p => (
          <div key={p.id} className={`bg-white p-4 rounded-xl shadow cursor-pointer ${selectedProject===p.id?'ring-2 ring-brand-500':''}`} onClick={() => setSelectedProject(p.id)}>
            <div className="font-semibold">{p.name}</div>
            <div className="text-sm text-slate-500">{p.description}</div>
            <div className="text-xs text-slate-400 mt-2">{p.datasetCount} datasets</div>
            <div className="mt-2 flex gap-2">
              <Link to={`/analytics/${p.id}`} className="text-xs text-brand-600">Analytics</Link>
            </div>
          </div>
        ))}
      </div>

      {selectedProject && (
        <div className="bg-white p-4 rounded-xl shadow space-y-3">
          <h3 className="font-semibold">Upload Dataset</h3>
          <div className="flex gap-2">
            <input className="border rounded-lg px-3 py-2 flex-1" placeholder="Dataset name" value={datasetName} onChange={e=>setDatasetName(e.target.value)} />
            <input type="file" accept=".csv,.xlsx,.xls" onChange={e=>setFile(e.target.files?.[0]||null)} />
            <button onClick={() => upload.mutate()} disabled={!file} className="bg-brand-500 text-white px-4 rounded-lg disabled:opacity-50">Upload</button>
          </div>
          <div className="space-y-2">
            {datasets.data?.map(d => (
              <div key={d.id} className="border rounded-lg p-3 flex justify-between items-center">
                <div>
                  <div className="font-medium">{d.name}</div>
                  <div className="text-xs text-slate-500">{d.status} · {d.rowCount ?? '?'} rows · {d.columnCount ?? '?'} cols</div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/datasets/${d.id}`} className="text-sm text-brand-600">View</Link>
                  <Link to={`/analytics/${d.id}`} className="text-sm text-brand-600">Analytics</Link>
                  <Link to={`/ml/${d.id}`} className="text-sm text-brand-600">ML</Link>
                  <Link to={`/insights/${d.id}`} className="text-sm text-brand-600">Insights</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}