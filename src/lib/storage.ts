// Local storage utilities with auto-save and backup

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  progress: number;
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
  theme: 'light' | 'dark';
  colorScheme: 'purple' | 'blue' | 'green' | 'pink';
  notifications: boolean;
  autoSave: boolean;
}

const STORAGE_KEYS = {
  TASKS: 'zentry_tasks',
  NOTES: 'zentry_notes',
  SCHEDULE: 'zentry_schedule',
  PROFILE: 'zentry_profile',
  SETTINGS: 'zentry_settings',
  PIN: 'zentry_pin',
  AUTHENTICATED: 'zentry_authenticated',
  SUPABASE_USER_ID: 'zentry_supabase_user_id',
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
    theme: 'light',
    colorScheme: 'purple',
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
  getPin: (): string | null => storage.get(STORAGE_KEYS.PIN, null),
  setPin: (pin: string, supabaseUserId?: string) => {
    storage.set(STORAGE_KEYS.PIN, pin);
    if (supabaseUserId) {
      storage.set(STORAGE_KEYS.SUPABASE_USER_ID, supabaseUserId);
    }
  },
  getSupabaseUserId: (): string | null => storage.get(STORAGE_KEYS.SUPABASE_USER_ID, null),
  isAuthenticated: (): boolean => storage.get(STORAGE_KEYS.AUTHENTICATED, false),
  setAuthenticated: (value: boolean) => storage.set(STORAGE_KEYS.AUTHENTICATED, value),
  clearAuth: () => {
    storage.remove(STORAGE_KEYS.AUTHENTICATED);
    storage.remove(STORAGE_KEYS.PIN);
    storage.remove(STORAGE_KEYS.SUPABASE_USER_ID);
  },
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
