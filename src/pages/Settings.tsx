import { useState, useEffect } from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { User, Settings as SettingsIcon, Download, Upload, Moon, Sun, Palette } from 'lucide-react';
import { settingsStorage, profileStorage, createBackup, restoreBackup, UserProfile, AppSettings } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const [settings, setSettings] = useState<AppSettings>(settingsStorage.get());
  const [profile, setProfile] = useState<UserProfile>(profileStorage.get() || {
    name: '',
    email: '',
    avatar: '',
    bio: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    // Apply theme
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  const handleSettingsChange = (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    settingsStorage.set(newSettings);
    toast({
      title: 'Settings updated',
      description: 'Your preferences have been saved',
    });
  };

  const handleProfileChange = (updates: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    profileStorage.set(newProfile);
    toast({
      title: 'Profile updated',
      description: 'Your profile has been saved',
    });
  };

  const handleBackup = () => {
    createBackup();
    toast({
      title: 'Backup created',
      description: 'Your data has been exported',
    });
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await restoreBackup(file);
      toast({
        title: 'Backup restored',
        description: 'Your data has been restored successfully',
      });
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Restore failed',
        description: 'Could not restore backup. Please check the file.',
        variant: 'destructive',
      });
    }
  };

  const colorSchemes = [
    { name: 'Purple', value: 'purple', colors: 'from-purple-500 to-pink-500' },
    { name: 'Blue', value: 'blue', colors: 'from-blue-500 to-cyan-500' },
    { name: 'Green', value: 'green', colors: 'from-green-500 to-emerald-500' },
    { name: 'Pink', value: 'pink', colors: 'from-pink-500 to-rose-500' },
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">Manage your preferences and profile</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="glass">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="w-4 h-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <SettingsIcon className="w-4 h-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-secondary text-white">
                      {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Label htmlFor="avatar">Avatar URL</Label>
                    <Input
                      id="avatar"
                      placeholder="https://example.com/avatar.jpg"
                      value={profile.avatar}
                      onChange={(e) => handleProfileChange({ avatar: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={profile.name}
                      onChange={(e) => handleProfileChange({ name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={profile.email}
                      onChange={(e) => handleProfileChange({ email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      value={profile.bio}
                      onChange={(e) => handleProfileChange({ bio: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Choose your preferred theme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {settings.theme === 'dark' ? (
                      <Moon className="w-5 h-5 text-primary" />
                    ) : (
                      <Sun className="w-5 h-5 text-primary" />
                    )}
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-sm text-muted-foreground">Toggle between light and dark themes</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.theme === 'dark'}
                    onCheckedChange={(checked) => handleSettingsChange({ theme: checked ? 'dark' : 'light' })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle>Color Scheme</CardTitle>
                <CardDescription>Choose your preferred color palette</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {colorSchemes.map((scheme) => (
                    <button
                      key={scheme.value}
                      onClick={() => handleSettingsChange({ colorScheme: scheme.value as any })}
                      className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                        settings.colorScheme === scheme.value
                          ? 'border-primary shadow-lg'
                          : 'border-border'
                      }`}
                    >
                      <div className={`h-12 rounded-lg bg-gradient-to-r ${scheme.colors} mb-3`} />
                      <p className="font-medium">{scheme.name}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>App Preferences</CardTitle>
                <CardDescription>Configure how Zentry works for you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive push notifications</p>
                  </div>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(checked) => handleSettingsChange({ notifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-save</p>
                    <p className="text-sm text-muted-foreground">Automatically save your work</p>
                  </div>
                  <Switch
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => handleSettingsChange({ autoSave: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Backup and restore your data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleBackup} className="w-full gap-2" variant="outline">
                  <Download className="w-4 h-4" />
                  Export Backup
                </Button>
                <div>
                  <label htmlFor="restore-file">
                    <Button className="w-full gap-2" variant="outline" asChild>
                      <span>
                        <Upload className="w-4 h-4" />
                        Import Backup
                      </span>
                    </Button>
                  </label>
                  <input
                    id="restore-file"
                    type="file"
                    accept=".json"
                    onChange={handleRestore}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
