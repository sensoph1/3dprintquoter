import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const EventCalendar = ({ events, onDateClick, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showTwoMonths, setShowTwoMonths] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  const getEventsForDate = (year, month, day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const isToday = (year, month, day) => {
    return day === today.getDate() &&
           month === today.getMonth() &&
           year === today.getFullYear();
  };

  const isPast = (year, month, day) => {
    if (!day) return false;
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return date < todayStart;
  };

  const prevMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    setCurrentDate(new Date(year, month - (showTwoMonths ? 2 : 1), 1));
  };

  const nextMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    setCurrentDate(new Date(year, month + (showTwoMonths ? 2 : 1), 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Render a single month grid
  const renderMonth = (year, month) => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDay = firstDayOfMonth.getDay();

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return (
      <div className={showTwoMonths ? 'flex-1' : 'w-full'}>
        {/* Month title for 2-month view */}
        {showTwoMonths && (
          <h4 className="text-lg font-black text-slate-800 text-center mb-3">
            {monthNames[month]} {year}
          </h4>
        )}

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1">
          {dayNames.map(day => (
            <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 py-2">
              {showTwoMonths ? day.charAt(0) : day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(year, month, day);
            const hasEvents = dayEvents.length > 0;
            const past = isPast(year, month, day);
            const isTodayDate = isToday(year, month, day);

            return (
              <div
                key={index}
                onClick={() => day && onDateClick && onDateClick(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`, dayEvents)}
                className={`
                  ${showTwoMonths ? 'min-h-[60px]' : 'min-h-[80px]'} p-2 rounded-xl border transition-all
                  ${!day ? 'bg-transparent border-transparent' : 'border-slate-100 hover:border-blue-200 cursor-pointer'}
                  ${isTodayDate ? 'bg-blue-50 border-blue-200' : ''}
                  ${past && day ? 'opacity-60' : ''}
                `}
              >
                {day && (
                  <>
                    <div className={`text-sm font-bold ${isTodayDate ? 'text-blue-600' : 'text-slate-600'}`}>
                      {day}
                    </div>
                    {hasEvents && (
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, showTwoMonths ? 1 : 2).map(event => (
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
                        {dayEvents.length > (showTwoMonths ? 1 : 2) && (
                          <div className="text-[9px] font-bold text-slate-400">
                            +{dayEvents.length - (showTwoMonths ? 1 : 2)} more
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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const nextMonthDate = new Date(year, month + 1, 1);

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
          {!showTwoMonths && (
            <h3 className="text-xl font-black text-slate-800 ml-2">
              {monthNames[month]} {year}
            </h3>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTwoMonths(!showTwoMonths)}
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
              showTwoMonths ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            2 Month
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar(s) */}
      <div className={showTwoMonths ? 'flex gap-6' : ''}>
        {renderMonth(year, month)}
        {showTwoMonths && renderMonth(nextMonthDate.getFullYear(), nextMonthDate.getMonth())}
      </div>
    </div>
  );
};

export default EventCalendar;
