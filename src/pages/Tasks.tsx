import { useState, useEffect } from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Edit, Cloud, CloudOff, Clock, Calendar, Tag, Bell } from 'lucide-react';
import { Task, taskStorage } from '@/lib/storage';
import { supabaseTaskStorage } from '@/lib/supabaseStorage';
import { useToast } from '@/hooks/use-toast';
import { getPriorityColor, formatDate } from '@/lib/taskUtils';

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: '',
    dueDate: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      // Try to load from Supabase first
      const supabaseTasks = await supabaseTaskStorage.getAll();
      // ALWAYS use Supabase data when successfully fetched (even if empty)
      // This ensures new users see empty state instead of cached data
      setTasks(supabaseTasks);
      // Update localStorage to match Supabase
      taskStorage.set(supabaseTasks);
      setIsOnline(true);
    } catch (error) {
      console.error('Error loading from Supabase, using localStorage:', error);
      setTasks(taskStorage.getAll());
      setIsOnline(false);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      category: '',
      dueDate: '',
    });
    setEditingTask(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a task title',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      if (editingTask) {
        // Update in both Supabase and localStorage
        await supabaseTaskStorage.update(editingTask.id, formData);
        taskStorage.update(editingTask.id, formData);
        toast({
          title: 'Task updated',
          description: '✅ Saved to cloud',
        });
      } else {
        const newTask: Task = {
          id: Date.now().toString(),
          ...formData,
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        // Save to both Supabase and localStorage
        await supabaseTaskStorage.add(newTask);
        taskStorage.add(newTask);
        toast({
          title: 'Task created',
          description: '✅ Saved to cloud',
        });
      }
      setIsOnline(true);
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      // Fallback to localStorage only
      if (editingTask) {
        taskStorage.update(editingTask.id, formData);
      } else {
        const newTask: Task = {
          id: Date.now().toString(),
          ...formData,
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        taskStorage.add(newTask);
      }
      setIsOnline(false);
      toast({
        title: editingTask ? 'Task updated' : 'Task created',
        description: '⚠️ Saved locally (offline)',
        variant: 'default',
      });
    } finally {
      setIsLoading(false);
      loadTasks();
      resetForm();
      setIsDialogOpen(false);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      category: task.category,
      dueDate: task.dueDate || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await supabaseTaskStorage.delete(id);
      taskStorage.delete(id);
      toast({
        title: 'Task deleted',
        description: '✅ Removed from cloud',
      });
    } catch (error) {
      console.error('Error deleting from Supabase:', error);
      taskStorage.delete(id);
      toast({
        title: 'Task deleted',
        description: '⚠️ Removed locally',
      });
    }
    loadTasks();
  };

  const handleToggleComplete = async (task: Task) => {
    const updates = {
      completed: !task.completed
    };
    try {
      await supabaseTaskStorage.update(task.id, updates);
      taskStorage.update(task.id, updates);
    } catch (error) {
      console.error('Error updating in Supabase:', error);
      taskStorage.update(task.id, updates);
    }
    loadTasks();
  };

  const handleTaskClick = (task: Task) => {
    if (task.description) {
      setViewingTask(task);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              My Tasks
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-neumorphism-inset bg-white-blossom/60">
                {isOnline ? (
                  <>
                    <Cloud className="w-3.5 h-3.5 text-muted-rosewood" />
                    <span className="text-xs font-medium text-dried-rose">Synced</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="w-3.5 h-3.5 text-faded-mauve" />
                    <span className="text-xs font-medium text-dried-rose">Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            {tasks.length === 0 
              ? "No tasks yet."
              : `You have ${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}${tasks.filter(t => t.completed).length > 0 ? ` (${tasks.filter(t => t.completed).length} completed)` : ''}`
            }
          </p>
        </div>

        {/* Tasks Section Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg sm:text-xl font-semibold text-dried-rose">All Tasks</h3>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="default" className="gap-2 shadow-neumorphism hover:shadow-neumorphism-hover bg-dried-rose hover:bg-faded-mauve text-white transition-all">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">New Task</span>
                <span className="sm:hidden">New</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[90vw] md:max-w-[500px] rounded-3xl border-0 shadow-neumorphism">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-dried-rose">{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {editingTask ? 'Update your task details below.' : 'Fill in the details to create a new task.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-dried-rose">Task Title *</label>
                  <Input
                    placeholder="e.g., Complete project proposal"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-dried-rose">Description</label>
                  <Textarea
                    placeholder="Add details about this task (optional)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-dried-rose">Priority</label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">🟢 Low</SelectItem>
                        <SelectItem value="medium">🟡 Medium</SelectItem>
                        <SelectItem value="high">🔴 High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-dried-rose">Category</label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: string) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Work">💼 Work</SelectItem>
                        <SelectItem value="Personal">🏠 Personal</SelectItem>
                        <SelectItem value="Health">💪 Health</SelectItem>
                        <SelectItem value="Finance">💰 Finance</SelectItem>
                        <SelectItem value="Education">📚 Education</SelectItem>
                        <SelectItem value="Shopping">🛒 Shopping</SelectItem>
                        <SelectItem value="Family">👨‍👩‍👧‍👦 Family</SelectItem>
                        <SelectItem value="Social">🎉 Social</SelectItem>
                        <SelectItem value="Other">📌 Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-dried-rose">Due Date (Optional)</label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setIsDialogOpen(false);
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Task Details Dialog */}
        <Dialog open={!!viewingTask} onOpenChange={(open) => !open && setViewingTask(null)}>
          <DialogContent className="sm:max-w-[90vw] md:max-w-[500px] rounded-3xl border-0 shadow-neumorphism">
            {viewingTask && (
              <>
                <DialogHeader>
                  <DialogTitle className={`text-xl font-bold text-dried-rose ${viewingTask.completed ? 'line-through opacity-60' : ''}`}>
                    {viewingTask.title}
                  </DialogTitle>
                  {viewingTask.completed && (
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">✓ Completed</span>
                  )}
                </DialogHeader>
                
                <div className="space-y-4">
                  {viewingTask.description && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Description</h4>
                      <p className="text-sm text-foreground break-words whitespace-pre-wrap p-3 rounded-lg bg-muted/50">
                        {viewingTask.description}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground">Details</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1.5 rounded-full text-sm font-semibold capitalize shadow-neumorphism ${getPriorityColor(viewingTask.priority)}`}>
                        {viewingTask.priority} Priority
                      </span>
                      {viewingTask.category && (
                        <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-muted">
                          📂 {viewingTask.category}
                        </span>
                      )}
                      {viewingTask.dueDate && (
                        <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-muted">
                          📅 Due: {new Date(viewingTask.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => {
                        setViewingTask(null);
                        handleEdit(viewingTask);
                      }}
                      className="flex-1 gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Task
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setViewingTask(null)}
                      className="flex-1"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        <div className="grid gap-3 sm:gap-4">
          {tasks.length === 0 ? (
            <Card className="shadow-neumorphism border-0 bg-white-blossom/60 animate-fade-in">
              <CardContent className="py-16 text-center space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-dried-rose mb-2">No tasks yet</h3>
                  <p className="text-muted-foreground">Click the button above to get started!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            tasks.map((task, index) => (
              <Card
                key={task.id}
                className={`shadow-neumorphism hover:shadow-neumorphism-hover border-0 transition-all animate-scale-in cursor-pointer relative overflow-hidden ${getPriorityColor(task.priority)}`}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleTaskClick(task)}
              >
                <CardContent className="py-3 px-3 sm:py-4 sm:px-4 md:py-5 md:px-5">
                  <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                    {/* Checkbox */}
                    <div onClick={(e) => e.stopPropagation()} className="pt-0.5 sm:pt-1">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => handleToggleComplete(task)}
                        className="h-4 w-4 sm:h-5 sm:w-5 rounded-full flex-shrink-0"
                      />
                    </div>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title and Description */}
                      <div className="mb-1.5 sm:mb-2">
                        <h3 className={`text-sm sm:text-base md:text-lg font-semibold mb-0.5 sm:mb-1 ${task.completed ? 'line-through opacity-60' : ''}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Info Row with Icons */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground">
                        {task.dueDate && (
                          <>
                            <div className="flex items-center gap-0.5 sm:gap-1">
                              <Clock className="w-3 h-3" />
                              <span>18:00</span>
                            </div>
                            <div className="flex items-center gap-0.5 sm:gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(task.dueDate)}</span>
                            </div>
                          </>
                        )}
                        {task.category && (
                          <div className="flex items-center gap-0.5 sm:gap-1">
                            <Tag className="w-3 h-3" />
                            <span className="lowercase truncate max-w-[80px] sm:max-w-none">{task.category}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(task.id)}
                        title="Delete task"
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Tasks;
