import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Smile, Meh, Frown, Angry, Laugh } from 'lucide-react';
import AppLayout from '@/components/Layout/AppLayout';
import { taskStorage, profileStorage } from '@/lib/storage';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    tasks: 0,
    completedTasks: 0,
  });
  const [userName, setUserName] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  useEffect(() => {
    const tasks = taskStorage.getAll();

    setStats({
      tasks: tasks.length,
      completedTasks: tasks.filter(t => t.completed).length,
    });

    // Get user's name from profile or Supabase user metadata
    const profile = profileStorage.get();
    if (profile?.name) {
      setUserName(profile.name);
    } else if (user?.user_metadata?.username) {
      setUserName(user.user_metadata.username);
    } else if (user?.email) {
      setUserName(user.email.split('@')[0]);
    } else {
      setUserName('there');
    }
  }, [user]);

  const moods = [
    { icon: <Laugh className="w-6 h-6" />, label: 'Amazing', value: 'amazing', color: 'text-green-500' },
    { icon: <Smile className="w-6 h-6" />, label: 'Good', value: 'good', color: 'text-blue-500' },
    { icon: <Meh className="w-6 h-6" />, label: 'Okay', value: 'okay', color: 'text-yellow-500' },
    { icon: <Frown className="w-6 h-6" />, label: 'Not Great', value: 'bad', color: 'text-orange-500' },
    { icon: <Angry className="w-6 h-6" />, label: 'Awful', value: 'awful', color: 'text-red-500' },
  ];

  const handleMoodSelect = (value: string) => {
    setSelectedMood(value);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Welcome Message */}
        <div className="animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome back, {userName}!
          </h1>
        </div>

        {/* Progress Bar */}
        <Card className="glass animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Task Completion</span>
                <span className="text-muted-foreground">
                  {stats.completedTasks} / {stats.tasks} completed
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.tasks > 0 ? (stats.completedTasks / stats.tasks) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-primary">
                  {stats.tasks > 0 ? Math.round((stats.completedTasks / stats.tasks) * 100) : 0}%
                </span>
                <p className="text-xs text-muted-foreground mt-1">Overall completion rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mood Tracker */}
        <Card className="glass animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className="text-lg">How are you feeling today?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-around gap-2">
              {moods.map((mood) => (
                <Button
                  key={mood.value}
                  variant={selectedMood === mood.value ? 'default' : 'outline'}
                  size="lg"
                  className={`flex flex-col items-center gap-2 h-auto py-4 px-3 transition-all hover:scale-110 ${
                    selectedMood === mood.value 
                      ? 'shadow-lg ring-2 ring-primary' 
                      : 'glass'
                  }`}
                  onClick={() => handleMoodSelect(mood.value)}
                >
                  <div className={selectedMood === mood.value ? 'text-primary-foreground' : mood.color}>
                    {mood.icon}
                  </div>
                  <span className="text-xs font-medium">{mood.label}</span>
                </Button>
              ))}
            </div>
            {selectedMood && (
              <p className="text-center text-sm text-muted-foreground mt-4 animate-fade-in">
                Thanks for sharing! We hope your day gets even better! ✨
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
