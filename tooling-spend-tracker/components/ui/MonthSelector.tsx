'use client';

import React from 'react';
import { format, subMonths } from 'date-fns';
import { Calendar } from 'lucide-react';

interface MonthSelectorProps {
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
  showYTD?: boolean;
  onYTDToggle?: (enabled: boolean) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonth,
  onMonthChange,
  showYTD = false,
  onYTDToggle,
}) => {
  // Generate last 12 months
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy'),
      date,
    };
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    const month = months.find(m => m.value === selectedValue);
    if (month) {
      onMonthChange(month.date);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <select
          value={format(selectedMonth, 'yyyy-MM')}
          onChange={handleChange}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white text-gray-900 font-medium min-w-[200px]"
        >
          {months.map(month => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </div>

      {onYTDToggle && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showYTD}
            onChange={(e) => onYTDToggle(e.target.checked)}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-700">Show YTD</span>
        </label>
      )}
    </div>
  );
};

export default MonthSelector;
