import { supabase } from './supabase';
import { supabaseAuth } from './supabaseAuth';
import { Task, Note, ScheduleEvent, UserProfile } from './storage';

// Get user ID - prioritizes Supabase Auth, falls back to PIN
const getUserId = async (): Promise<string> => {
  // Try to get authenticated user ID first
  const user = await supabaseAuth.getCurrentUser();
  if (user) {
    return user.id;
  }
  
  // Fall back to PIN-based ID for backward compatibility
  const pin = localStorage.getItem('zentry_pin');
  if (!pin) {
    // CRITICAL: Don't use shared 'anonymous' ID
    // Generate a unique session ID for unauthenticated users
    let sessionId = localStorage.getItem('zentry_session_id');
    if (!sessionId) {
      sessionId = 'session_' + crypto.randomUUID();
      localStorage.setItem('zentry_session_id', sessionId);
    }
    return sessionId;
  }
  return 'user_' + btoa(pin).slice(0, 16);
};

// Task operations
export const supabaseTaskStorage = {
  getAll: async (): Promise<Task[]> => {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }

    return data.map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      completed: task.completed,
      priority: task.priority,
      category: task.category,
      progress: task.progress,
      dueDate: task.due_date,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    }));
  },

  add: async (task: Task): Promise<void> => {
    const userId = await getUserId();
    const { error } = await supabase.from('tasks').insert({
      id: task.id,
      user_id: userId,
      title: task.title,
      description: task.description,
      completed: task.completed,
      priority: task.priority,
      category: task.category,
      progress: task.progress,
      due_date: task.dueDate,
      created_at: task.createdAt,
      updated_at: task.updatedAt,
    });

    if (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  },

  update: async (id: string, updates: Partial<Task>): Promise<void> => {
    const userId = await getUserId();
    const { error } = await supabase
      .from('tasks')
      .update({
        title: updates.title,
        description: updates.description,
        completed: updates.completed,
        priority: updates.priority,
        category: updates.category,
        progress: updates.progress,
        due_date: updates.dueDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    const userId = await getUserId();
    const { error} = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },
};

// Note operations
export const supabaseNoteStorage = {
  getAll: async (): Promise<Note[]> => {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      return [];
    }

    return data.map((note: any) => ({
      id: note.id,
      title: note.title,
      content: note.content,
      tags: note.tags || [],
      createdAt: note.created_at,
      updatedAt: note.updated_at,
    }));
  },

  add: async (note: Note): Promise<void> => {
    const userId = await getUserId();
    const { error } = await supabase.from('notes').insert({
      id: note.id,
      user_id: userId,
      title: note.title,
      content: note.content,
      tags: note.tags,
      created_at: note.createdAt,
      updated_at: note.updatedAt,
    });

    if (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  },

  update: async (id: string, updates: Partial<Note>): Promise<void> => {
    const userId = await getUserId();
    const { error } = await supabase
      .from('notes')
      .update({
        title: updates.title,
        content: updates.content,
        tags: updates.tags,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    const userId = await getUserId();
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  },
};

// Schedule operations
export const supabaseScheduleStorage = {
  getAll: async (): Promise<ScheduleEvent[]> => {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('schedule')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching schedule:', error);
      return [];
    }

    return data.map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description || '',
      startTime: event.start_time,
      endTime: event.end_time,
      date: event.date,
      color: event.color,
      category: event.category,
    }));
  },

  add: async (event: ScheduleEvent): Promise<void> => {
    const userId = await getUserId();
    const { error } = await supabase.from('schedule').insert({
      id: event.id,
      user_id: userId,
      title: event.title,
      description: event.description,
      start_time: event.startTime,
      end_time: event.endTime,
      date: event.date,
      color: event.color,
      category: event.category,
    });

    if (error) {
      console.error('Error adding schedule event:', error);
      throw error;
    }
  },

  update: async (id: string, updates: Partial<ScheduleEvent>): Promise<void> => {
    const userId = await getUserId();
    const { error } = await supabase
      .from('schedule')
      .update({
        title: updates.title,
        description: updates.description,
        start_time: updates.startTime,
        end_time: updates.endTime,
        date: updates.date,
        color: updates.color,
        category: updates.category,
      })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating schedule event:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    const userId = await getUserId();
    const { error } = await supabase
      .from('schedule')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting schedule event:', error);
      throw error;
    }
  },
};

// Profile operations
export const supabaseProfileStorage = {
  get: async (): Promise<UserProfile | null> => {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found
        return null;
      }
      console.error('Error fetching profile:', error);
      return null;
    }

    return {
      name: data.name,
      email: data.email,
      avatar: data.avatar,
      bio: data.bio,
    };
  },

  set: async (profile: UserProfile): Promise<void> => {
    const userId = await getUserId();
    
    // Try to update first (profile already exists)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        bio: profile.bio,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    // If update failed because profile doesn't exist, insert it
    if (updateError && updateError.code === 'PGRST116') {
      const { error: insertError } = await supabase.from('profiles').insert({
        user_id: userId,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        bio: profile.bio,
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error('Error inserting profile:', insertError);
        throw insertError;
      }
    } else if (updateError) {
      console.error('Error updating profile:', updateError);
      throw updateError;
    }
  },
};

// Settings storage
export const supabaseSettingsStorage = {
  get: async (): Promise<any | null> => {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No settings found
      console.error('Error fetching settings:', error);
      return null;
    }

    return {
      theme: data.theme,
      colorScheme: data.color_scheme,
      notifications: data.notifications,
      autoSave: data.auto_save,
    };
  },

  set: async (settings: any): Promise<void> => {
    const userId = await getUserId();

    // Try to update first (settings already exist)
    const { error: updateError } = await supabase
      .from('user_settings')
      .update({
        theme: settings.theme,
        color_scheme: settings.colorScheme,
        notifications: settings.notifications,
        auto_save: settings.autoSave,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    // If update failed because settings don't exist, insert them
    if (updateError && updateError.code === 'PGRST116') {
      const { error: insertError } = await supabase.from('user_settings').insert({
        user_id: userId,
        theme: settings.theme,
        color_scheme: settings.colorScheme,
        notifications: settings.notifications,
        auto_save: settings.autoSave,
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error('Error inserting settings:', insertError);
        throw insertError;
      }
    } else if (updateError) {
      console.error('Error updating settings:', updateError);
      throw updateError;
    }
  },
};

// Sync localStorage to Supabase
export const syncToSupabase = async () => {
  const localTasks = JSON.parse(localStorage.getItem('zentry_tasks') || '[]');
  const localNotes = JSON.parse(localStorage.getItem('zentry_notes') || '[]');
  const localSchedule = JSON.parse(localStorage.getItem('zentry_schedule') || '[]');
  const localProfile = JSON.parse(localStorage.getItem('zentry_profile') || 'null');

  try {
    // Sync tasks
    for (const task of localTasks) {
      await supabaseTaskStorage.add(task);
    }

    // Sync notes
    for (const note of localNotes) {
      await supabaseNoteStorage.add(note);
    }

    // Sync schedule
    for (const event of localSchedule) {
      await supabaseScheduleStorage.add(event);
    }

    // Sync profile
    if (localProfile) {
      await supabaseProfileStorage.set(localProfile);
    }

    console.log('✅ Successfully synced local data to Supabase');
  } catch (error) {
    console.error('Error syncing to Supabase:', error);
  }
};
