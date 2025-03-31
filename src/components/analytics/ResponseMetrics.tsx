'use client';

import * as React from 'react';
import { Card } from '../ui/Card';

interface MetricData {
  avgResponseTime: number;
  totalConversations: number;
  resolutionRate: number;
}

const demoData: MetricData = {
  avgResponseTime: 2.5,
  totalConversations: 1250,
  resolutionRate: 92,
};

async function fetchLiveMetricData(): Promise<MetricData> {
  return {
    avgResponseTime: Math.max(1, demoData.avgResponseTime + (Math.random() * 0.4 - 0.2)),
    totalConversations: demoData.totalConversations + Math.floor(Math.random() * 10),
    resolutionRate: Math.min(100, Math.max(80, demoData.resolutionRate + (Math.random() * 2 - 1))),
  };
}

export default function ResponseMetrics({ isLive = false }: { isLive?: boolean }) {
  const [data, setData] = React.useState<MetricData>(demoData);

  React.useEffect(() => {
    if (isLive) {
      const loadLiveData = async () => {
        const liveData = await fetchLiveMetricData();
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
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Response Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Average Response Time</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{data.avgResponseTime.toFixed(1)}m</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Conversations</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{data.totalConversations.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Resolution Rate</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{data.resolutionRate.toFixed(1)}%</p>
        </div>
      </div>
    </Card>
  );
} 