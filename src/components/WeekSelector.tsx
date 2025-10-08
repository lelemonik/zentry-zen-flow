import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface WeekSelectorProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function WeekSelector({ selectedDate, onDateSelect }: WeekSelectorProps) {
  // Get week days starting from Monday
  const getWeekDays = (date: Date) => {
    const days = [];
    const current = new Date(date);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
    
    current.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const weekDays = getWeekDays(selectedDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = (date: Date) => {
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate.getTime() === today.getTime();
  };

  const isSelected = (date: Date) => {
    const compareDate = new Date(date);
    const selected = new Date(selectedDate);
    compareDate.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);
    return compareDate.getTime() === selected.getTime();
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    onDateSelect(newDate);
  };

  const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  return (
    <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 flex-shrink-0"
        onClick={() => navigateWeek('prev')}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex gap-1 sm:gap-2 md:gap-3 flex-1 justify-center overflow-x-auto">
        {weekDays.map((date, index) => {
          const selected = isSelected(date);
          const todayDate = isToday(date);
          
          return (
            <button
              key={index}
              onClick={() => onDateSelect(date)}
              className={`flex flex-col items-center gap-0.5 sm:gap-1 min-w-[36px] sm:min-w-[44px] md:min-w-[52px] py-1.5 sm:py-2 px-1 sm:px-2 rounded-xl sm:rounded-2xl transition-all ${
                selected 
                  ? 'bg-primary text-primary-foreground scale-105' 
                  : todayDate
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted'
              }`}
            >
              <span className="text-[10px] sm:text-xs font-medium opacity-70">{dayNames[index]}</span>
              <span className={`text-base sm:text-lg font-bold ${selected ? '' : 'text-foreground'}`}>
                {date.getDate()}
              </span>
            </button>
          );
        })}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 flex-shrink-0"
        onClick={() => navigateWeek('next')}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
