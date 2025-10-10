import { supabase } from './supabase';

export interface Feedback {
  id?: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  type: 'feedback' | 'feature';
  content: string;
  status?: 'new' | 'reviewed' | 'in-progress' | 'completed' | 'closed';
  priority?: 'low' | 'medium' | 'high';
  created_at?: string;
  updated_at?: string;
}

export const supabaseFeedbackStorage = {
  // Submit new feedback or feature request
  async submit(feedback: Omit<Feedback, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('feedback')
      .insert([{
        user_id: user.id,
        user_email: feedback.user_email || user.email || '',
        user_name: feedback.user_name || user.user_metadata?.username || 'Anonymous',
        type: feedback.type,
        content: feedback.content,
        status: 'new',
        priority: 'medium',
      }]);

    if (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  },

  // Get user's own feedback submissions
  async getUserFeedback(): Promise<Feedback[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching feedback:', error);
      throw error;
    }

    return data || [];
  },

  // Get ALL feedback (admin only - RLS policy will handle permissions)
  async getAllFeedback(): Promise<Feedback[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // RLS policy will automatically filter based on admin status
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all feedback:', error);
      throw error;
    }

    return data || [];
  },

  // Update feedback (user can edit their submission)
  async update(id: string, content: string): Promise<void> {
    const { error } = await supabase
      .from('feedback')
      .update({ 
        content,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating feedback:', error);
      throw error;
    }
  },

  // Delete feedback
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  },
};
