"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getMissingReports } from '@/services/api';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface MissingDay {
  date: string;
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
  const [currentDate, setCurrentDate] = useState(() => {
    // Initialize with Bangladesh time
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
  });

  // Helper function to get date in Bangladesh timezone
  const getBangladeshDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split('/').reverse().join('-'); // Convert to YYYY-MM-DD format
  };

  useEffect(() => {
    const fetchMissingReports = async () => {
      if (!session?.user?.email) return;
      
      try {
        setIsLoading(true);
        console.log('Fetching missing reports for:', session.user.email);
        const response = await getMissingReports(session.user.email);
        console.log('Missing reports response:', response);
        setMissingDays(response.missingDates || []);
        // const response = await getMissingReports(session.user.email);
        // setMissingDays(response.missingDates || []);
      } catch (err) {
        console.error('Error fetching missing reports:', err);
        setError('Failed to load missing reports');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMissingReports();
  }, [session, currentDate]);

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const days = [];
    const startingDayOfWeek = firstDayOfMonth.getDay();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ isEmpty: true });
    }

    // Get today's date in Bangladesh timezone
    const todayBD = getBangladeshDate(new Date());

    // Add the days of the month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      
      // Check if this date is in missingDays array
      const isMissing = date < new Date(todayBD) && missingDays.some(md => md.date === dateStr);
      const isToday = dateStr === todayBD;
      
      console.log(`Checking date ${dateStr}: isMissing=${isMissing}`);
      
      days.push({
        date: day,
        isMissing,
        isToday,
        fullDate: dateStr
      });
    }

    return days;
  };

  // Add this useEffect to log missingDays whenever they change
  useEffect(() => {
    console.log('Current missing days:', missingDays);
  }, [missingDays]);

  // Add debug logging to verify dates
  useEffect(() => {
    console.log('Bangladesh Time:', new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
    console.log('UTC Time:', new Date().toISOString());
  }, []);

  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const prevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
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

  const calendarDays = generateCalendarDays();

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Report Status</h2>
        <div className="flex items-center space-x-4">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded">
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <span className="font-medium">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded">
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-600 p-2">
            {day}
          </div>
        ))}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`
              text-center p-2 rounded-md text-sm
              ${day.isEmpty ? 'invisible' : ''}
              ${day.isMissing ? 'bg-red-100 text-red-800' : 'bg-gray-50'}
              ${day.isToday ? 'ring-2 ring-blue-500' : ''}
              hover:bg-gray-100 cursor-pointer transition-colors
            `}
            onClick={() => day.fullDate && onDateSelect && onDateSelect(new Date(day.fullDate))}
          >
            {!day.isEmpty && day.date}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-100 rounded mr-2"></div>
          <span>Missing Report</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 ring-2 ring-blue-500 rounded mr-2"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default MissingReportsCalendar;