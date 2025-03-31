'use client';

import * as React from 'react';
import { Card } from '../ui/Card';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface Metrics {
  totalConversations: { value: string; change: string; trend: 'up' | 'down' | 'neutral' };
  avgResponseTime: { value: string; change: string; trend: 'up' | 'down' | 'neutral' };
  resolutionRate: { value: string; change: string; trend: 'up' | 'down' | 'neutral' };
  activeUsers: { value: string; change: string; trend: 'up' | 'down' | 'neutral' };
}

export function MetricCard({ title, value, change, trend }: MetricCardProps) {
  return (
    <Card className="p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {change && (
          <p className={`ml-2 text-sm ${
            trend === 'up' ? 'text-green-600' :
            trend === 'down' ? 'text-red-600' :
            'text-gray-500'
          }`}>
            {change}
          </p>
        )}
      </div>
    </Card>
  );
}

const demoMetrics: Metrics = {
  totalConversations: { value: '2,847', change: '+12.5%', trend: 'up' },
  avgResponseTime: { value: '45s', change: '-15%', trend: 'up' },
  resolutionRate: { value: '94%', change: '+2.3%', trend: 'up' },
  activeUsers: { value: '487', change: '+5.2%', trend: 'up' }
};

async function fetchLiveMetrics(): Promise<Metrics> {
  // In a real implementation, this would fetch from your API
  // For now, we'll simulate some random variations
  const randomVariation = () => (Math.random() * 20 - 10).toFixed(1);
  
  return {
    totalConversations: {
      value: (2847 + Math.floor(Math.random() * 200 - 100)).toLocaleString(),
      change: `${randomVariation()}%`,
      trend: Math.random() > 0.5 ? 'up' : 'down'
    },
    avgResponseTime: {
      value: `${40 + Math.floor(Math.random() * 10)}s`,
      change: `${randomVariation()}%`,
      trend: Math.random() > 0.5 ? 'up' : 'down'
    },
    resolutionRate: {
      value: `${90 + Math.floor(Math.random() * 8)}%`,
      change: `${randomVariation()}%`,
      trend: Math.random() > 0.5 ? 'up' : 'down'
    },
    activeUsers: {
      value: (487 + Math.floor(Math.random() * 50 - 25)).toString(),
      change: `${randomVariation()}%`,
      trend: Math.random() > 0.5 ? 'up' : 'down'
    }
  };
}

export default function AnalyticsSummary({ isLive = false }: { isLive?: boolean }) {
  const [metrics, setMetrics] = React.useState<Metrics>(demoMetrics);

  React.useEffect(() => {
    if (isLive) {
      const loadLiveMetrics = async () => {
        const liveMetrics = await fetchLiveMetrics();
        setMetrics(liveMetrics);
      };

      loadLiveMetrics();
      // Refresh every 30 seconds
      const interval = setInterval(loadLiveMetrics, 30000);
      return () => clearInterval(interval);
    } else {
      setMetrics(demoMetrics);
    }
  }, [isLive]);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Conversations"
        value={metrics.totalConversations.value}
        change={metrics.totalConversations.change}
        trend={metrics.totalConversations.trend}
      />
      <MetricCard
        title="Avg. Response Time"
        value={metrics.avgResponseTime.value}
        change={metrics.avgResponseTime.change}
        trend={metrics.avgResponseTime.trend}
      />
      <MetricCard
        title="Resolution Rate"
        value={metrics.resolutionRate.value}
        change={metrics.resolutionRate.change}
        trend={metrics.resolutionRate.trend}
      />
      <MetricCard
        title="Active Users"
        value={metrics.activeUsers.value}
        change={metrics.activeUsers.change}
        trend={metrics.activeUsers.trend}
      />
    </div>
  );
} 