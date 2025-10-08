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
      return 'border-l-4 border-l-red-500';
    case 'medium':
      return 'border-l-4 border-l-yellow-500';
    case 'low':
      return 'border-l-4 border-l-green-500';
    default:
      return 'border-l-4 border-l-gray-400';
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

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const month = date.toLocaleDateString('en-US', { month: '2-digit' });
  const day = date.toLocaleDateString('en-US', { day: '2-digit' });
  const year = date.toLocaleDateString('en-US', { year: '2-digit' });
  
  return `${month}.${day}.${year}`;
}
