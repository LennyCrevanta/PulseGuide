'use client';

import * as React from 'react';
import { Card } from '../ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TimeData {
  hour: string;
  conversations: number;
}

const demoData: TimeData[] = [
  { hour: '00:00', conversations: 12 },
  { hour: '03:00', conversations: 8 },
  { hour: '06:00', conversations: 15 },
  { hour: '09:00', conversations: 45 },
  { hour: '12:00', conversations: 55 },
  { hour: '15:00', conversations: 48 },
  { hour: '18:00', conversations: 35 },
  { hour: '21:00', conversations: 25 },
];

async function fetchLiveTimeData(): Promise<TimeData[]> {
  return demoData.map(timeSlot => ({
    ...timeSlot,
    conversations: Math.max(1, timeSlot.conversations + Math.floor(Math.random() * 10 - 5))
  }));
}

export default function TimeOfDayAnalysis({ isLive = false }: { isLive?: boolean }) {
  const [data, setData] = React.useState<TimeData[]>(demoData);

  React.useEffect(() => {
    if (isLive) {
      const loadLiveData = async () => {
        const liveData = await fetchLiveTimeData();
        setData(liveData);
      };

      loadLiveData();
      const interval = setInterval(loadLiveData, 30000);
      return () => clearInterval(interval);
    } else {
      setData(demoData);
    }
  }, [isLive]);

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Time of Day Distribution</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="conversations"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: '#3B82F6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
} 