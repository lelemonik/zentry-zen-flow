import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Smile, Meh, Frown, Angry, Laugh, MessageSquare, Lightbulb, Send, TrendingUp, Calendar, Zap, Trash2 } from 'lucide-react';
import AppLayout from '@/components/Layout/AppLayout';
import { taskStorage, profileStorage, moodStorage, type MoodEntry } from '@/lib/storage';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabaseFeedbackStorage } from '@/lib/supabaseFeedback';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    tasks: 0,
    completedTasks: 0,
  });
  const [userName, setUserName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [featureText, setFeatureText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [showMoodHistory, setShowMoodHistory] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const tasks = taskStorage.getAll();

      setStats({
        tasks: tasks.length,
        completedTasks: tasks.filter(t => t.completed).length,
      });

      // Check if user is new (first time login)
      const hasVisitedKey = `hasVisited_${user?.id || 'guest'}`;
      const hasVisited = localStorage.getItem(hasVisitedKey);
      
      if (!hasVisited) {
        setIsNewUser(true);
        localStorage.setItem(hasVisitedKey, 'true');
      } else {
        setIsNewUser(false);
      }

      // Get user's name from profile or Supabase user metadata
      let profile = profileStorage.get();
      
      // If no local profile or empty name, try loading from Supabase
      if (!profile?.name) {
        try {
          const { supabaseProfileStorage } = await import('@/lib/supabaseStorage');
          const supabaseProfile = await supabaseProfileStorage.get();
          if (supabaseProfile?.name) {
            profile = supabaseProfile;
            profileStorage.set(supabaseProfile);
          }
        } catch (error) {
          console.error('Error loading profile from Supabase:', error);
        }
      }

      if (profile?.name) {
        setUserName(profile.name);
      } else if (user?.user_metadata?.username) {
        setUserName(user.user_metadata.username);
      } else if (user?.email) {
        setUserName(user.email.split('@')[0]);
      } else {
        setUserName('there');
      }

      // Load today's mood from storage
      const todayMood = moodStorage.getTodayMood();
      if (todayMood) {
        setSelectedMood(todayMood);
      }

      // Load mood history
      const history = moodStorage.getHistory();
      setMoodHistory(history);
    };

    loadData();
  }, [user]);

  const moods = [
    { 
      icon: <Laugh className="w-full h-full" />, 
      label: 'Amazing', 
      value: 'amazing', 
      color: 'text-blush-cloud',
      bgGradient: 'from-blush-cloud/40 to-blush-cloud/15',
      borderColor: 'border-blush-cloud/50'
    },
    { 
      icon: <Smile className="w-full h-full" />, 
      label: 'Good', 
      value: 'good', 
      color: 'text-petal-dust',
      bgGradient: 'from-petal-dust/40 to-petal-dust/15',
      borderColor: 'border-petal-dust/50'
    },
    { 
      icon: <Meh className="w-full h-full" />, 
      label: 'Okay', 
      value: 'okay', 
      color: 'text-muted-rosewood',
      bgGradient: 'from-muted-rosewood/40 to-muted-rosewood/15',
      borderColor: 'border-muted-rosewood/50'
    },
    { 
      icon: <Frown className="w-full h-full" />, 
      label: 'Not Great', 
      value: 'bad', 
      color: 'text-faded-mauve',
      bgGradient: 'from-faded-mauve/40 to-faded-mauve/15',
      borderColor: 'border-faded-mauve/50'
    },
    { 
      icon: <Angry className="w-full h-full" />, 
      label: 'Awful', 
      value: 'awful', 
      color: 'text-dried-rose',
      bgGradient: 'from-dried-rose/40 to-dried-rose/15',
      borderColor: 'border-dried-rose/50'
    },
  ];

  const handleMoodSelect = (value: string) => {
    setSelectedMood(value);
    // Save mood to localStorage
    moodStorage.setTodayMood(value);
    
    // Update mood history
    const history = moodStorage.getHistory();
    setMoodHistory(history);
    
    // Show feedback toast
    toast({
      title: 'Mood saved!',
      description: 'Your mood has been tracked for today',
      duration: 2000,
    });
  };

  const handleDeleteMood = (date: string) => {
    if (!confirm('Are you sure you want to delete this mood entry?')) return;

    moodStorage.deleteMoodByDate(date);
    const history = moodStorage.getHistory();
    setMoodHistory(history);

    // Update selected mood if deleting today
    const today = new Date().toISOString().split('T')[0];
    if (date === today) {
      setSelectedMood(null);
    }

    toast({
      title: 'Mood deleted',
      description: 'Mood entry has been removed',
    });
  };

  // Calculate mood statistics
  const getMoodStats = () => {
    if (moodHistory.length === 0) {
      return { mostCommon: null, streak: 0, weeklyAverage: null, totalDays: 0 };
    }

    // Count mood occurrences
    const moodCounts: Record<string, number> = {};
    moodHistory.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });

    // Find most common mood
    const mostCommon = Object.entries(moodCounts).reduce((a, b) => b[1] > a[1] ? b : a)[0];

    // Calculate streak (consecutive days logged)
    let streak = 0;
    const sortedHistory = [...moodHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const today = new Date().toISOString().split('T')[0];
    let currentDate = new Date(today);
    
    for (const entry of sortedHistory) {
      const entryDate = entry.date;
      const expectedDate = currentDate.toISOString().split('T')[0];
      
      if (entryDate === expectedDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Get last 7 days for weekly average
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentMoods = moodHistory.filter(entry => 
      new Date(entry.date) >= sevenDaysAgo
    );

    return {
      mostCommon,
      streak,
      recentDays: recentMoods.length,
      totalDays: moodHistory.length
    };
  };

  const stats_mood = getMoodStats();

  // Get mood emoji for display
  const getMoodIcon = (moodValue: string) => {
    const mood = moods.find(m => m.value === moodValue);
    return mood ? mood.icon : null;
  };

  const getMoodLabel = (moodValue: string) => {
    const mood = moods.find(m => m.value === moodValue);
    return mood ? mood.label : moodValue;
  };

  const getMoodColor = (moodValue: string) => {
    const mood = moods.find(m => m.value === moodValue);
    return mood ? mood.color : 'text-muted-foreground';
  };

  const getMoodGradient = (moodValue: string) => {
    const mood = moods.find(m => m.value === moodValue);
    return mood ? mood.bgGradient : 'from-gray-100 to-gray-50';
  };

  const handleSubmitFeedback = async (type: 'feedback' | 'feature') => {
    const text = type === 'feedback' ? feedbackText : featureText;
    
    if (!text.trim()) {
      toast({
        title: 'Empty submission',
        description: 'Please enter your ' + type + ' before submitting',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get user profile for additional context
      const profile = profileStorage.get();
      
      // Submit to Supabase
      await supabaseFeedbackStorage.submit({
        user_id: user?.id || 'anonymous',
        user_email: user?.email || profile?.email || '',
        user_name: profile?.name || user?.user_metadata?.username || 'Anonymous',
        type: type,
        content: text,
      });

      toast({
        title: 'Thank you!',
        description: `Your ${type === 'feedback' ? 'feedback' : 'feature request'} has been submitted successfully. We'll review it soon!`,
      });
      
      if (type === 'feedback') {
        setFeedbackText('');
      } else {
        setFeatureText('');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Submission failed',
        description: 'There was an error submitting your ' + type + '. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Welcome Message */}
        <div className="animate-fade-in">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {isNewUser ? `Welcome, ${userName}!` : `Welcome back, ${userName}!`}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {isNewUser 
              ? "We're excited to have you here!"
              : `You have ${stats.tasks} ${stats.tasks === 1 ? 'task' : 'tasks'}${stats.completedTasks > 0 ? ` (${stats.completedTasks} completed)` : ''}`
            }
          </p>
        </div>

        {/* Mood Tracker */}
        <Card className="glass animate-slide-up border-0 shadow-neumorphism" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg sm:text-xl bg-gradient-to-r from-blush-cloud via-petal-dust to-muted-rosewood bg-clip-text text-transparent">
                How are you feeling today?
              </CardTitle>
              {moodHistory.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMoodHistory(!showMoodHistory)}
                  className="text-xs hover:bg-petal-dust/10 text-dried-rose"
                >
                  {showMoodHistory ? 'Hide' : 'View'} History
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mood Selection */}
            <div className="flex justify-center sm:justify-around gap-3 sm:gap-4 flex-wrap">
              {moods.map((mood, index) => (
                <button
                  key={mood.value}
                  className={`group relative flex flex-col items-center gap-2.5 h-auto py-4 sm:py-5 px-4 sm:px-5 rounded-2xl transition-all duration-300 min-w-[80px] sm:min-w-[90px] ${
                    selectedMood === mood.value 
                      ? `shadow-neumorphism-pressed bg-gradient-to-br ${mood.bgGradient} border-2 ${mood.borderColor} scale-105` 
                      : 'shadow-neumorphism hover:shadow-neumorphism-hover border-2 border-transparent hover:border-petal-dust/30 hover:scale-105 bg-white-blossom/60'
                  }`}
                  onClick={() => handleMoodSelect(mood.value)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Glow effect on hover/selected */}
                  <div className={`absolute inset-0 rounded-2xl blur-xl transition-opacity duration-300 ${
                    selectedMood === mood.value 
                      ? `bg-gradient-to-br ${mood.bgGradient} opacity-35` 
                      : 'opacity-0 group-hover:opacity-25 bg-petal-dust/30'
                  }`} />
                  
                  {/* Icon */}
                  <div className={`relative w-8 h-8 sm:w-9 sm:h-9 transition-all duration-300 ${
                    selectedMood === mood.value 
                      ? `${mood.color} drop-shadow-lg scale-110` 
                      : `${mood.color} opacity-60 group-hover:opacity-100 group-hover:scale-110`
                  }`}>
                    {mood.icon}
                  </div>
                  
                  {/* Label */}
                  <span className={`relative text-xs sm:text-sm font-semibold transition-all duration-300 ${
                    selectedMood === mood.value 
                      ? `${mood.color}` 
                      : 'text-muted-foreground group-hover:text-muted-rosewood'
                  }`}>
                    {mood.label}
                  </span>
                  
                  {/* Selected indicator */}
                  {selectedMood === mood.value && (
                    <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${mood.color.replace('text-', 'bg-')} animate-pulse`} />
                  )}
                </button>
              ))}
            </div>

            {/* Mood Message */}
            {selectedMood && (
              <div className="text-center space-y-2 animate-fade-in">
                <p className="text-sm text-muted-foreground">
                  {selectedMood === 'amazing' && '🎉 That\'s wonderful! Keep spreading the positivity!'}
                  {selectedMood === 'good' && '😊 Great to hear! Hope your day stays bright!'}
                  {selectedMood === 'okay' && '👍 Every day is a new opportunity!'}
                  {selectedMood === 'bad' && '💙 Tomorrow is a fresh start. Take care of yourself.'}
                  {selectedMood === 'awful' && '💜 We\'re here for you. Remember, tough times don\'t last.'}
                </p>
              </div>
            )}

            {/* Mood Statistics */}
            {moodHistory.length > 0 && (
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-petal-dust/30">
                <div className="text-center space-y-1 p-3 rounded-xl shadow-neumorphism-inset bg-gradient-to-br from-blush-cloud/15 to-transparent">
                  <div className="flex items-center justify-center gap-1">
                    <Zap className="w-4 h-4 text-faded-mauve" />
                    <p className="text-xl sm:text-2xl font-bold text-dried-rose">{stats_mood.streak}</p>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Day Streak</p>
                </div>
                
                <div className="text-center space-y-1 p-3 rounded-xl shadow-neumorphism-inset bg-gradient-to-br from-petal-dust/15 to-transparent">
                  <div className="flex items-center justify-center gap-1">
                    <Calendar className="w-4 h-4 text-faded-mauve" />
                    <p className="text-xl sm:text-2xl font-bold text-dried-rose">{stats_mood.totalDays}</p>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Days Tracked</p>
                </div>
                
                {stats_mood.mostCommon && (
                  <div className="text-center space-y-1 p-3 rounded-xl shadow-neumorphism-inset bg-gradient-to-br from-muted-rosewood/15 to-transparent">
                    <div className="flex items-center justify-center gap-1">
                      <div className={`w-5 h-5 ${getMoodColor(stats_mood.mostCommon)}`}>
                        {getMoodIcon(stats_mood.mostCommon)}
                      </div>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Most Common</p>
                  </div>
                )}
              </div>
            )}

            {/* Mood History */}
            {showMoodHistory && moodHistory.length > 0 && (
              <div className="pt-4 border-t border-petal-dust/30 animate-slide-up">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-muted-rosewood" />
                  <h3 className="text-sm font-semibold text-dried-rose">Recent Mood History</h3>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {[...moodHistory]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 14)
                    .map((entry, index) => {
                      const date = new Date(entry.date);
                      const isToday = entry.date === new Date().toISOString().split('T')[0];
                      const isYesterday = entry.date === new Date(Date.now() - 86400000).toISOString().split('T')[0];
                      
                      return (
                        <div 
                          key={entry.timestamp}
                          className={`group flex items-center justify-between p-3.5 rounded-xl shadow-neumorphism-inset bg-gradient-to-r ${
                            isToday 
                              ? `${getMoodGradient(entry.mood)} border-2 ${moods.find(m => m.value === entry.mood)?.borderColor || 'border-petal-dust/40'}`
                              : 'from-white-blossom/70 to-petal-dust/5 border-2 border-transparent hover:border-petal-dust/30'
                          } hover:shadow-neumorphism transition-all duration-300`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-10 h-10 flex items-center justify-center rounded-xl shadow-neumorphism transition-all duration-300 ${
                              isToday 
                                ? `bg-gradient-to-br ${getMoodGradient(entry.mood)} scale-105` 
                                : 'bg-white/80 group-hover:bg-white group-hover:scale-105'
                            }`}>
                              <div className={`w-6 h-6 ${getMoodColor(entry.mood)} transition-transform group-hover:scale-110`}>
                                {getMoodIcon(entry.mood)}
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm font-semibold ${getMoodColor(entry.mood)}`}>
                                {getMoodLabel(entry.mood)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {isToday ? 'Today' : isYesterday ? 'Yesterday' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined })}
                              </p>
                              <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                                Created {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isToday && (
                              <Badge 
                                variant="secondary" 
                                className={`text-[10px] font-semibold bg-gradient-to-r ${getMoodGradient(entry.mood)} ${getMoodColor(entry.mood)} border ${moods.find(m => m.value === entry.mood)?.borderColor || 'border-pastel-steel/30'} shadow-sm`}
                              >
                                Current
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteMood(entry.date)}
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                              title="Delete mood entry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
                {moodHistory.length > 14 && (
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    Showing 14 most recent entries • {moodHistory.length} total
                  </p>
                )}
              </div>
            )}

            {/* First time message */}
            {moodHistory.length === 0 && !selectedMood && (
              <div className="text-center p-4 rounded-lg bg-gradient-to-r from-blush-cloud/15 to-petal-dust/15">
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feedback & Feature Request Section */}
        <Card className="glass animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="w-5 h-5" />
              Share Your Thoughts
            </CardTitle>
            <CardDescription>
              Help us improve Zentry by sharing feedback or requesting new features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="feedback" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="feedback" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Feedback
                </TabsTrigger>
                <TabsTrigger value="feature" className="gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Feature Request
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="feedback" className="space-y-4 mt-4">
                <Textarea
                  placeholder="Tell us what you think about Zentry... What's working well? What could be better?"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
                <Button
                  onClick={() => handleSubmitFeedback('feedback')}
                  disabled={isSubmitting || !feedbackText.trim()}
                  className="w-full gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                </Button>
              </TabsContent>
              
              <TabsContent value="feature" className="space-y-4 mt-4">
                <Textarea
                  placeholder="Describe a feature you'd love to see in Zentry... Be as detailed as you like!"
                  value={featureText}
                  onChange={(e) => setFeatureText(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
                <Button
                  onClick={() => handleSubmitFeedback('feature')}
                  disabled={isSubmitting || !featureText.trim()}
                  className="w-full gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Sending...' : 'Submit Request'}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
