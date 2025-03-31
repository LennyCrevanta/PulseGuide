'use client';

import { useEffect, useState, Suspense } from 'react';
import AnalyticsSummary from '@/components/analytics/AnalyticsSummary';
import TopicDistribution from '@/components/analytics/TopicDistribution';
import SentimentAnalysis from '@/components/analytics/SentimentAnalysis';
import TimeOfDayAnalysis from '@/components/analytics/TimeOfDayAnalysis';
import ResponseMetrics from '@/components/analytics/ResponseMetrics';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function AnalyticsDashboardContent() {
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const isLive = searchParams?.get('mode') === 'live';

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Employee Selector
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Benefits Chat Analytics Dashboard</h1>
          </div>
          <div className="flex gap-4">
            <Link
              href="/admin/analytics?mode=demo"
              className={`px-4 py-2 rounded-md ${
                !isLive
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Demo Data
            </Link>
            <Link
              href="/admin/analytics?mode=live"
              className={`px-4 py-2 rounded-md ${
                isLive
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Live Data
            </Link>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <AnalyticsSummary isLive={isLive} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TopicDistribution isLive={isLive} />
              <SentimentAnalysis isLive={isLive} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TimeOfDayAnalysis isLive={isLive} />
              <ResponseMetrics isLive={isLive} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }>
      <AnalyticsDashboardContent />
    </Suspense>
  );
} 