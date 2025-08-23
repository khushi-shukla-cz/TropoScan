import { useState, useEffect } from "react";
import { Activity, Database, Cpu, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ModelInfo {
  model_loaded: boolean;
  model_path: string;
  real_model_available: boolean;
  mainbackend_path: string;
  model_type: string;
}

interface HealthStatus {
  status: string;
  model_loaded: boolean;
  model_type: string;
  timestamp: string;
}

const SystemStatus = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSystemStatus = async () => {
    setIsLoading(true);
    try {
      // Fetch health status
      const healthResponse = await fetch('http://localhost:5000/api/health');
      const healthData = await healthResponse.json();
      setHealthStatus(healthData);

      // Fetch model info
      const modelResponse = await fetch('http://localhost:5000/api/model-info');
      const modelData = await modelResponse.json();
      setModelInfo(modelData);

    } catch (error) {
      console.error('Failed to fetch system status:', error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to backend server",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
    
    // Refresh status every 30 seconds
    const interval = setInterval(fetchSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      default:
        return <XCircle className="h-5 w-5 text-red-400" />;
    }
  };

  const getModelTypeInfo = (modelType: string) => {
    if (modelType === 'real_pytorch') {
      return {
        label: 'Real PyTorch Model',
        description: 'Using trained U-Net with mainbackend integration',
        color: 'bg-green-900/20 border-green-400/30 text-green-400'
      };
    } else {
      return {
        label: 'Mock Demo Model',
        description: 'Using demonstration implementation',
        color: 'bg-yellow-900/20 border-yellow-400/30 text-yellow-400'
      };
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading system status...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Server Health */}
      <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-500">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Activity className="mr-3 h-6 w-6 text-blue-400" />
            Backend Server Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {healthStatus && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(healthStatus.status)}
                <span className="text-white font-medium">
                  Server {healthStatus.status === 'healthy' ? 'Online' : 'Issues Detected'}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {new Date(healthStatus.timestamp).toLocaleTimeString()}
              </Badge>
            </div>
          )}
          
          <Button 
            onClick={fetchSystemStatus}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Refresh Status
          </Button>
        </CardContent>
      </Card>

      {/* Model Information */}
      <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-500">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Cpu className="mr-3 h-6 w-6 text-blue-400" />
            AI Model Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {modelInfo && healthStatus && (
            <>
              {/* Model Type */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Model Type</span>
                  <Badge className={getModelTypeInfo(healthStatus.model_type).color}>
                    {getModelTypeInfo(healthStatus.model_type).label}
                  </Badge>
                </div>
                <p className="text-sm text-gray-300">
                  {getModelTypeInfo(healthStatus.model_type).description}
                </p>
              </div>

              {/* Model Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    {modelInfo.model_loaded ? (
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400 mr-2" />
                    )}
                    <span className="text-sm text-gray-400">Model Loaded</span>
                  </div>
                  <span className="text-white font-medium">
                    {modelInfo.model_loaded ? 'Yes' : 'No'}
                  </span>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <Database className="h-4 w-4 text-blue-400 mr-2" />
                    <span className="text-sm text-gray-400">Real Model Available</span>
                  </div>
                  <span className="text-white font-medium">
                    {modelInfo.real_model_available ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              {/* Technical Details */}
              <div className="space-y-2">
                <h4 className="text-white font-medium">Technical Details</h4>
                <div className="bg-black/20 rounded-lg p-3 space-y-1">
                  <div className="text-xs text-gray-400">
                    Model Path: <span className="text-gray-300">{modelInfo.model_path}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Backend Path: <span className="text-gray-300">{modelInfo.mainbackend_path}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Integration Status */}
      <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-500">
        <CardHeader>
          <CardTitle className="text-white">Integration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Frontend ↔ Integrated Backend</span>
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Backend ↔ MainBackend Utilities</span>
              {modelInfo?.real_model_available ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">AI Model Integration</span>
              {healthStatus?.model_loaded ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400" />
              )}
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-400/30 rounded-lg">
            <p className="text-sm text-blue-200">
              <strong>Integration Status:</strong> {' '}
              {modelInfo?.real_model_available 
                ? "✅ Full integration with real PyTorch model and mainbackend utilities"
                : "🎭 Running in demo mode with mock implementation"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemStatus;
