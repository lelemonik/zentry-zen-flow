# Task Manager & Schedule Redesign

## Design Analysis from Reference Image

### **Tasks Page (Left Screen)**

#### Visual Components:
1. **Header**: "Your task tracking" with search icon (left) and notification bell (right)
2. **Week View Selector**: Horizontal scrollable week days (Mo-Su) with current date highlighted
3. **Statistics Cards**: 3 cards showing:
   - All tasks: 12 (100%)
   - Done: 5 (41%)
   - In process: 7 (59%)
4. **Task List**:
   - Vertical colored border on left (red = high priority, blue = medium/low)
   - Task title (e.g., "Business meeting")
   - Task description/details
   - Bottom info row: Time icon + time, Calendar icon + date, Tag icon + category
   - Checkmark button on right (for completion)

#### Key Features:
- Minimalist, clean design
- Clear visual hierarchy
- Priority indicated by border color
- Compact information display
- Easy task completion toggle

### **Schedule/Calendar Page (Right Screen)**

#### Visual Components:
1. **Month Calendar**:
   - Full month grid view
   - Selected date range highlighted (darker circles)
   - Current navigation with arrows and month name
2. **Statistics Section**: "Result for these days"
   - All tasks, Done, In process with counts and percentages
3. **Tasks List**: "Tasks for these days"
   - Filtered tasks for selected date range
   - Same card design as Tasks page

#### Key Features:
- Date range selection on calendar
- Dynamic task filtering by date
- Statistics update based on selection
- Visual feedback for selected dates

### **Bottom Navigation**:
- Task icon
- Calendar icon  
- Center "+" button (elevated/prominent)
- Goal icon
- Profile icon

---

## Backend Requirements

### **Existing (Already Implemented)**:
✅ Task CRUD operations (Supabase + localStorage)
✅ Schedule events with dates
✅ Task completion status
✅ Priority levels (low, medium, high)
✅ Categories
✅ Due dates

### **Need to Add**:

#### 1. **Date-based Task Filtering**
```typescript
// Filter tasks by date or date range
interface DateFilter {
  startDate: string;
  endDate?: string; // Optional for range selection
}

function filterTasksByDate(tasks: Task[], filter: DateFilter): Task[] {
  // Filter tasks where dueDate falls within the range
}
```

#### 2. **Task Statistics Calculation**
```typescript
interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  completionPercentage: number;
}

function calculateTaskStats(tasks: Task[]): TaskStats {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const inProgress = total - completed;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { total, completed, inProgress, completionPercentage };
}
```

#### 3. **Week View Navigation**
```typescript
function getWeekDays(currentDate: Date): Date[] {
  // Return array of 7 dates for current week
  // Start from Monday or Sunday based on locale
}

function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}
```

#### 4. **Calendar Date Range Selection**
```typescript
interface DateSelection {
  startDate: Date | null;
  endDate: Date | null;
  selectionMode: 'single' | 'range';
}

// Handle calendar date selection
// Support both single date and range selection
```

#### 5. **Enhanced Task Model** (Optional improvements)
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate: string; // ISO date string
  dueTime?: string; // HH:MM format (optional)
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  // New optional fields:
  startDate?: string; // For multi-day tasks
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  tags?: string[];
}
```

---

## UI Implementation Plan

### **Phase 1: Tasks Page Enhancement**
1. Add week view selector component
2. Add statistics cards (All, Done, In Progress)
3. Redesign task cards with:
   - Colored left border based on priority
   - Compact info display (time, date, category icons)
   - Checkmark button for completion
4. Add search functionality in header
5. Keep existing color scheme

### **Phase 2: Schedule Page Enhancement**
1. Implement full month calendar grid
2. Add date range selection logic
3. Show statistics for selected date range
4. Filter and display tasks for selected dates
5. Keep existing color scheme

### **Phase 3: Navigation Enhancement**
1. Add prominent center "+" button
2. Style bottom navigation to match design
3. Ensure responsive behavior

---

## Color Mapping (Keep Existing Scheme)

From your neumorphism theme:
- **Background**: `hsl(0 0% 90%)` - Light gray
- **Card**: Same as background with neumorphic shadows
- **Primary**: `hsl(210 14% 31%)` - Dark blue-gray
- **Border/Priority Colors**:
  - High: Use `hsl(0 84% 60%)` (destructive red)
  - Medium: Use `hsl(43 96% 56%)` (amber/yellow)
  - Low: Use `hsl(142 71% 45%)` (green)

---

## Next Steps

1. Create reusable components:
   - WeekSelector
   - StatisticsCard
   - TaskCard (redesigned)
   - CalendarGrid
   - DateRangeSelector

2. Update Tasks.tsx with new layout
3. Update Schedule.tsx with calendar view
4. Add utility functions for date handling
5. Test responsiveness on mobile

