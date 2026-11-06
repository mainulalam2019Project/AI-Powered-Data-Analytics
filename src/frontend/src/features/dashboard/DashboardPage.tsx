import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Project } from '../../types';

export default function DashboardPage() {
  const projects = useQuery<Project[]>({ queryKey: ['projects'], queryFn: async () => (await api.get('/projects')).data });
  const totalProjects = projects.data?.length ?? 0;
  const totalDatasets = projects.data?.reduce((a, p) => a + p.datasetCount, 0) ?? 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="text-sm text-slate-500">Projects</div>
          <div className="text-3xl font-bold">{totalProjects}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="text-sm text-slate-500">Datasets</div>
          <div className="text-3xl font-bold">{totalDatasets}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="text-sm text-slate-500">Status</div>
          <div className="text-3xl font-bold text-green-600">Active</div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-2">Welcome</h3>
        <p className="text-slate-600">Upload datasets in Projects, explore analytics, train ML models, and generate insights.</p>
      </div>
    </div>
  );
}