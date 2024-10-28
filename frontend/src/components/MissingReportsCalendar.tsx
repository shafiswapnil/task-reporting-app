"use client";

import { useState, useEffect } from 'react';
import { TaskSubmissionStatus } from '@/types/task';
import { useSession } from 'next-auth/react';

export default function MissingReportsCalendar() {
  const [loading, setLoading] = useState(true);
  const [submissionStatus, setSubmissionStatus] = useState<TaskSubmissionStatus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchSubmissionStatus = async () => {
      if (!session?.user?.email) return;
      
      try {
        setLoading(true);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const response = await fetch(
          `/api/tasks/submission-status?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&email=${encodeURIComponent(session.user.email)}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch submission status');
        }

        const data = await response.json();
        setSubmissionStatus(data);
      } catch (error) {
        console.error('Error fetching submission status:', error);
        setError('Failed to load submission status');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionStatus();
  }, [session]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4">
        <h3 className="text-xl font-semibold mb-4">Report Status (Last 30 Days)</h3>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-4">
        <h3 className="text-xl font-semibold mb-4">Report Status (Last 30 Days)</h3>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // If no data is available yet, show placeholder grid
  if (!submissionStatus || submissionStatus.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4">
        <h3 className="text-xl font-semibold mb-4">Report Status (Last 30 Days)</h3>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              className="p-2 rounded-md text-center bg-gray-100 text-gray-600"
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show actual submission status data
  return (
    <div className="bg-white rounded-lg p-4">
      <h3 className="text-xl font-semibold mb-4">Report Status (Last 30 Days)</h3>
      <div className="grid grid-cols-7 gap-2">
        {submissionStatus.map((status, index) => (
          <div
            key={index}
            className={`p-2 rounded-md text-center cursor-pointer
              ${status.submitted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            onClick={() => {
              // Handle date selection if needed
              const date = new Date(status.date).toISOString().split('T')[0];
              console.log('Selected date:', date);
            }}
          >
            {new Date(status.date).getDate()}
          </div>
        ))}
      </div>
    </div>
  );
}