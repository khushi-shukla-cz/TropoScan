
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
    console.log('🔔 Initializing NotificationService...');
    console.log('📋 Browser supports notifications:', 'Notification' in window);
    console.log('📋 Browser supports service workers:', 'serviceWorker' in navigator);
    
    this.checkPermission();
    this.initializeServiceWorker();
    this.loadSettings();
    
    console.log('✅ NotificationService initialized');
    console.log('📋 Current permission:', this.permission);
    console.log('📋 Current settings:', this.settings);
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
        console.log('⚙️ Registering service worker...');
        // Use the correct path for Vite dev server
        const swPath = import.meta.env.DEV ? '/sw.js' : '/sw.js';
        this.serviceWorkerRegistration = await navigator.serviceWorker.register(swPath);
        console.log('✅ Service Worker registered successfully:', this.serviceWorkerRegistration);
      } catch (error) {
        console.warn('❌ Service Worker registration failed:', error);
        console.log('🔄 Continuing without Service Worker - regular notifications will still work');
      }
    } else {
      console.warn('❌ Service Worker not supported in this browser');
    }
  }

  private checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('❌ This browser does not support notifications');
      return false;
    }

    console.log('🔔 Current notification permission:', this.permission);

    if (this.permission === 'granted') {
      console.log('✅ Notification permission already granted');
      return true;
    }

    if (this.permission === 'denied') {
      console.warn('❌ Notification permission was denied. Please enable in browser settings.');
      return false;
    }

    try {
      console.log('📝 Requesting notification permission...');
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      console.log('📋 Permission result:', permission);
      
      if (permission === 'granted') {
        console.log('✅ Notifications enabled - including background notifications');
        
        // Send a test notification to confirm it works (with a slight delay)
        setTimeout(() => {
          console.log('🧪 Sending welcome test notification...');
          this.sendNotification({
            title: '🎉 Notifications Enabled - TropoScan',
            body: 'You will now receive risk alerts for tropical storm detection. This is a test notification.',
            requireInteraction: false,
            vibrate: [200, 100, 200],
            tag: 'troposcam-welcome-test'
          });
        }, 1000);
        
        return true;
      } else {
        console.warn('❌ Notification permission denied by user');
        return false;
      }
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      return false;
    }
  }

  async sendNotification(options: NotificationOptions): Promise<void> {
    console.log('🔔 Attempting to send notification:', options.title);
    
    const hasPermission = await this.requestPermission();
    
    if (!hasPermission) {
      console.warn('❌ Notification permission denied - cannot send notification');
      return;
    }

    console.log('✅ Permission granted, sending notification...');

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

    console.log('📋 Notification options:', notificationOptions);

    // Try service worker notification first, then fallback to regular notification
    try {
      if (this.serviceWorkerRegistration && this.settings.backgroundNotifications) {
        console.log('📱 Sending persistent notification via Service Worker...');
        await this.serviceWorkerRegistration.showNotification(options.title, notificationOptions);
        console.log('✅ Persistent notification sent successfully');
      } else {
        console.log('📱 Sending regular notification...');
        this.showRegularNotification(options.title, notificationOptions);
        console.log('✅ Regular notification sent successfully');
      }
    } catch (error) {
      console.error('❌ Failed to show notification:', error);
      // Fallback to regular notification
      console.log('🔄 Falling back to regular notification...');
      this.showRegularNotification(options.title, notificationOptions);
    }
  }

  private showRegularNotification(title: string, options: any) {
    try {
      console.log('📱 Creating regular notification:', title);
      const notification = new Notification(title, options);

      console.log('✅ Regular notification created successfully');

      // Auto-close after 10 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
          console.log('🔄 Auto-closed notification after 10 seconds');
        }, 10000);
      }

      // Handle notification clicks
      notification.onclick = () => {
        console.log('👆 Notification clicked');
        window.focus();
        notification.close();
      };

      // Handle notification errors
      notification.onerror = (error) => {
        console.error('❌ Notification error:', error);
      };

      notification.onshow = () => {
        console.log('✅ Notification displayed successfully');
      };

    } catch (error) {
      console.error('❌ Failed to create regular notification:', error);
    }
  }

  sendRiskAlert(riskLevel: 'low' | 'moderate' | 'high', details: string): void {
    console.log(`🚨 Sending risk alert: ${riskLevel.toUpperCase()}`);
    
    // Check if this risk level is enabled
    const riskSettings = {
      low: this.settings.lowRisk,
      moderate: this.settings.moderateRisk,
      high: this.settings.highRisk
    };

    if (!riskSettings[riskLevel]) {
      console.log(`❌ Notification for ${riskLevel} risk is disabled in settings`);
      return;
    }

    console.log(`✅ ${riskLevel} risk notifications are enabled`);

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
    console.log(`📋 Sending ${riskLevel} risk notification:`, config.title);
    
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
    console.log('🧪 Sending test notification...');
    const testDetails = "This is a test notification to verify your alert settings are working correctly.";
    this.sendRiskAlert(riskLevel, testDetails);
  }

  // Send immediate desktop notification (bypasses all settings for testing)
  async sendImmediateTestNotification(): Promise<boolean> {
    console.log('🚀 Sending immediate test notification...');
    
    // Force permission request if needed
    if (Notification.permission !== 'granted') {
      console.log('📝 Requesting permission...');
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.error('❌ Permission denied');
        return false;
      }
    }

    try {
      console.log('✅ Creating desktop notification...');
      const notification = new Notification('🎉 Test Notification - TropoScan', {
        body: '🔔 This is a test desktop notification! If you can see this popup, notifications are working correctly.',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-notification',
        requireInteraction: false,
        silent: false
      });

      notification.onshow = () => {
        console.log('✅ Desktop notification displayed successfully!');
      };

      notification.onclick = () => {
        console.log('👆 Notification clicked');
        window.focus();
        notification.close();
      };

      notification.onerror = (error) => {
        console.error('❌ Notification error:', error);
      };

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
        console.log('🔄 Test notification auto-closed');
      }, 5000);

      return true;
    } catch (error) {
      console.error('❌ Failed to create test notification:', error);
      return false;
    }
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
