'use client';

import * as React from 'react';
import { Card } from '../ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SentimentData {
  name: string;
  value: number;
  color: string;
}

const demoData: SentimentData[] = [
  { name: 'Very Satisfied', value: 45, color: '#22C55E' },
  { name: 'Satisfied', value: 30, color: '#60A5FA' },
  { name: 'Neutral', value: 15, color: '#F59E0B' },
  { name: 'Dissatisfied', value: 7, color: '#EF4444' },
  { name: 'Very Dissatisfied', value: 3, color: '#DC2626' },
];

async function fetchLiveSentimentData(): Promise<SentimentData[]> {
  // In a real implementation, this would fetch from your API
  // For now, we'll simulate some random variations
  return demoData.map(sentiment => ({
    ...sentiment,
    value: Math.max(1, sentiment.value + Math.floor(Math.random() * 10 - 5))
  }));
}

export default function SentimentAnalysis({ isLive = false }: { isLive?: boolean }) {
  const [data, setData] = React.useState<SentimentData[]>(demoData);

  React.useEffect(() => {
    if (isLive) {
      const loadLiveData = async () => {
        const liveData = await fetchLiveSentimentData();
        setData(liveData);
      };

      loadLiveData();
      // Refresh every 30 seconds
      const interval = setInterval(loadLiveData, 30000);
      return () => clearInterval(interval);
    } else {
      setData(demoData);
    }
  }, [isLive]);

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversation Sentiment</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip
              formatter={(value: number) => [`${value}%`, 'Percentage']}
            />
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
} 