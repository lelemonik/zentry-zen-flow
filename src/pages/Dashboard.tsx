import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Smile, Meh, Frown, Angry, Laugh, MessageSquare, Lightbulb, Send } from 'lucide-react';
import AppLayout from '@/components/Layout/AppLayout';
import { taskStorage, profileStorage, moodStorage } from '@/lib/storage';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    tasks: 0,
    completedTasks: 0,
  });
  const [userName, setUserName] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [featureText, setFeatureText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const tasks = taskStorage.getAll();

      setStats({
        tasks: tasks.length,
        completedTasks: tasks.filter(t => t.completed).length,
      });

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
    };

    loadData();
  }, [user]);

  const moods = [
    { icon: <Laugh className="w-6 h-6" />, label: 'Amazing', value: 'amazing', color: 'text-primary' },
    { icon: <Smile className="w-6 h-6" />, label: 'Good', value: 'good', color: 'text-primary' },
    { icon: <Meh className="w-6 h-6" />, label: 'Okay', value: 'okay', color: 'text-muted-foreground' },
    { icon: <Frown className="w-6 h-6" />, label: 'Not Great', value: 'bad', color: 'text-accent' },
    { icon: <Angry className="w-6 h-6" />, label: 'Awful', value: 'awful', color: 'text-destructive' },
  ];

  const handleMoodSelect = (value: string) => {
    setSelectedMood(value);
    // Save mood to localStorage
    moodStorage.setTodayMood(value);
    
    // Show feedback toast
    toast({
      title: 'Mood saved!',
      duration: 2000,
    });
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

    // Simulate submission (you can replace this with actual API call)
    setTimeout(() => {
      toast({
        title: 'Thank you!',
        description: `Your ${type === 'feedback' ? 'feedback' : 'feature request'} has been submitted. We appreciate your input!`,
      });
      
      if (type === 'feedback') {
        setFeedbackText('');
      } else {
        setFeatureText('');
      }
      
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Welcome Message */}
        <div className="animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome back, {userName}!
          </h1>
          <p className="text-muted-foreground">
            You have {stats.tasks} {stats.tasks === 1 ? 'task' : 'tasks'} {stats.completedTasks > 0 && `(${stats.completedTasks} completed)`}
          </p>
        </div>

        {/* Mood Tracker */}
        <Card className="glass animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className="text-lg">How are you feeling today?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:justify-around">
              {moods.map((mood) => (
                <Button
                  key={mood.value}
                  variant={selectedMood === mood.value ? 'default' : 'outline'}
                  size="lg"
                  className={`flex flex-col items-center gap-1 sm:gap-2 h-auto py-3 px-2 sm:py-4 sm:px-3 min-w-[60px] sm:min-w-[70px] transition-all hover:scale-110 ${
                    selectedMood === mood.value 
                      ? 'shadow-lg ring-2 ring-primary' 
                      : 'glass'
                  }`}
                  onClick={() => handleMoodSelect(mood.value)}
                >
                  <div className={selectedMood === mood.value ? 'text-primary-foreground' : mood.color}>
                    {mood.icon}
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">{mood.label}</span>
                </Button>
              ))}
            </div>
            {selectedMood && (
              <p className="text-center text-sm text-muted-foreground mt-4 animate-fade-in">
                We hope your day gets even better! 
              </p>
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
