import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { DatasetProfile } from '../../types';

export default function DatasetPage() {
  const { id } = useParams();
  const profile = useQuery<DatasetProfile>({ queryKey: ['dataset', id], queryFn: async () => (await api.get(`/datasets/${id}`)).data });

  if (profile.isLoading) return <div>Loading...</div>;
  if (!profile.data) return <div>Not found</div>;

  const d = profile.data.dataset;
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{d.name}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi label="Rows" value={d.rowCount ?? 0} />
        <Kpi label="Columns" value={d.columnCount ?? 0} />
        <Kpi label="Missing" value={d.missingValueCount ?? 0} />
        <Kpi label="Duplicates" value={d.duplicateRowCount ?? 0} />
      </div>
      <div className="bg-white rounded-xl shadow overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 text-left">Column</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Missing</th>
              <th className="p-2 text-left">Distinct</th>
              <th className="p-2 text-left">Sample</th>
            </tr>
          </thead>
          <tbody>
            {profile.data.columns.map(c => (
              <tr key={c.id} className="border-t">
                <td className="p-2 font-medium">{c.name}</td>
                <td className="p-2">{c.dataType}</td>
                <td className="p-2">{c.missingCount}</td>
                <td className="p-2">{c.distinctCount ?? '-'}</td>
                <td className="p-2 text-xs">{Array.isArray(c.sampleValues) ? c.sampleValues.join(', ') : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}