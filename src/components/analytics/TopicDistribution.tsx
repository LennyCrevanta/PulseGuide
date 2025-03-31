'use client';

import * as React from 'react';
import { Card } from '../ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface TopicData {
  name: string;
  value: number;
}

const demoData: TopicData[] = [
  { name: 'Health Insurance', value: 35 },
  { name: 'Retirement Plans', value: 25 },
  { name: 'Time Off', value: 20 },
  { name: 'Dental & Vision', value: 15 },
  { name: 'Other Benefits', value: 5 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

async function fetchLiveTopicData(): Promise<TopicData[]> {
  // In a real implementation, this would fetch from your API
  // For now, we'll simulate some random variations
  return demoData.map(topic => ({
    name: topic.name,
    value: Math.max(5, topic.value + Math.floor(Math.random() * 10 - 5))
  }));
}

export default function TopicDistribution({ isLive = false }: { isLive?: boolean }) {
  const [data, setData] = React.useState<TopicData[]>(demoData);

  React.useEffect(() => {
    if (isLive) {
      const loadLiveData = async () => {
        const liveData = await fetchLiveTopicData();
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
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Topic Distribution</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: { name: string; percent: number }) => 
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
} 