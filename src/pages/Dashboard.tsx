import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, FileText, Calendar, MessageSquare, TrendingUp } from 'lucide-react';
import AppLayout from '@/components/Layout/AppLayout';
import { taskStorage, noteStorage, scheduleStorage } from '@/lib/storage';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    tasks: 0,
    completedTasks: 0,
    notes: 0,
    events: 0,
  });

  useEffect(() => {
    const tasks = taskStorage.getAll();
    const notes = noteStorage.getAll();
    const events = scheduleStorage.getAll();

    setStats({
      tasks: tasks.length,
      completedTasks: tasks.filter(t => t.completed).length,
      notes: notes.length,
      events: events.length,
    });
  }, []);

  const quickActions = [
    {
      icon: <CheckSquare className="w-8 h-8" />,
      title: 'Tasks',
      description: `${stats.tasks} total, ${stats.completedTasks} completed`,
      path: '/tasks',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Notes',
      description: `${stats.notes} notes`,
      path: '/notes',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Schedule',
      description: `${stats.events} events`,
      path: '/schedule',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: 'AI Assistant',
      description: 'Chat with AI',
      path: '/chat',
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome back!
          </h1>
          <p className="text-muted-foreground text-lg">
            Your productivity dashboard
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className="glass cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => navigate(action.path)}
            >
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white mb-2`}>
                  {action.icon}
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{action.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Progress Section */}
        <Card className="glass animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Your Progress
            </CardTitle>
            <CardDescription>Keep up the great work!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Task Completion</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.tasks > 0 ? Math.round((stats.completedTasks / stats.tasks) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.tasks > 0 ? (stats.completedTasks / stats.tasks) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.tasks}</div>
                  <div className="text-xs text-muted-foreground">Total Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">{stats.notes}</div>
                  <div className="text-xs text-muted-foreground">Notes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{stats.events}</div>
                  <div className="text-xs text-muted-foreground">Events</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
