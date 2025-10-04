// Notification Management System
import { scheduleStorage, taskStorage, settingsStorage } from './storage';
import type { ScheduleEvent, Task } from './storage';

interface NotificationData {
  id: string;
  title: string;
  body: string;
  tag: string;
  data?: any;
  timestamp: number;
}

class NotificationManager {
  private permission: NotificationPermission = 'default';
  private checkInterval: number | null = null;
  private readonly CHECK_INTERVAL = 60000; // Check every minute
  private notifiedEvents: Set<string> = new Set();

  constructor() {
    this.permission = Notification.permission;
    this.loadNotifiedEvents();
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Check if notifications are enabled in settings
  private areNotificationsEnabled(): boolean {
    const settings = settingsStorage.get();
    return settings.notifications;
  }

  // Send a notification
  async sendNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.areNotificationsEnabled()) {
      console.log('Notifications disabled in settings');
      return;
    }

    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) {
        console.warn('Notification permission denied');
        return;
      }
    }

    try {
      const notificationOptions: NotificationOptions = {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options,
      };

      const notification = new Notification(title, notificationOptions);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Load previously notified events from localStorage
  private loadNotifiedEvents(): void {
    try {
      const stored = localStorage.getItem('notified_events');
      if (stored) {
        this.notifiedEvents = new Set(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading notified events:', error);
    }
  }

  // Save notified events to localStorage
  private saveNotifiedEvents(): void {
    try {
      localStorage.setItem('notified_events', JSON.stringify(Array.from(this.notifiedEvents)));
    } catch (error) {
      console.error('Error saving notified events:', error);
    }
  }

  // Mark an event as notified
  private markAsNotified(id: string): void {
    this.notifiedEvents.add(id);
    this.saveNotifiedEvents();
  }

  // Check if an event has been notified
  private hasBeenNotified(id: string): boolean {
    return this.notifiedEvents.has(id);
  }

  // Clean up old notified events (older than 24 hours)
  private cleanupNotifiedEvents(): void {
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;

    this.notifiedEvents.forEach(id => {
      // Extract timestamp from ID if it's timestamp-based
      const timestamp = parseInt(id);
      if (!isNaN(timestamp) && timestamp < dayAgo) {
        this.notifiedEvents.delete(id);
      }
    });

    this.saveNotifiedEvents();
  }

  // Check for upcoming events and tasks
  private checkUpcomingItems(): void {
    if (!this.areNotificationsEnabled()) {
      return;
    }

    const now = new Date();
    const nowTime = now.getTime();

    // Check schedule events
    const events = scheduleStorage.getAll();
    events.forEach(event => {
      if (this.hasBeenNotified(event.id)) {
        return;
      }

      const eventDate = new Date(event.date);
      const [hours, minutes] = event.startTime.split(':').map(Number);
      eventDate.setHours(hours, minutes, 0, 0);
      const eventTime = eventDate.getTime();

      // Notify 15 minutes before
      const fifteenMinutesBefore = eventTime - 15 * 60 * 1000;
      const fiveMinutesBefore = eventTime - 5 * 60 * 1000;

      if (nowTime >= fifteenMinutesBefore && nowTime < eventTime && !this.hasBeenNotified(`${event.id}-15min`)) {
        this.sendNotification('Upcoming Event', {
          body: `${event.title} starts in 15 minutes`,
          tag: `event-${event.id}-15`,
          data: { type: 'event', id: event.id },
        });
        this.markAsNotified(`${event.id}-15min`);
      } else if (nowTime >= fiveMinutesBefore && nowTime < eventTime && !this.hasBeenNotified(`${event.id}-5min`)) {
        this.sendNotification('Event Starting Soon!', {
          body: `${event.title} starts in 5 minutes`,
          tag: `event-${event.id}-5`,
          data: { type: 'event', id: event.id },
        });
        this.markAsNotified(`${event.id}-5min`);
      } else if (nowTime >= eventTime && nowTime < eventTime + 60000 && !this.hasBeenNotified(event.id)) {
        this.sendNotification('Event Now!', {
          body: `${event.title} is starting now`,
          tag: `event-${event.id}`,
          data: { type: 'event', id: event.id },
        });
        this.markAsNotified(event.id);
      }
    });

    // Check overdue tasks
    const tasks = taskStorage.getAll();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tasks.forEach(task => {
      if (task.completed || !task.dueDate || this.hasBeenNotified(`task-${task.id}-overdue`)) {
        return;
      }

      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      // Notify about overdue tasks once per day
      if (dueDate < today) {
        this.sendNotification('Overdue Task', {
          body: `${task.title} is overdue`,
          tag: `task-${task.id}-overdue`,
          data: { type: 'task', id: task.id },
        });
        this.markAsNotified(`task-${task.id}-overdue`);
      }
      // Notify about tasks due today
      else if (dueDate.getTime() === today.getTime() && !this.hasBeenNotified(`task-${task.id}-today`)) {
        this.sendNotification('Task Due Today', {
          body: `Don't forget: ${task.title}`,
          tag: `task-${task.id}-today`,
          data: { type: 'task', id: task.id },
        });
        this.markAsNotified(`task-${task.id}-today`);
      }
    });
  }

  // Start monitoring for reminders
  startMonitoring(): void {
    if (this.checkInterval) {
      return; // Already monitoring
    }

    // Initial check
    this.checkUpcomingItems();

    // Set up interval checking
    this.checkInterval = window.setInterval(() => {
      this.checkUpcomingItems();
      this.cleanupNotifiedEvents();
    }, this.CHECK_INTERVAL);

    console.log('Notification monitoring started');
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('Notification monitoring stopped');
    }
  }

  // Test notification
  async testNotification(): Promise<void> {
    await this.sendNotification('Zentry Notifications', {
      body: 'Notifications are working! You\'ll receive reminders for tasks and events.',
      tag: 'test-notification',
    });
  }

  // Reset notified events (useful for testing)
  resetNotifiedEvents(): void {
    this.notifiedEvents.clear();
    this.saveNotifiedEvents();
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager();

// Auto-start monitoring when module loads
if (typeof window !== 'undefined') {
  // Start monitoring after a short delay to ensure settings are loaded
  setTimeout(() => {
    notificationManager.startMonitoring();
  }, 1000);
}
