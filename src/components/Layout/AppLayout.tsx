import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckSquare, FileText, Calendar, Settings, LogOut, MessageSquare, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { toast } = useToast();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Navigation items for Tasks, Notes, Schedule only
  const navItems = [
    { icon: <CheckSquare className="w-5 h-5" />, label: 'Tasks', path: '/tasks' },
    { icon: <FileText className="w-5 h-5" />, label: 'Notes', path: '/notes' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Schedule', path: '/schedule' },
  ];

  // Drawer menu items for Dashboard, AI Chat, Settings
  const drawerItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard' },
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
    setIsDrawerOpen(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsDrawerOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 glass border-b backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo with Drawer */}
            <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <SheetTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="text-xl font-bold text-white">Z</span>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hidden sm:inline">
                    Zentry
                  </span>
                </div>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Zentry Menu
                  </SheetTitle>
                  <SheetDescription>
                    Navigate to different sections of the app
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-8 space-y-2">
                  {drawerItems.map((item) => (
                    <Button
                      key={item.path}
                      variant={isActive(item.path) ? 'default' : 'ghost'}
                      size="lg"
                      className={`w-full justify-start text-lg ${
                        isActive(item.path) ? 'bg-gradient-to-r from-primary to-secondary' : ''
                      }`}
                      onClick={() => handleNavigate(item.path)}
                    >
                      {item.icon}
                      <span className="ml-3">{item.label}</span>
                    </Button>
                  ))}
                  <div className="pt-4 mt-4 border-t">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full justify-start text-lg text-destructive hover:bg-destructive/10 border-destructive/20"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="ml-3">Logout</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop Navigation - Tasks, Notes, Schedule only */}
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
          </div>
        </div>
      </header>

      {/* Mobile Navigation - Below Header - Tasks, Notes, Schedule only */}
      <nav className="md:hidden sticky top-16 z-40 glass border-b backdrop-blur-lg mt-4">
        <div className="grid grid-cols-3 gap-1 p-2">
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

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
