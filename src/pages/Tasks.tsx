import { useState, useEffect } from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Edit, Cloud, CloudOff } from 'lucide-react';
import { Task, taskStorage } from '@/lib/storage';
import { supabaseTaskStorage } from '@/lib/supabaseStorage';
import { useToast } from '@/hooks/use-toast';

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: '',
    progress: 0,
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
      progress: 0,
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
      progress: task.progress,
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
      completed: !task.completed,
      progress: !task.completed ? 100 : task.progress
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

  const handleProgressChange = async (taskId: string, progress: number) => {
    try {
      await supabaseTaskStorage.update(taskId, { progress });
      taskStorage.update(taskId, { progress });
    } catch (error) {
      console.error('Error updating progress:', error);
      taskStorage.update(taskId, { progress });
    }
    loadTasks();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-500 to-orange-500';
      case 'medium': return 'from-yellow-500 to-amber-500';
      case 'low': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Tasks
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-muted-foreground">{tasks.length} total tasks</p>
              <div className="flex items-center gap-1 text-xs">
                {isOnline ? (
                  <>
                    <Cloud className="w-3 h-3 text-green-500" />
                    <span className="text-green-500">Cloud synced</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="w-3 h-3 text-amber-500" />
                    <span className="text-amber-500">Offline mode</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Task title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Description (optional)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Input
                      placeholder="Category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingTask ? 'Update' : 'Create'} Task
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setIsDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {tasks.length === 0 ? (
            <Card className="glass">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No tasks yet. Create your first task to get started!</p>
              </CardContent>
            </Card>
          ) : (
            tasks.map((task, index) => (
              <Card
                key={task.id}
                className="glass hover:shadow-lg transition-all animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleComplete(task)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className={`text-xl ${task.completed ? 'line-through opacity-60' : ''}`}>
                          {task.title}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(task)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(task.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {task.description && (
                        <p className="text-muted-foreground mt-2">{task.description}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getPriorityColor(task.priority)} text-white`}>
                        {task.priority}
                      </span>
                      {task.category && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted">
                          {task.category}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="h-2" />
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
