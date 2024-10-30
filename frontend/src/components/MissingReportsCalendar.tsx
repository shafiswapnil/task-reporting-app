"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getMissingReports } from '@/services/api';

interface MissingDay {
  date: Date;
  reason: string;
}

interface MissingReportsCalendarProps {
  weekdays?: string[];
  onDateSelect?: (date: Date) => void;
}

const MissingReportsCalendar = ({ weekdays = [], onDateSelect }: MissingReportsCalendarProps) => {
  const { data: session } = useSession();
  const [missingDays, setMissingDays] = useState<MissingDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMissingReports = async () => {
      if (!session?.user?.email) return;
      
      try {
        const data = await getMissingReports(session.user.email);
        setMissingDays(data.map((d: any) => ({
          date: new Date(d.date),
          reason: d.reason
        })));
      } catch (err) {
        console.error('Error fetching missing reports:', err);
        setError('Failed to load missing reports');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMissingReports();
  }, [session]);

  const handleDateClick = (date: Date) => {
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="text-red-500 p-4 border border-red-300 rounded">
      {error}
    </div>
  );

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <Calendar
        className="w-full"
        onClickDay={handleDateClick}
        tileClassName={({ date }) => {
          const isMissing = missingDays.some(
            d => d.date.toDateString() === date.toDateString()
          );
          return isMissing ? 'bg-red-100' : '';
        }}
        tileContent={({ date }) => {
          const missing = missingDays.find(
            d => d.date.toDateString() === date.toDateString()
          );
          return missing ? (
            <div className="text-xs text-red-500">Missing</div>
          ) : null;
        }}
      />
    </div>
  );
};

export default MissingReportsCalendar;