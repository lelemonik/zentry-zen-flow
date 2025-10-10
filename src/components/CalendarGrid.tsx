import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface CalendarGridProps {
  currentDate: Date;
  selectedDates: Date[];
  onDateSelect: (date: Date) => void;
  onMonthChange: (direction: 'prev' | 'next') => void;
  selectionMode?: 'single' | 'range';
  onRangeComplete?: (startDate: Date, endDate: Date) => void;
  eventsData?: Array<{ date: string; color?: string }>;
}

export function CalendarGrid({ 
  currentDate, 
  selectedDates, 
  onDateSelect,
  onMonthChange,
  selectionMode = 'range',
  onRangeComplete,
  eventsData = []
}: CalendarGridProps) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  // Get all days for the current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    let startDay = firstDay.getDay();
    // Convert to Monday = 0
    startDay = startDay === 0 ? 6 : startDay - 1;
    
    const days: (Date | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isSelected = (date: Date) => {
    return selectedDates.some(selected => {
      const selectedTime = new Date(selected).setHours(0, 0, 0, 0);
      const dateTime = new Date(date).setHours(0, 0, 0, 0);
      return selectedTime === dateTime;
    });
  };

  const isInRange = (date: Date) => {
    if (selectedDates.length !== 2) return false;
    
    const dateTime = new Date(date).setHours(0, 0, 0, 0);
    const start = Math.min(
      new Date(selectedDates[0]).setHours(0, 0, 0, 0),
      new Date(selectedDates[1]).setHours(0, 0, 0, 0)
    );
    const end = Math.max(
      new Date(selectedDates[0]).setHours(0, 0, 0, 0),
      new Date(selectedDates[1]).setHours(0, 0, 0, 0)
    );
    
    return dateTime >= start && dateTime <= end;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const hasEvents = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    return eventsData.some(event => event.date === dateStr);
  };

  const getEventColor = (date: Date): string => {
    const dateStr = date.toISOString().split('T')[0];
    const event = eventsData.find(e => e.date === dateStr);
    return event?.color || '#b9908d';
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMonthChange('prev')}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h3 className="text-base sm:text-lg font-bold text-dried-rose">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMonthChange('next')}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-[10px] sm:text-xs font-semibold text-dried-rose py-1 sm:py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const selected = isSelected(day);
          const inRange = isInRange(day);
          const today = isToday(day);
          const dayHasEvents = hasEvents(day);

          return (
            <button
              key={index}
              onClick={() => onDateSelect(day)}
              className={`
                aspect-square rounded-full flex flex-col items-center justify-center text-xs sm:text-sm font-semibold
                transition-all duration-300 relative overflow-visible
                ${selected 
                  ? 'bg-gradient-to-br from-faded-mauve to-muted-rosewood text-white scale-110 sm:scale-125 shadow-neumorphism z-10' 
                  : inRange
                  ? 'bg-petal-dust/40 text-dried-rose'
                  : today
                  ? 'bg-blush-cloud/40 text-dried-rose font-bold ring-2 ring-faded-mauve/50'
                  : dayHasEvents
                  ? 'hover:bg-petal-dust/30 text-dried-rose font-bold hover:scale-105'
                  : 'hover:bg-petal-dust/20 text-dried-rose hover:scale-105'
                }
              `}
            >
              {/* Animated circles for selected date */}
              {selected && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-faded-mauve/30 animate-ping" />
                  <div className="absolute inset-0 rounded-full border-2 border-dried-rose/20 animate-pulse" 
                       style={{ animationDelay: '150ms' }} />
                </>
              )}
              
              {day.getDate()}
              
              {dayHasEvents && !selected && (
                <div 
                  className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full absolute bottom-1 sm:bottom-1.5 transition-all duration-300"
                  style={{ backgroundColor: getEventColor(day) }}
                />
              )}
              
              {/* Event indicator moves to a ring around selected date */}
              {dayHasEvents && selected && (
                <div 
                  className="absolute -bottom-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full animate-bounce"
                  style={{ backgroundColor: getEventColor(day) }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
