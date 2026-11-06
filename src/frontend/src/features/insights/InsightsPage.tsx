import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

export default function InsightsPage() {
  const { id } = useParams();
  const insights = useQuery({ queryKey: ['insights', id], queryFn: async () => (await api.get(`/analytics/${id}/insights`)).data });
  const data = insights.data;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">AI Insights</h2>
      {insights.isLoading && <div>Loading...</div>}
      {data && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-2">Summary</h3>
            <p className="text-slate-700">{data.summary}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ListCard title="Trends" items={data.trends} />
            <ListCard title="Anomalies" items={data.anomalies} />
            <ListCard title="Recommendations" items={data.recommendations} />
          </div>
        </div>
      )}
    </div>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-semibold mb-2">{title}</h3>
      <ul className="list-disc pl-5 text-sm space-y-1">
        {(items || []).map((x, i) => <li key={i}>{x}</li>)}
        {(!items || items.length === 0) && <li className="text-slate-400">None</li>}
      </ul>
    </div>
  );
}