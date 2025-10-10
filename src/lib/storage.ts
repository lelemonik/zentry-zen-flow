// Local storage utilities with auto-save and backup

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  date: string;
  color: string;
  category: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
}

export interface AppSettings {
  colorScheme: 'purple' | 'blue' | 'green' | 'pink';
  theme: 'strawberry-kiss' | 'deep-matcha' | 'pink-latte' | 'midnight-sky';
  notifications: boolean;
  autoSave: boolean;
}

export interface MoodEntry {
  mood: string;
  date: string;
  timestamp: string;
}

const STORAGE_KEYS = {
  TASKS: 'zentry_tasks',
  NOTES: 'zentry_notes',
  SCHEDULE: 'zentry_schedule',
  PROFILE: 'zentry_profile',
  SETTINGS: 'zentry_settings',
  SUPABASE_USER_ID: 'zentry_supabase_user_id',
  MOOD_HISTORY: 'zentry_mood_history',
  TODAY_MOOD: 'zentry_today_mood',
};

// Generic storage functions
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage error:', error);
    }
  },

  remove: (key: string): void => {
    localStorage.removeItem(key);
  },

  clear: (): void => {
    localStorage.clear();
  },
};

// Specific data accessors
export const taskStorage = {
  getAll: (): Task[] => storage.get(STORAGE_KEYS.TASKS, []),
  set: (tasks: Task[]) => storage.set(STORAGE_KEYS.TASKS, tasks),
  add: (task: Task) => {
    const tasks = taskStorage.getAll();
    taskStorage.set([...tasks, task]);
  },
  update: (id: string, updates: Partial<Task>) => {
    const tasks = taskStorage.getAll();
    const updated = tasks.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
    taskStorage.set(updated);
  },
  delete: (id: string) => {
    const tasks = taskStorage.getAll();
    taskStorage.set(tasks.filter((t) => t.id !== id));
  },
};

export const noteStorage = {
  getAll: (): Note[] => storage.get(STORAGE_KEYS.NOTES, []),
  set: (notes: Note[]) => storage.set(STORAGE_KEYS.NOTES, notes),
  add: (note: Note) => {
    const notes = noteStorage.getAll();
    noteStorage.set([...notes, note]);
  },
  update: (id: string, updates: Partial<Note>) => {
    const notes = noteStorage.getAll();
    const updated = notes.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n));
    noteStorage.set(updated);
  },
  delete: (id: string) => {
    const notes = noteStorage.getAll();
    noteStorage.set(notes.filter((n) => n.id !== id));
  },
};

export const scheduleStorage = {
  getAll: (): ScheduleEvent[] => storage.get(STORAGE_KEYS.SCHEDULE, []),
  set: (events: ScheduleEvent[]) => storage.set(STORAGE_KEYS.SCHEDULE, events),
  add: (event: ScheduleEvent) => {
    const events = scheduleStorage.getAll();
    scheduleStorage.set([...events, event]);
  },
  update: (id: string, updates: Partial<ScheduleEvent>) => {
    const events = scheduleStorage.getAll();
    const updated = events.map((e) => (e.id === id ? { ...e, ...updates } : e));
    scheduleStorage.set(updated);
  },
  delete: (id: string) => {
    const events = scheduleStorage.getAll();
    scheduleStorage.set(events.filter((e) => e.id !== id));
  },
};

export const profileStorage = {
  get: (): UserProfile | null => storage.get(STORAGE_KEYS.PROFILE, null),
  set: (profile: UserProfile) => storage.set(STORAGE_KEYS.PROFILE, profile),
};

export const settingsStorage = {
  get: (): AppSettings => storage.get(STORAGE_KEYS.SETTINGS, {
    colorScheme: 'purple',
    theme: 'strawberry-kiss',
    notifications: true,
    autoSave: true,
  }),
  set: (settings: AppSettings) => storage.set(STORAGE_KEYS.SETTINGS, settings),
  update: (updates: Partial<AppSettings>) => {
    const current = settingsStorage.get();
    settingsStorage.set({ ...current, ...updates });
  },
};

export const authStorage = {
  getSupabaseUserId: (): string | null => storage.get(STORAGE_KEYS.SUPABASE_USER_ID, null),
  setSupabaseUserId: (userId: string) => storage.set(STORAGE_KEYS.SUPABASE_USER_ID, userId),
  clearAuth: () => {
    storage.remove(STORAGE_KEYS.SUPABASE_USER_ID);
  },
};

// Clear user data on logout
export const clearUserDataOnLogout = () => {
  storage.remove(STORAGE_KEYS.TASKS);
  storage.remove(STORAGE_KEYS.NOTES);
  storage.remove(STORAGE_KEYS.SCHEDULE);
  storage.remove(STORAGE_KEYS.PROFILE);
  storage.remove(STORAGE_KEYS.MOOD_HISTORY);
  storage.remove(STORAGE_KEYS.TODAY_MOOD);
  // Keep settings as they're user preferences, not user data
  authStorage.clearAuth();
  // Also clear session ID to force new session generation
  storage.remove('zentry_session_id');
};

// Clear ALL data (called on account deletion)
export const clearAllUserData = () => {
  storage.remove(STORAGE_KEYS.TASKS);
  storage.remove(STORAGE_KEYS.NOTES);
  storage.remove(STORAGE_KEYS.SCHEDULE);
  storage.remove(STORAGE_KEYS.PROFILE);
  storage.remove(STORAGE_KEYS.MOOD_HISTORY);
  storage.remove(STORAGE_KEYS.TODAY_MOOD);
  authStorage.clearAuth();
  storage.remove('zentry_session_id');
};

// Auto-backup functionality
export const createBackup = () => {
  const backup = {
    tasks: taskStorage.getAll(),
    notes: noteStorage.getAll(),
    schedule: scheduleStorage.getAll(),
    profile: profileStorage.get(),
    settings: settingsStorage.get(),
    timestamp: new Date().toISOString(),
  };
  
  const dataStr = JSON.stringify(backup, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `zentry-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const restoreBackup = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string);
        taskStorage.set(backup.tasks || []);
        noteStorage.set(backup.notes || []);
        scheduleStorage.set(backup.schedule || []);
        if (backup.profile) profileStorage.set(backup.profile);
        if (backup.settings) settingsStorage.set(backup.settings);
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsText(file);
  });
};

// Mood tracking storage
export const moodStorage = {
  // Get today's mood
  getTodayMood: (): string | null => {
    const today = new Date().toISOString().split('T')[0];
    const savedMood = storage.get<{ mood: string; date: string } | null>(STORAGE_KEYS.TODAY_MOOD, null);
    
    // Check if the saved mood is from today
    if (savedMood && savedMood.date === today) {
      return savedMood.mood;
    }
    return null;
  },

  // Save today's mood
  setTodayMood: (mood: string) => {
    const today = new Date().toISOString().split('T')[0];
    const moodData = {
      mood,
      date: today,
    };
    storage.set(STORAGE_KEYS.TODAY_MOOD, moodData);

    // Also add to mood history
    const history = moodStorage.getHistory();
    const entry: MoodEntry = {
      mood,
      date: today,
      timestamp: new Date().toISOString(),
    };
    
    // Check if there's already an entry for today and update it, otherwise add new
    const existingIndex = history.findIndex(e => e.date === today);
    if (existingIndex >= 0) {
      history[existingIndex] = entry;
    } else {
      history.push(entry);
    }
    
    storage.set(STORAGE_KEYS.MOOD_HISTORY, history);
  },

  // Get mood history
  getHistory: (): MoodEntry[] => {
    return storage.get<MoodEntry[]>(STORAGE_KEYS.MOOD_HISTORY, []);
  },

  // Add mood for a specific date
  addMoodForDate: (mood: string, date: string) => {
    const history = moodStorage.getHistory();
    const entry: MoodEntry = {
      mood,
      date,
      timestamp: new Date().toISOString(),
    };
    
    // Check if there's already an entry for this date
    const existingIndex = history.findIndex(e => e.date === date);
    if (existingIndex >= 0) {
      // Update existing entry
      history[existingIndex] = entry;
    } else {
      // Add new entry
      history.push(entry);
    }
    
    // Sort by date (newest first)
    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    storage.set(STORAGE_KEYS.MOOD_HISTORY, history);
    
    // Update today's mood if the date is today
    const today = new Date().toISOString().split('T')[0];
    if (date === today) {
      storage.set(STORAGE_KEYS.TODAY_MOOD, { mood, date });
    }
  },

  // Delete mood entry by date
  deleteMoodByDate: (date: string) => {
    const history = moodStorage.getHistory();
    const filtered = history.filter(e => e.date !== date);
    storage.set(STORAGE_KEYS.MOOD_HISTORY, filtered);
    
    // If deleting today's mood, also clear TODAY_MOOD
    const today = new Date().toISOString().split('T')[0];
    if (date === today) {
      storage.remove(STORAGE_KEYS.TODAY_MOOD);
    }
  },

  // Update mood for a specific date
  updateMoodForDate: (date: string, newMood: string) => {
    moodStorage.addMoodForDate(newMood, date);
  },

  // Clear mood data
  clear: () => {
    storage.remove(STORAGE_KEYS.TODAY_MOOD);
    storage.remove(STORAGE_KEYS.MOOD_HISTORY);
  },
};
