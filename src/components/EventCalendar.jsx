import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const EventCalendar = ({ events, onDateClick, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and total days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDay = firstDayOfMonth.getDay(); // 0 = Sunday

  // Build calendar grid
  const days = [];

  // Empty cells before first day
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  // Get events for a specific date
  const getEventsForDate = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const today = new Date();
  const isToday = (day) => {
    return day === today.getDate() &&
           month === today.getMonth() &&
           year === today.getFullYear();
  };

  const isPast = (day) => {
    if (!day) return false;
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return date < todayStart;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
          <h3 className="text-xl font-black text-slate-800 ml-2">
            {monthNames[month]} {year}
          </h3>
        </div>
        <button
          onClick={goToToday}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
        >
          Today
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map(day => (
          <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          const hasEvents = dayEvents.length > 0;
          const past = isPast(day);

          return (
            <div
              key={index}
              onClick={() => day && onDateClick && onDateClick(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`, dayEvents)}
              className={`
                min-h-[80px] p-2 rounded-xl border transition-all
                ${!day ? 'bg-transparent border-transparent' : 'border-slate-100 hover:border-blue-200 cursor-pointer'}
                ${isToday(day) ? 'bg-blue-50 border-blue-200' : ''}
                ${past && day ? 'opacity-60' : ''}
              `}
            >
              {day && (
                <>
                  <div className={`text-sm font-bold ${isToday(day) ? 'text-blue-600' : 'text-slate-600'}`}>
                    {day}
                  </div>
                  {hasEvents && (
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick && onEventClick(event);
                          }}
                          className={`
                            text-[9px] font-bold px-1.5 py-0.5 rounded truncate
                            ${past ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-700'}
                          `}
                          title={event.name}
                        >
                          {event.name}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[9px] font-bold text-slate-400">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventCalendar;
