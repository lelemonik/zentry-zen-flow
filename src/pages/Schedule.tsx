import { useState, useEffect } from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit, Cloud, CloudOff } from 'lucide-react';
import { ScheduleEvent, scheduleStorage } from '@/lib/storage';
import { supabaseScheduleStorage } from '@/lib/supabaseStorage';
import { useToast } from '@/hooks/use-toast';
import { CalendarGrid } from '@/components/CalendarGrid';

const Schedule = () => {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
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
    color: '#b9908d', // Default to faded mauve from Cloud Petal palette
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



  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateEvents, setDateEvents] = useState<ScheduleEvent[]>([]);

  const handleDateSelect = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayEvents = events.filter(event => event.date === dateStr);
    
    setSelectedDate(date);
    setDateEvents(dayEvents);
    
    // Pre-fill the form date when a date is selected
    if (!editingEvent) {
      setFormData(prev => ({ ...prev, date: dateStr }));
    }
  };

  const handleCloseFloatingBox = () => {
    setSelectedDate(null);
    setDateEvents([]);
    resetForm();
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      date: '',
      color: '#b9908d', // Default to faded mauve from Cloud Petal palette
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
      // Refresh the date events if a date is selected
      if (selectedDate) {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const refreshedEvents = await supabaseScheduleStorage.getAll();
        const dayEvents = refreshedEvents.filter(event => event.date === dateStr);
        setDateEvents(dayEvents);
      }
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
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date): ScheduleEvent[] => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
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
    await loadEvents();
    // Refresh the date events if a date is selected
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const refreshedEvents = scheduleStorage.getAll();
      const dayEvents = refreshedEvents.filter(event => event.date === dateStr);
      setDateEvents(dayEvents);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              My Schedule
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
          <p className="text-muted-foreground">
            {events.length === 0 
              ? "Click any date to create your first event."
              : `You have ${events.length} ${events.length === 1 ? 'event' : 'events'} scheduled. Click a date to view or add events.`
            }
          </p>
        </div>

        {/* Calendar Grid */}
        <Card className="shadow-neumorphism border-0 bg-white-blossom/60 p-4 sm:p-6 animate-slide-up" style={{ animationDelay: '50ms' }}>
          <CalendarGrid
            currentDate={currentDate}
            selectedDates={selectedDate ? [selectedDate] : []}
            onDateSelect={handleDateSelect}
            onMonthChange={handleMonthChange}
            eventsData={events}
          />
        </Card>

        {/* Floating Event Box - Centered Modal */}
        <Dialog open={!!selectedDate} onOpenChange={(open) => {
          if (!open) handleCloseFloatingBox();
        }}>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto rounded-3xl bg-white-blossom shadow-neumorphism border-0">
            <div className="space-y-4">
              {/* Date Header */}
              <div className="pb-4 border-b border-petal-dust">
                <h3 className="text-xl sm:text-2xl font-bold text-dried-rose">
                  {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {dateEvents.length === 0 
                    ? "No events scheduled for this day"
                    : `${dateEvents.length} ${dateEvents.length === 1 ? 'event' : 'events'} scheduled`
                  }
                </p>
              </div>

              {/* Existing Events */}
              {dateEvents.length > 0 && (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {dateEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 sm:p-4 rounded-2xl shadow-neumorphism-inset border-l-4 transition-all hover:shadow-neumorphism"
                      style={{ borderLeftColor: event.color }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-dried-rose text-base sm:text-lg flex-1">
                          {event.title}
                        </h4>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              handleEdit(event);
                              setIsDialogOpen(true);
                            }}
                            className="h-7 w-7 p-0 hover:bg-petal-dust/20"
                            title="Edit event"
                          >
                            <Edit className="w-3.5 h-3.5 text-dried-rose" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(event.id)}
                            className="h-7 w-7 p-0 hover:bg-destructive/10"
                            title="Delete event"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      
                      {event.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2 leading-relaxed">
                          {event.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        {event.startTime && (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-petal-dust/20 text-dried-rose text-xs font-medium">
                            <span>🕐</span>
                            <span>
                              {event.startTime}
                              {event.endTime && ` - ${event.endTime}`}
                            </span>
                          </div>
                        )}
                        {event.category && (
                          <div className="px-2 py-1 rounded-full bg-muted-rosewood/20 text-dried-rose text-xs font-medium">
                            📂 {event.category}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Create New Event Button */}
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full gap-2 shadow-neumorphism hover:shadow-neumorphism-hover bg-dried-rose hover:bg-faded-mauve text-white transition-all"
                    onClick={() => {
                      resetForm();
                      if (selectedDate) {
                        setFormData(prev => ({ 
                          ...prev, 
                          date: selectedDate.toISOString().split('T')[0] 
                        }));
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Event to This Day
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </DialogContent>
        </Dialog>

        {/* Event Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
                <DialogDescription>
                  {editingEvent ? 'Update your event details below.' : 'Schedule a new event with date, time, and details.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-dried-rose">Event Title *</label>
                  <Input
                    placeholder="e.g., Team Meeting"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-dried-rose">Description</label>
                  <Textarea
                    placeholder="Add details about this event (optional)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-dried-rose">Date *</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-dried-rose">Start Time (Optional)</label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-dried-rose">End Time (Optional)</label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                    <label className="text-sm font-semibold text-dried-rose">Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { color: '#f5e0e2', name: 'Blush Cloud' },
                        { color: '#e8cdc7', name: 'Petal Dust' },
                        { color: '#d7b3ad', name: 'Muted Rosewood' },
                        { color: '#b9908d', name: 'Faded Mauve' },
                        { color: '#8b6a69', name: 'Dried Rose' },
                        { color: '#f9f7f4', name: 'White Blossom' },
                      ].map((item) => (
                        <button
                          key={item.color}
                          type="button"
                          onClick={() => setFormData({ ...formData, color: item.color })}
                          className={`w-10 h-10 rounded-xl transition-all shadow-neumorphism hover:shadow-neumorphism-hover ${
                            formData.color === item.color 
                              ? 'ring-2 ring-dried-rose scale-110' 
                              : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: item.color }}
                          title={item.name}
                        />
                      ))}
                    </div>
                    <Input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="h-8 w-full mt-2"
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
    </AppLayout>
  );
};

export default Schedule;
