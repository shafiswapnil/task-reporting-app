import { useState, useEffect } from 'react';
import { TaskSubmissionStatus } from '@/types/task';

interface MissingReportsCalendarProps {
  weekdays: string[];
  onDateSelect: (date: string) => void;
}

const MissingReportsCalendar = ({ weekdays, onDateSelect }: MissingReportsCalendarProps) => {
  const [submissionStatus, setSubmissionStatus] = useState<TaskSubmissionStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissionStatus();
  }, []);

  const fetchSubmissionStatus = async () => {
    try {
      // Get the date range for the last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const response = await fetch(
        `/api/tasks/submission-status?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch submission status');
      }

      const data = await response.json();
      setSubmissionStatus(data);
    } catch (error) {
      console.error('Error fetching submission status:', error);
    } finally {
      setLoading(false);
    }
  };

  const isWorkingDay = (date: Date): boolean => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return weekdays.includes(dayName);
  };

  const getStatusForDate = (date: string): TaskSubmissionStatus | undefined => {
    return submissionStatus.find(status => status.date === date);
  };

  const renderCalendarDays = () => {
    const days = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      if (isWorkingDay(date)) {
        const dateStr = date.toISOString().split('T')[0];
        const status = getStatusForDate(dateStr);
        const isSubmitted = status?.isSubmitted ?? false;

        days.push(
          <div
            key={dateStr}
            className={`p-2 m-1 rounded cursor-pointer ${
              isSubmitted 
                ? 'bg-green-100 dark:bg-green-800' 
                : 'bg-red-100 dark:bg-red-800'
            }`}
            onClick={() => !isSubmitted && onDateSelect(dateStr)}
          >
            <div className="text-sm font-semibold">
              {new Date(dateStr).toLocaleDateString()}
            </div>
            <div className="text-xs">
              {isSubmitted ? 'Submitted' : 'Missing'}
            </div>
          </div>
        );
      }
    }
    return days;
  };

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Report Status (Last 30 Days)</h3>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      </div>
    );
  }

  if (!submissionStatus.length) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Report Status (Last 30 Days)</h3>
        <p className="text-gray-600 dark:text-gray-400">No submission data available</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Report Status (Last 30 Days)</h3>
      <div className="flex flex-wrap gap-2">
        {renderCalendarDays()}
      </div>
    </div>
  );
};

export default MissingReportsCalendar;
