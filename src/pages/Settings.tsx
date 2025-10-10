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
import { User, Settings as SettingsIcon, Download, Upload, Cloud, Trash2, AlertTriangle, Camera, X, Bell } from 'lucide-react';
import { settingsStorage, profileStorage, createBackup, restoreBackup, UserProfile, AppSettings } from '@/lib/storage';
import { supabaseProfileStorage, supabaseSettingsStorage } from '@/lib/supabaseStorage';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { notificationManager } from '@/lib/notifications';
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
    // Load profile and settings from Supabase on mount
    loadProfile();
    loadSettings();
  }, []);

  useEffect(() => {
    // Apply theme on mount and when settings change
    if (settings.theme && settings.theme !== 'strawberry-kiss') {
      document.documentElement.setAttribute('data-theme', settings.theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [settings.theme]);

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

  const handleSettingsChange = async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    settingsStorage.set(newSettings);
    
    // Handle notification permission if notifications are being enabled
    if (updates.notifications === true) {
      const granted = await notificationManager.requestPermission();
      if (!granted) {
        // Revert the setting if permission denied
        const revertedSettings = { ...newSettings, notifications: false };
        setSettings(revertedSettings);
        settingsStorage.set(revertedSettings);
        toast({
          title: 'Permission Denied',
          description: 'Please enable notifications in your browser settings',
          variant: 'destructive',
        });
        return;
      }
    }
    
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

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage your preferences and profile</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
          <TabsList className="glass w-full sm:w-auto">
            <TabsTrigger value="profile" className="gap-1 sm:gap-2 flex-1 sm:flex-initial">
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-1 sm:gap-2 flex-1 sm:flex-initial">
              <SettingsIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Preferences</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4 sm:space-y-6">
            <Card className="glass">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
                <CardDescription className="text-sm">Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <div className="relative group">
                    <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-primary/20">
                      <AvatarImage src={profile.avatar} />
                      <AvatarFallback className="text-2xl sm:text-4xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                        {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {profile.avatar && (
                      <button
                        onClick={handleRemoveAvatar}
                        className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-7 h-7 sm:w-8 sm:h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110"
                        title="Remove photo"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 space-y-3 text-center sm:text-left">
                    <div>
                      <Label className="text-sm sm:text-base font-semibold">Profile Photo</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Upload a photo to personalize your profile
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-2 w-full sm:w-auto"
                        size="sm"
                      >
                        <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">{profile.avatar ? 'Change Photo' : 'Upload Photo'}</span>
                      </Button>
                      {profile.avatar && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleRemoveAvatar}
                          className="gap-2 text-destructive hover:text-destructive w-full sm:w-auto"
                          size="sm"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm">Remove</span>
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
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
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
                      value={profile.name || ''}
                      onChange={(e) => handleProfileChange({ name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={profile.email || ''}
                      onChange={(e) => handleProfileChange({ email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      value={profile.bio || ''}
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

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4 sm:space-y-6">
            {/* Theme Selector */}
            <Card className="glass">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Theme</CardTitle>
                <CardDescription className="text-sm">Choose your preferred color theme</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Strawberry Kiss */}
                  <button
                    onClick={() => {
                      handleSettingsChange({ theme: 'strawberry-kiss' });
                      document.documentElement.removeAttribute('data-theme');
                      toast({
                        title: 'Theme changed',
                        description: '🍓 Strawberry Kiss theme applied',
                      });
                    }}
                    className={`group relative p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                      settings.theme === 'strawberry-kiss' 
                        ? 'border-primary ring-2 ring-primary/20 shadow-lg' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#b9908d] to-[#d7b3ad] shadow-md" />
                      <div className="text-left flex-1">
                        <p className="font-semibold text-sm">Strawberry Kiss</p>
                        <p className="text-xs text-muted-foreground">Soft pink & mauve</p>
                      </div>
                      {settings.theme === 'strawberry-kiss' && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div className="h-2 flex-1 rounded-full bg-[#f5e0e2]" />
                      <div className="h-2 flex-1 rounded-full bg-[#e8cdc7]" />
                      <div className="h-2 flex-1 rounded-full bg-[#b9908d]" />
                      <div className="h-2 flex-1 rounded-full bg-[#8b6a69]" />
                    </div>
                  </button>

                  {/* Deep Matcha */}
                  <button
                    onClick={() => {
                      handleSettingsChange({ theme: 'deep-matcha' });
                      document.documentElement.setAttribute('data-theme', 'deep-matcha');
                      toast({
                        title: 'Theme changed',
                        description: '🍵 Deep Matcha theme applied',
                      });
                    }}
                    className={`group relative p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                      settings.theme === 'deep-matcha' 
                        ? 'border-[#5f7f3d] ring-2 ring-[#5f7f3d]/20 shadow-lg' 
                        : 'border-border hover:border-[#5f7f3d]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#5f7f3d] to-[#3d5526] shadow-md" />
                      <div className="text-left flex-1">
                        <p className="font-semibold text-sm">Deep Matcha</p>
                        <p className="text-xs text-muted-foreground">Rich green tones</p>
                      </div>
                      {settings.theme === 'deep-matcha' && (
                        <div className="w-6 h-6 rounded-full bg-[#5f7f3d] flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div className="h-2 flex-1 rounded-full bg-[#e8efe2]" />
                      <div className="h-2 flex-1 rounded-full bg-[#94aa6e]" />
                      <div className="h-2 flex-1 rounded-full bg-[#5f7f3d]" />
                      <div className="h-2 flex-1 rounded-full bg-[#3d5526]" />
                    </div>
                  </button>

                  {/* Pink Latte */}
                  <button
                    onClick={() => {
                      handleSettingsChange({ theme: 'pink-latte' });
                      document.documentElement.setAttribute('data-theme', 'pink-latte');
                      toast({
                        title: 'Theme changed',
                        description: '☕ Pink Latte theme applied',
                      });
                    }}
                    className={`group relative p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                      settings.theme === 'pink-latte' 
                        ? 'border-[#f0dde5] ring-2 ring-[#f0dde5]/20 shadow-lg' 
                        : 'border-border hover:border-[#f0dde5]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#f0dde5] to-[#fbe9f3] shadow-md" />
                      <div className="text-left flex-1">
                        <p className="font-semibold text-sm">Pink Latte</p>
                        <p className="text-xs text-muted-foreground">Soft pink blend</p>
                      </div>
                      {settings.theme === 'pink-latte' && (
                        <div className="w-6 h-6 rounded-full bg-[#f0dde5] flex items-center justify-center">
                          <svg className="w-4 h-4 text-[#7d5a66]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div className="h-2 flex-1 rounded-full bg-[#fae4e2]" />
                      <div className="h-2 flex-1 rounded-full bg-[#fdde5]" />
                      <div className="h-2 flex-1 rounded-full bg-[#f0dde5]" />
                      <div className="h-2 flex-1 rounded-full bg-[#fbe9f3]" />
                    </div>
                  </button>

                  {/* Midnight Sky */}
                  <button
                    onClick={() => {
                      handleSettingsChange({ theme: 'midnight-sky' });
                      document.documentElement.setAttribute('data-theme', 'midnight-sky');
                      toast({
                        title: 'Theme changed',
                        description: '🌙 Midnight Sky theme applied',
                      });
                    }}
                    className={`group relative p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                      settings.theme === 'midnight-sky' 
                        ? 'border-[#4e6188] ring-2 ring-[#4e6188]/20 shadow-lg' 
                        : 'border-border hover:border-[#4e6188]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#4e6188] to-[#3a405b] shadow-md" />
                      <div className="text-left flex-1">
                        <p className="font-semibold text-sm">Midnight Sky</p>
                        <p className="text-xs text-muted-foreground">Deep blue hues</p>
                      </div>
                      {settings.theme === 'midnight-sky' && (
                        <div className="w-6 h-6 rounded-full bg-[#4e6188] flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div className="h-2 flex-1 rounded-full bg-[#c0c6de]" />
                      <div className="h-2 flex-1 rounded-full bg-[#7589a2]" />
                      <div className="h-2 flex-1 rounded-full bg-[#4e6188]" />
                      <div className="h-2 flex-1 rounded-full bg-[#3a405b]" />
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">App Preferences</CardTitle>
                <CardDescription className="text-sm">Configure how Zentry works for you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                <div className="p-3 sm:p-4 rounded-lg hover:bg-accent/50 transition-colors space-y-3">
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base">Notifications</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Receive push notifications for tasks and events</p>
                    </div>
                    <Switch
                      checked={settings.notifications}
                      onCheckedChange={(checked) => handleSettingsChange({ notifications: checked })}
                      className="flex-shrink-0"
                    />
                  </div>
                  {settings.notifications && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={async () => {
                        await notificationManager.testNotification();
                        toast({
                          title: 'Test sent',
                          description: 'Check if you received the notification',
                        });
                      }}
                    >
                      <Bell className="w-4 h-4" />
                      Test Notification
                    </Button>
                  )}
                </div>
                <div className="flex items-start sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base">Auto-save</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Automatically save your work to the cloud</p>
                  </div>
                  <Switch
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => handleSettingsChange({ autoSave: checked })}
                    className="flex-shrink-0"
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

            <Card className="glass border-destructive/50">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-destructive flex items-center gap-2 text-base sm:text-lg">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Danger Zone</span>
                </CardTitle>
                <CardDescription className="text-sm">Permanently delete your account and all data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
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
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and all data.
                      </AlertDialogDescription>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p className="font-semibold">This will permanently:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Delete your account</li>
                          <li>Remove all your tasks, notes, and schedules</li>
                          <li>Erase your PIN and login credentials</li>
                          <li>Clear all local and cloud data</li>
                        </ul>
                        <p className="text-destructive font-medium mt-4">Type "DELETE" to confirm:</p>
                      </div>
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
