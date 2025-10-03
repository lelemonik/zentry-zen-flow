import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { User, Settings as SettingsIcon, Download, Upload, Palette, Cloud, Trash2, AlertTriangle, Camera, X } from 'lucide-react';
import { settingsStorage, profileStorage, createBackup, restoreBackup, UserProfile, AppSettings } from '@/lib/storage';
import { supabaseProfileStorage, supabaseSettingsStorage } from '@/lib/supabaseStorage';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const navigate = useNavigate();
  const { deleteAccount } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(settingsStorage.get());
  const [profile, setProfile] = useState<UserProfile>(profileStorage.get() || {
    name: '',
    email: '',
    avatar: '',
    bio: '',
  });
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Apply color scheme by updating CSS variables
    applyColorScheme(settings.colorScheme);
    
    // Load profile and settings from Supabase on mount
    loadProfile();
    loadSettings();
  }, [settings.colorScheme]);

  const applyColorScheme = (scheme: string) => {
    const root = document.documentElement;
    
    // Remove all color scheme classes
    root.classList.remove('color-purple', 'color-blue', 'color-green', 'color-pink');
    
    // Add the selected color scheme class
    root.classList.add(`color-${scheme}`);
    
    // Define color schemes (HSL values for CSS variables)
    const schemes = {
      purple: {
        primary: '262 83% 58%', // Purple
        secondary: '330 81% 60%', // Pink
      },
      blue: {
        primary: '199 89% 48%', // Blue
        secondary: '189 85% 51%', // Cyan
      },
      green: {
        primary: '142 76% 36%', // Green
        secondary: '158 64% 52%', // Emerald
      },
      pink: {
        primary: '330 81% 60%', // Pink
        secondary: '346 77% 50%', // Rose
      },
    };

    const colors = schemes[scheme as keyof typeof schemes];
    if (colors) {
      root.style.setProperty('--primary', colors.primary);
      root.style.setProperty('--secondary', colors.secondary);
    }
  };

  const loadProfile = async () => {
    try {
      const supabaseProfile = await supabaseProfileStorage.get();
      if (supabaseProfile) {
        setProfile(supabaseProfile);
        profileStorage.set(supabaseProfile);
      }
    } catch (error) {
      console.error('Error loading profile from Supabase:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const supabaseSettings = await supabaseSettingsStorage.get();
      if (supabaseSettings) {
        setSettings(supabaseSettings);
        settingsStorage.set(supabaseSettings);
      }
    } catch (error) {
      console.error('Error loading settings from Supabase:', error);
    }
  };

  const handleSettingsChange = (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    settingsStorage.set(newSettings);
    // Auto-save to cloud immediately for settings
    saveSettingsToCloud(newSettings);
  };

  const saveSettingsToCloud = async (settingsToSave?: AppSettings) => {
    const settingsData = settingsToSave || settings;
    try {
      await supabaseSettingsStorage.set(settingsData);
      toast({
        title: 'Settings updated',
        description: '✅ Saved to cloud',
      });
    } catch (error) {
      console.error('Error saving settings to Supabase:', error);
      toast({
        title: 'Settings saved locally',
        description: '⚠️ Cloud sync failed',
        variant: 'destructive',
      });
    }
  };

  // Immediate state update (no async)
  const handleProfileChange = (updates: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    profileStorage.set(newProfile);
  };

  // Separate function to save to Supabase (call this on blur or button click)
  const saveProfileToCloud = async () => {
    try {
      await supabaseProfileStorage.set(profile);
      toast({
        title: 'Profile updated',
        description: '✅ Saved to cloud',
      });
    } catch (error) {
      console.error('Error saving profile to Supabase:', error);
      toast({
        title: 'Profile saved locally',
        description: '⚠️ Cloud sync failed',
        variant: 'destructive',
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        handleProfileChange({ avatar: base64String });
        toast({
          title: 'Photo uploaded',
          description: 'Don\'t forget to save to cloud',
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Could not process the image',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveAvatar = () => {
    handleProfileChange({ avatar: '' });
    toast({
      title: 'Photo removed',
      description: 'Your profile photo has been removed',
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

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      toast({
        title: 'Account Deleted',
        description: 'Your account and all data have been permanently deleted',
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: 'Delete Failed',
        description: error.message || 'Could not delete account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
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
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative group">
                    <Avatar className="w-32 h-32 border-4 border-primary/20">
                      <AvatarImage src={profile.avatar} />
                      <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-secondary text-white">
                        {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {profile.avatar && (
                      <button
                        onClick={handleRemoveAvatar}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110"
                        title="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label className="text-base font-semibold">Profile Photo</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload a photo to personalize your profile
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        {profile.avatar ? 'Change Photo' : 'Upload Photo'}
                      </Button>
                      {profile.avatar && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleRemoveAvatar}
                          className="gap-2 text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                          Remove
                        </Button>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended: Square image, max 5MB (JPG, PNG, GIF)
                    </p>
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
                
                <Button 
                  onClick={saveProfileToCloud}
                  className="w-full"
                >
                  <Cloud className="w-4 h-4 mr-2" />
                  Save to Cloud
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Color Scheme
                </CardTitle>
                <CardDescription>Choose your preferred color palette for the app</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {colorSchemes.map((scheme) => (
                    <button
                      key={scheme.value}
                      onClick={() => handleSettingsChange({ colorScheme: scheme.value as any })}
                      className={`group relative p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                        settings.colorScheme === scheme.value
                          ? 'border-primary shadow-lg ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className={`h-12 rounded-lg bg-gradient-to-r ${scheme.colors} mb-3 shadow-md`} />
                      <p className="font-medium">{scheme.name}</p>
                      {settings.colorScheme === scheme.value && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Current: <span className="font-semibold text-primary capitalize">{settings.colorScheme}</span>
                </p>
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
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <div>
                    <p className="font-medium">Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive push notifications for tasks and events</p>
                  </div>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(checked) => handleSettingsChange({ notifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <div>
                    <p className="font-medium">Auto-save</p>
                    <p className="text-sm text-muted-foreground">Automatically save your work to the cloud</p>
                  </div>
                  <Switch
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => handleSettingsChange({ autoSave: checked })}
                  />
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">
                    {settings.autoSave 
                      ? '✅ Changes are automatically synced to cloud' 
                      : '⚠️ Remember to manually save your work'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {settings.notifications 
                      ? '🔔 You will receive notifications' 
                      : '🔕 Notifications are disabled'}
                  </p>
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

            <Card className="glass border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>Permanently delete your account and all data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive font-medium mb-2">⚠️ Warning: This action cannot be undone!</p>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Your account will be permanently deleted</li>
                    <li>All your tasks, notes, and schedules will be erased</li>
                    <li>Your PIN and login credentials will be removed</li>
                    <li>You will need to create a new account to use the app again</li>
                  </ul>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      className="w-full gap-2" 
                      variant="destructive"
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-4 h-4" />
                      {isDeleting ? 'Deleting Account...' : 'Delete Account Permanently'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-5 h-5" />
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <p className="font-semibold">This action cannot be undone. This will permanently:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Delete your account</li>
                          <li>Remove all your tasks, notes, and schedules</li>
                          <li>Erase your PIN and login credentials</li>
                          <li>Clear all local and cloud data</li>
                        </ul>
                        <p className="text-destructive font-medium mt-4">Type "DELETE" to confirm:</p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input 
                      id="delete-confirm"
                      placeholder="Type DELETE to confirm"
                      className="mt-2"
                    />
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          const input = document.getElementById('delete-confirm') as HTMLInputElement;
                          if (input?.value === 'DELETE') {
                            handleDeleteAccount();
                          } else {
                            e.preventDefault();
                            toast({
                              title: 'Confirmation Required',
                              description: 'Please type DELETE to confirm account deletion',
                              variant: 'destructive',
                            });
                          }
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Account Forever
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
