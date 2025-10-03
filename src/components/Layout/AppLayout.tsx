import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckSquare, FileText, Calendar, Settings, LogOut, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { toast } = useToast();

  const navItems = [
    { icon: <CheckSquare className="w-5 h-5" />, label: 'Tasks', path: '/tasks' },
    { icon: <FileText className="w-5 h-5" />, label: 'Notes', path: '/notes' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Schedule', path: '/schedule' },
    { icon: <MessageSquare className="w-5 h-5" />, label: 'AI Chat', path: '/chat' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 glass border-b backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-xl font-bold text-white">Z</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hidden sm:inline">
                Zentry
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? 'default' : 'ghost'}
                  size="sm"
                  className={isActive(item.path) ? 'bg-gradient-to-r from-primary to-secondary' : ''}
                  onClick={() => navigate(item.path)}
                >
                  {item.icon}
                  <span className="ml-2 hidden lg:inline">{item.label}</span>
                </Button>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                className="text-destructive hover:bg-destructive/10 border-destructive/20 ml-2" 
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
                <span className="ml-2 hidden lg:inline">Logout</span>
              </Button>
            </nav>

            {/* Mobile Logout Button */}
            <div className="md:hidden flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10 border-destructive/20"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-4">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t backdrop-blur-lg">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? 'default' : 'ghost'}
              size="sm"
              className={`flex flex-col h-14 ${isActive(item.path) ? 'bg-gradient-to-r from-primary to-secondary' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
