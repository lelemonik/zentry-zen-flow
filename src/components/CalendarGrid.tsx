import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface CalendarGridProps {
  currentDate: Date;
  selectedDates: Date[];
  onDateSelect: (date: Date) => void;
  onMonthChange: (direction: 'prev' | 'next') => void;
  selectionMode?: 'single' | 'range';
  onRangeComplete?: (startDate: Date, endDate: Date) => void;
}

export function CalendarGrid({ 
  currentDate, 
  selectedDates, 
  onDateSelect,
  onMonthChange,
  selectionMode = 'range',
  onRangeComplete
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
        
        <h3 className="text-base sm:text-lg font-semibold">
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
          <div key={day} className="text-center text-[10px] sm:text-xs font-medium text-muted-foreground py-1 sm:py-2">
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

          return (
            <button
              key={index}
              onClick={() => onDateSelect(day)}
              className={`
                aspect-square rounded-full flex items-center justify-center text-xs sm:text-sm font-medium
                transition-all duration-200
                ${selected 
                  ? 'bg-primary text-primary-foreground scale-105 sm:scale-110 shadow-lg' 
                  : inRange
                  ? 'bg-primary/20 text-primary'
                  : today
                  ? 'bg-primary/10 text-primary font-bold ring-2 ring-primary/30'
                  : 'hover:bg-muted text-foreground'
                }
              `}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
