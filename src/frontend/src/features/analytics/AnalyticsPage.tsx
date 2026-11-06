import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AnalyticsPage() {
  const { id } = useParams();
  const eda = useQuery({ queryKey: ['eda', id], queryFn: async () => (await api.get(`/analytics/${id}/eda`)).data });

  if (eda.isLoading) return <div>Loading analytics...</div>;
  const data = eda.data;
  const numerical = data?.numerical?.columns ?? {};
  const edaSummary = data?.eda ?? {};

  const meansData = Object.entries(numerical).map(([k, v]: any) => ({ name: k, mean: v?.mean ?? 0 }));
  const missingData = Object.entries(edaSummary.missingByColumn ?? {}).map(([k, v]) => ({ name: k, value: v as number }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-2">Column Means</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={meansData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="mean" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-2">Missing Values</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={missingData} dataKey="value" nameKey="name" outerRadius={90} label>
                {missingData.map((_, i) => <Cell key={i} fill={`hsl(${i*40},70%,55%)`} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-2">Correlation Matrix</h3>
        <div className="overflow-auto">
          <table className="text-xs">
            <thead>
              <tr><th></th>{Object.keys(data?.numerical?.correlation ?? {}).map(c => <th key={c} className="p-1">{c}</th>)}</tr>
            </thead>
            <tbody>
              {Object.entries(data?.numerical?.correlation ?? {}).map(([r, row]: any) => (
                <tr key={r}>
                  <td className="p-1 font-medium">{r}</td>
                  {Object.values(row).map((v: any, i) => (
                    <td key={i} className="p-1 text-center" style={{ background: v !== null ? `rgba(79,70,229,${Math.abs(v)})` : undefined, color: Math.abs(v||0)>0.5?'white':'black' }}>
                      {v !== null ? v.toFixed(2) : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}