import { useState, useEffect } from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit, ChevronLeft, ChevronRight, Cloud, CloudOff } from 'lucide-react';
import { ScheduleEvent, scheduleStorage } from '@/lib/storage';
import { supabaseScheduleStorage } from '@/lib/supabaseStorage';
import { useToast } from '@/hooks/use-toast';

const Schedule = () => {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    date: '',
    color: '#8b5cf6',
    category: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const supabaseEvents = await supabaseScheduleStorage.getAll();
      // ALWAYS use Supabase data when successfully fetched (even if empty)
      // This ensures new users see empty state instead of cached data
      setEvents(supabaseEvents);
      scheduleStorage.set(supabaseEvents);
      setIsOnline(true);
    } catch (error) {
      console.error('Error loading from Supabase:', error);
      setEvents(scheduleStorage.getAll());
      setIsOnline(false);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      date: '',
      color: '#8b5cf6',
      category: '',
    });
    setEditingEvent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.date) {
      toast({
        title: 'Error',
        description: 'Please fill in title and date',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      if (editingEvent) {
        await supabaseScheduleStorage.update(editingEvent.id, formData);
        scheduleStorage.update(editingEvent.id, formData);
        toast({
          title: 'Event updated',
          description: '✅ Saved to cloud',
        });
      } else {
        const newEvent: ScheduleEvent = {
          id: Date.now().toString(),
          ...formData,
        };
        await supabaseScheduleStorage.add(newEvent);
        scheduleStorage.add(newEvent);
        toast({
          title: 'Event created',
          description: '✅ Saved to cloud',
        });
      }
      setIsOnline(true);
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      if (editingEvent) {
        scheduleStorage.update(editingEvent.id, formData);
      } else {
        const newEvent: ScheduleEvent = {
          id: Date.now().toString(),
          ...formData,
        };
        scheduleStorage.add(newEvent);
      }
      setIsOnline(false);
      toast({
        title: editingEvent ? 'Event updated' : 'Event created',
        description: '⚠️ Saved locally (offline)',
      });
    } finally {
      setIsLoading(false);
      loadEvents();
      resetForm();
      setIsDialogOpen(false);
    }
  };

  const handleEdit = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      startTime: event.startTime,
      endTime: event.endTime,
      date: event.date,
      color: event.color,
      category: event.category,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await supabaseScheduleStorage.delete(id);
      scheduleStorage.delete(id);
      toast({
        title: 'Event deleted',
        description: '✅ Removed from cloud',
      });
    } catch (error) {
      console.error('Error deleting from Supabase:', error);
      scheduleStorage.delete(id);
      toast({
        title: 'Event deleted',
        description: '⚠️ Removed locally',
      });
    }
    loadEvents();
    toast({
      title: 'Event deleted',
      description: 'Your event has been deleted',
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Schedule
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-muted-foreground">{events.length} total events</p>
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
                New Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
                <DialogDescription>
                  {editingEvent ? 'Update your event details below.' : 'Schedule a new event with date, time, and details.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Event Title *</label>
                  <Input
                    placeholder="e.g., Team Meeting"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <Textarea
                    placeholder="Add details about this event (optional)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Date *</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Start Time (Optional)</label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">End Time (Optional)</label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: string) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Meeting">💼 Meeting</SelectItem>
                        <SelectItem value="Appointment">📅 Appointment</SelectItem>
                        <SelectItem value="Deadline">⏰ Deadline</SelectItem>
                        <SelectItem value="Birthday">🎂 Birthday</SelectItem>
                        <SelectItem value="Holiday">🌴 Holiday</SelectItem>
                        <SelectItem value="Reminder">🔔 Reminder</SelectItem>
                        <SelectItem value="Personal">🏠 Personal</SelectItem>
                        <SelectItem value="Work">💼 Work</SelectItem>
                        <SelectItem value="School">📌 School</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Color</label>
                    <Input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="h-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingEvent ? 'Update' : 'Create'} Event
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

        <Card className="glass mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={goToNextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {dayNames.map(day => (
                <div key={day} className="text-center font-semibold text-sm text-muted-foreground p-2">
                  {day}
                </div>
              ))}
              {days.map((date, index) => {
                const dayEvents = getEventsForDate(date);
                return (
                  <div
                    key={index}
                    className={`min-h-[70px] p-1.5 rounded-md border transition-colors ${
                      date
                        ? isToday(date)
                          ? 'bg-primary/10 border-primary'
                          : 'bg-card/50 hover:bg-card border-border'
                        : 'bg-transparent border-transparent'
                    }`}
                  >
                    {date && (
                      <>
                        <div className={`text-xs font-medium mb-0.5 ${isToday(date) ? 'text-primary' : ''}`}>
                          {date.getDate()}
                        </div>
                        <div className="space-y-0.5">
                          {dayEvents.slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              className="text-[10px] px-1 py-0.5 rounded cursor-pointer hover:opacity-80 transition-opacity truncate"
                              style={{ backgroundColor: event.color + '40', color: event.color }}
                              onClick={() => handleEdit(event)}
                              title={event.title}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-[9px] text-muted-foreground text-center">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {events.length > 0 && (
          <Card className="glass">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {events
                  .sort((a, b) => new Date(a.date + ' ' + a.startTime).getTime() - new Date(b.date + ' ' + b.startTime).getTime())
                  .slice(0, 5)
                  .map(event => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-2 rounded-md border bg-card/50"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: event.color }}
                        />
                        <div>
                          <div className="font-medium text-sm">{event.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(event.date).toLocaleDateString()}
                            {event.startTime && ` at ${event.startTime}`}
                            {event.endTime && ` - ${event.endTime}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleEdit(event)}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleDelete(event.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Schedule;
