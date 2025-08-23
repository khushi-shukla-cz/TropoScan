import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bell, 
  BellOff, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info,
  Smartphone,
  Volume2,
  VolumeX,
  Vibrate,
  Clock,
  Shield,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { notificationService, NotificationSettings, NotificationStatus } from '@/services/notificationService';
import EmergencyNavbar from '@/components/EmergencyNavbar';

interface NotificationHistoryItem {
  id: number;
  riskLevel: string;
  details: string;
  timestamp: string;
}

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<NotificationSettings>(notificationService.getSettings());
  const [status, setStatus] = useState<NotificationStatus>(notificationService.getNotificationStatus());
  const [history, setHistory] = useState<NotificationHistoryItem[]>(notificationService.getNotificationHistory());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Refresh status when component mounts
    setStatus(notificationService.getNotificationStatus());
    setHistory(notificationService.getNotificationHistory());
  }, []);

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    notificationService.updateSettings(newSettings);
    
    toast({
      title: "Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const requestPermission = async () => {
    setIsLoading(true);
    try {
      const granted = await notificationService.requestPermission();
      if (granted) {
        setStatus(notificationService.getNotificationStatus());
        toast({
          title: "Notifications Enabled! 🎉",
          description: "You'll now receive TropoScan weather alerts.",
        });
      } else {
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request notification permission.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openBrowserSettings = () => {
    const opened = notificationService.openBrowserSettings();
    if (!opened) {
      toast({
        title: "Manual Setup Required",
        description: "Please check your browser's notification settings manually."
      });
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('troposcam-notification-history');
    setHistory([]);
    toast({
      title: "History Cleared",
      description: "Notification history has been cleared.",
    });
  };

  const getPermissionBadge = () => {
    switch (status.permission) {
      case 'granted':
        return <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">✅ Enabled</Badge>;
      case 'denied':
        return <Badge variant="destructive">❌ Blocked</Badge>;
      default:
        return <Badge variant="outline">⏳ Not Set</Badge>;
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'moderate': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/10 border-green-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const issues = notificationService.getConfigurationIssues();
  const instructions = notificationService.getNotificationInstructions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <EmergencyNavbar currentPage="alerts" />
      
      <div className="container mx-auto max-w-4xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Bell className="mr-3 h-8 w-8 text-blue-400" />
                Notification Settings
              </h1>
              <p className="text-gray-300">Configure your TropoScan weather alerts and preferences</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Permission Status */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Permission Status
                  </span>
                  {getPermissionBadge()}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Browser Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-300">Browser</div>
                    <div className="text-white font-mono">{status.browserInfo.name} {status.browserInfo.version}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-300">Features</div>
                    <div className="flex flex-wrap gap-2">
                      {status.browserInfo.supportsNotifications && (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-400">Notifications</Badge>
                      )}
                      {status.browserInfo.supportsServiceWorkers && (
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-400">Background</Badge>
                      )}
                      {status.browserInfo.supportsPWA && (
                        <Badge variant="secondary" className="bg-purple-500/10 text-purple-400">PWA</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Configuration Issues */}
                {issues.length > 0 && (
                  <Alert className="border-yellow-500/20 bg-yellow-500/10">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <AlertDescription className="text-yellow-200">
                      <div className="font-semibold mb-2">Configuration Issues:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {issues.map((issue, index) => (
                          <li key={index} className="text-sm">{issue}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Setup Instructions */}
                {status.permission !== 'granted' && (
                  <Alert className="border-blue-500/20 bg-blue-500/10">
                    <Info className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-blue-200">
                      <div className="font-semibold mb-2">Setup Instructions:</div>
                      <ol className="list-decimal list-inside space-y-1">
                        {instructions.map((instruction, index) => (
                          <li key={index} className="text-sm">{instruction}</li>
                        ))}
                      </ol>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {status.canRequest && (
                    <Button
                      onClick={requestPermission}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      {isLoading ? 'Requesting...' : 'Enable Notifications'}
                    </Button>
                  )}
                  
                  {status.isBlocked && (
                    <Button
                      onClick={openBrowserSettings}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Browser Settings
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Alert Settings */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Alert Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Risk Level Alerts */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Risk Level Alerts</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <div>
                        <div className="text-white font-medium">High Risk Alerts</div>
                        <div className="text-gray-400 text-sm">Critical weather conditions requiring immediate action</div>
                      </div>
                    </div>
                    <Switch
                      checked={settings.highRisk}
                      onCheckedChange={(checked) => updateSettings({ highRisk: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      <div>
                        <div className="text-white font-medium">Moderate Risk Alerts</div>
                        <div className="text-gray-400 text-sm">Developing weather systems to monitor</div>
                      </div>
                    </div>
                    <Switch
                      checked={settings.moderateRisk}
                      onCheckedChange={(checked) => updateSettings({ moderateRisk: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <div>
                        <div className="text-white font-medium">Low Risk Alerts</div>
                        <div className="text-gray-400 text-sm">Normal conditions and all-clear notifications</div>
                      </div>
                    </div>
                    <Switch
                      checked={settings.lowRisk}
                      onCheckedChange={(checked) => updateSettings({ lowRisk: checked })}
                    />
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Notification Behavior */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Notification Behavior</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="h-5 w-5 text-blue-400" />
                      <div>
                        <div className="text-white font-medium">Background Notifications</div>
                        <div className="text-gray-400 text-sm">Receive alerts even when TropoScan is closed</div>
                      </div>
                    </div>
                    <Switch
                      checked={settings.backgroundNotifications}
                      onCheckedChange={(checked) => updateSettings({ backgroundNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {settings.soundEnabled ? <Volume2 className="h-5 w-5 text-green-400" /> : <VolumeX className="h-5 w-5 text-gray-400" />}
                      <div>
                        <div className="text-white font-medium">Sound Alerts</div>
                        <div className="text-gray-400 text-sm">Play notification sounds for alerts</div>
                      </div>
                    </div>
                    <Switch
                      checked={settings.soundEnabled}
                      onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Vibrate className="h-5 w-5 text-purple-400" />
                      <div>
                        <div className="text-white font-medium">Vibration</div>
                        <div className="text-gray-400 text-sm">Vibrate device for important alerts (mobile)</div>
                      </div>
                    </div>
                    <Switch
                      checked={settings.vibrationEnabled}
                      onCheckedChange={(checked) => updateSettings({ vibrationEnabled: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notification History */}
          <div className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Recent Alerts
                  </span>
                  {history.length > 0 && (
                    <Button
                      onClick={clearHistory}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                    >
                      Clear
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="text-center py-8">
                    <BellOff className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400">No notifications yet</p>
                    <p className="text-gray-500 text-sm">Test notifications will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge 
                            variant="outline" 
                            className={getRiskLevelColor(item.riskLevel)}
                          >
                            {item.riskLevel.toUpperCase()}
                          </Badge>
                          <span className="text-gray-400 text-xs">
                            {formatTimestamp(item.timestamp)}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm">{item.details}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Info className="mr-2 h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Alerts</span>
                  <span className="text-white font-medium">{history.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Status</span>
                  <span className={`font-medium ${notificationService.isFullyConfigured() ? 'text-green-400' : 'text-yellow-400'}`}>
                    {notificationService.isFullyConfigured() ? 'Active' : 'Setup Required'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Browser</span>
                  <span className="text-white font-medium">{status.browserInfo.name}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
