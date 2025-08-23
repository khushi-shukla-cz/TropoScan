
export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  vibrate?: number[];
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  data?: any;
}

export interface NotificationSettings {
  highRisk: boolean;
  moderateRisk: boolean;
  lowRisk: boolean;
  backgroundNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface BrowserInfo {
  name: string;
  version: string;
  supportsNotifications: boolean;
  supportsServiceWorkers: boolean;
  supportsPWA: boolean;
}

export interface NotificationStatus {
  permission: NotificationPermission;
  isBlocked: boolean;
  canRequest: boolean;
  browserInfo: BrowserInfo;
  settingsUrl?: string;
}

class NotificationService {
  private permission: NotificationPermission = 'default';
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private settings: NotificationSettings;

  constructor() {
    this.checkPermission();
    this.initializeServiceWorker();
    this.loadSettings();
  }

  private loadSettings() {
    const savedSettings = localStorage.getItem('troposcam-notification-settings');
    this.settings = savedSettings ? JSON.parse(savedSettings) : {
      highRisk: true,
      moderateRisk: true,
      lowRisk: true,
      backgroundNotifications: true,
      soundEnabled: true,
      vibrationEnabled: true
    };
  }

  public updateSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem('troposcam-notification-settings', JSON.stringify(this.settings));
  }

  public getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  private async initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }
    }
  }

  private checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      // Also request persistent notification permission
      if (permission === 'granted' && this.serviceWorkerRegistration) {
        console.log('✅ Notifications enabled - including background notifications');
      }
      
      return permission === 'granted';
    }

    return false;
  }

  async sendNotification(options: NotificationOptions): Promise<void> {
    const hasPermission = await this.requestPermission();
    
    if (!hasPermission) {
      console.warn('Notification permission denied');
      return;
    }

    // Enhanced notification with vibration and sound
    const notificationOptions = {
      body: options.body,
      icon: options.icon || '/favicon.ico',
      badge: options.badge || '/favicon.ico',
      tag: options.tag || 'troposcam-alert',
      requireInteraction: options.requireInteraction || false,
      vibrate: this.settings.vibrationEnabled ? (options.vibrate || [200, 100, 200]) : undefined,
      actions: options.actions || [
        {
          action: 'view',
          title: 'View Details',
          icon: '/favicon.ico'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/favicon.ico'
        }
      ],
      data: options.data,
      silent: !this.settings.soundEnabled
    };

    // Use Service Worker for persistent notifications if available
    if (this.serviceWorkerRegistration && this.settings.backgroundNotifications) {
      try {
        await this.serviceWorkerRegistration.showNotification(options.title, notificationOptions);
        console.log('📱 Persistent notification sent');
      } catch (error) {
        console.warn('Failed to show persistent notification:', error);
        // Fallback to regular notification
        this.showRegularNotification(options.title, notificationOptions);
      }
    } else {
      this.showRegularNotification(options.title, notificationOptions);
    }
  }

  private showRegularNotification(title: string, options: any) {
    const notification = new Notification(title, options);

    // Auto-close after 10 seconds unless requireInteraction is true
    if (!options.requireInteraction) {
      setTimeout(() => notification.close(), 10000);
    }

    // Handle notification clicks
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  sendRiskAlert(riskLevel: 'low' | 'moderate' | 'high', details: string): void {
    // Check if this risk level is enabled
    const riskSettings = {
      low: this.settings.lowRisk,
      moderate: this.settings.moderateRisk,
      high: this.settings.highRisk
    };

    if (!riskSettings[riskLevel]) {
      console.log(`Notification for ${riskLevel} risk is disabled`);
      return;
    }

    const alertConfigs = {
      high: {
        title: '🚨 CRITICAL ALERT - TropoScan',
        body: `⚠ HIGH RISK: Tropical storm formation detected!\n${details}\n🚨 Immediate action recommended!`,
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200, 100, 200],
        data: { riskLevel: 'high', timestamp: new Date().toISOString() }
      },
      moderate: {
        title: '⚠ MODERATE RISK - TropoScan',
        body: `🌩 Developing weather system detected.\n${details}\n📊 Monitor closely for updates.`,
        requireInteraction: false,
        vibrate: [200, 100, 200],
        data: { riskLevel: 'moderate', timestamp: new Date().toISOString() }
      },
      low: {
        title: '✅ LOW RISK - TropoScan',
        body: `🌤 Normal conditions observed.\n${details}\n✅ No immediate threat detected.`,
        requireInteraction: false,
        vibrate: [100],
        data: { riskLevel: 'low', timestamp: new Date().toISOString() }
      }
    };

    const config = alertConfigs[riskLevel];
    this.sendNotification({
      ...config,
      tag: `troposcam-${riskLevel}-risk-${Date.now()}`,
    });

    // Store notification history
    this.storeNotificationHistory(riskLevel, details);
  }

  private storeNotificationHistory(riskLevel: string, details: string) {
    const history = JSON.parse(localStorage.getItem('troposcam-notification-history') || '[]');
    history.unshift({
      riskLevel,
      details,
      timestamp: new Date().toISOString(),
      id: Date.now()
    });
    
    // Keep only last 50 notifications
    if (history.length > 50) {
      history.splice(50);
    }
    
    localStorage.setItem('troposcam-notification-history', JSON.stringify(history));
  }

  getNotificationHistory() {
    return JSON.parse(localStorage.getItem('troposcam-notification-history') || '[]');
  }

  // Send test notification
  sendTestNotification(riskLevel: 'low' | 'moderate' | 'high' = 'moderate') {
    const testDetails = "This is a test notification to verify your alert settings are working correctly.";
    this.sendRiskAlert(riskLevel, testDetails);
  }

  // Check if notifications are properly configured
  isFullyConfigured(): boolean {
    return this.permission === 'granted' && 
           (this.settings.highRisk || this.settings.moderateRisk || this.settings.lowRisk);
  }

  // Get comprehensive browser information
  getBrowserInfo(): BrowserInfo {
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    let version = 'Unknown';

    // Detect browser
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      browserName = 'Chrome';
      const match = userAgent.match(/Chrome\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Firefox')) {
      browserName = 'Firefox';
      const match = userAgent.match(/Firefox\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browserName = 'Safari';
      const match = userAgent.match(/Version\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Edg')) {
      browserName = 'Edge';
      const match = userAgent.match(/Edg\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    }

    return {
      name: browserName,
      version: version,
      supportsNotifications: 'Notification' in window,
      supportsServiceWorkers: 'serviceWorker' in navigator,
      supportsPWA: 'serviceWorker' in navigator && 'PushManager' in window
    };
  }

  // Get detailed notification status
  getNotificationStatus(): NotificationStatus {
    const browserInfo = this.getBrowserInfo();
    const permission = Notification.permission;
    
    return {
      permission,
      isBlocked: permission === 'denied',
      canRequest: permission === 'default',
      browserInfo,
      settingsUrl: this.getBrowserSettingsUrl(browserInfo.name)
    };
  }

  // Get browser-specific settings URL
  private getBrowserSettingsUrl(browserName: string): string | undefined {
    const urls = {
      'Chrome': 'chrome://settings/content/notifications',
      'Firefox': 'about:preferences#privacy',
      'Safari': 'System Preferences > Notifications',
      'Edge': 'edge://settings/content/notifications'
    };
    
    return urls[browserName as keyof typeof urls];
  }

  // Open browser notification settings
  openBrowserSettings(): boolean {
    const status = this.getNotificationStatus();
    
    if (status.settingsUrl && (status.settingsUrl.startsWith('chrome://') || status.settingsUrl?.startsWith('edge://'))) {
      try {
        window.open(status.settingsUrl, '_blank');
        return true;
      } catch (error) {
        console.warn('Cannot open browser settings directly:', error);
        return false;
      }
    }
    
    return false;
  }

  // Get instructions for enabling notifications
  getNotificationInstructions(): string[] {
    const browserInfo = this.getBrowserInfo();
    const permission = Notification.permission;
    
    if (permission === 'granted') {
      return ['✅ Notifications are already enabled!'];
    }
    
    if (permission === 'denied') {
      switch (browserInfo.name) {
        case 'Chrome':
          return [
            '1. Click the lock/site info icon in the address bar',
            '2. Find "Notifications" and select "Allow"',
            '3. Refresh the page',
            '4. Or go to chrome://settings/content/notifications'
          ];
        case 'Firefox':
          return [
            '1. Click the shield icon in the address bar',
            '2. Click on "Blocked" next to notifications',
            '3. Select "Allow" and refresh the page',
            '4. Or go to about:preferences#privacy'
          ];
        case 'Safari':
          return [
            '1. Go to Safari > Preferences > Websites',
            '2. Click on "Notifications" in the left sidebar',
            '3. Find this website and select "Allow"',
            '4. Refresh the page'
          ];
        case 'Edge':
          return [
            '1. Click the lock icon in the address bar',
            '2. Find "Notifications" and select "Allow"',
            '3. Refresh the page',
            '4. Or go to edge://settings/content/notifications'
          ];
        default:
          return [
            '1. Look for a notification icon in your address bar',
            '2. Click it and select "Allow notifications"',
            '3. Refresh the page if needed',
            '4. Check your browser settings if the option is not available'
          ];
      }
    }
    
    return ['Click "Enable Notifications" button above to get started'];
  }

  // Check if notification settings need configuration
  needsConfiguration(): boolean {
    const status = this.getNotificationStatus();
    return !status.browserInfo.supportsNotifications || 
           status.permission !== 'granted' || 
           !this.isFullyConfigured();
  }

  // Get configuration issues
  getConfigurationIssues(): string[] {
    const issues: string[] = [];
    const status = this.getNotificationStatus();
    
    if (!status.browserInfo.supportsNotifications) {
      issues.push('Your browser does not support notifications');
    }
    
    if (status.permission === 'denied') {
      issues.push('Notifications are blocked - please enable in browser settings');
    }
    
    if (status.permission === 'default') {
      issues.push('Notifications permission not requested yet');
    }
    
    if (!status.browserInfo.supportsServiceWorkers) {
      issues.push('Background notifications not supported in this browser');
    }
    
    if (!this.settings.highRisk && !this.settings.moderateRisk && !this.settings.lowRisk) {
      issues.push('No alert types are enabled');
    }
    
    return issues;
  }
}

export const notificationService = new NotificationService();
