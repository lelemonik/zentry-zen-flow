import { Task } from './storage';

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  completionPercentage: number;
  inProgressPercentage: number;
}

export function calculateTaskStats(tasks: Task[]): TaskStats {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const inProgress = total - completed;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const inProgressPercentage = total > 0 ? Math.round((inProgress / total) * 100) : 0;
  
  return { 
    total, 
    completed, 
    inProgress, 
    completionPercentage,
    inProgressPercentage
  };
}

export function filterTasksByDate(tasks: Task[], date: Date): Task[] {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  return tasks.filter(task => {
    if (!task.dueDate) return false;
    
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    
    return taskDate.getTime() === targetDate.getTime();
  });
}

export function filterTasksByDateRange(tasks: Task[], startDate: Date, endDate: Date): Task[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  
  return tasks.filter(task => {
    if (!task.dueDate) return false;
    
    const taskDate = new Date(task.dueDate);
    
    return taskDate.getTime() >= start.getTime() && taskDate.getTime() <= end.getTime();
  });
}

export function getPriorityColor(priority: 'low' | 'medium' | 'high'): string {
  switch (priority) {
    case 'high':
      return 'border-l-4 border-l-dried-rose bg-gradient-to-r from-dried-rose/20 to-faded-mauve/10 text-dried-rose';
    case 'medium':
      return 'border-l-4 border-l-faded-mauve bg-gradient-to-r from-faded-mauve/20 to-muted-rosewood/10 text-dried-rose';
    case 'low':
      return 'border-l-4 border-l-muted-rosewood bg-gradient-to-r from-muted-rosewood/20 to-petal-dust/10 text-dried-rose';
    default:
      return 'border-l-4 border-l-petal-dust bg-gradient-to-r from-petal-dust/20 to-blush-cloud/10 text-dried-rose';
  }
}

export function getPriorityTextColor(priority: 'low' | 'medium' | 'high'): string {
  switch (priority) {
    case 'high':
      return 'text-dried-rose';
    case 'medium':
      return 'text-faded-mauve';
    case 'low':
      return 'text-muted-rosewood';
    default:
      return 'text-muted-foreground';
  }
}

export function formatTime(time: string): string {
  if (!time) return '';
  
  // Assuming time is in HH:MM format
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  
  return `${displayHour}:${minutes} ${ampm}`;
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const month = date.toLocaleDateString('en-US', { month: '2-digit' });
  const day = date.toLocaleDateString('en-US', { day: '2-digit' });
  const year = date.toLocaleDateString('en-US', { year: '2-digit' });
  
  return `${month}.${day}.${year}`;
}
