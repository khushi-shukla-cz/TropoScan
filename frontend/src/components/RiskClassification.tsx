
import { AlertTriangle, CheckCircle, AlertCircle, Thermometer, Cloud, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface RiskClassificationProps {
  riskLevel: "low" | "moderate" | "high";
  temperature: string;
  clusterArea: number;
  confidence: number;
  prediction: string;
  modelType?: string;
  coveragePercent?: number;
  calamityType?: string;
  calamitySeverity?: string;
}

const RiskClassification = ({ 
  riskLevel, 
  temperature, 
  clusterArea, 
  confidence, 
  prediction,
  modelType = "unknown",
  coveragePercent,
  calamityType,
  calamitySeverity
}: RiskClassificationProps) => {
  const getRiskConfig = (level: string) => {
    switch (level) {
      case "high":
        return {
          color: "red",
          icon: AlertTriangle,
          bgClass: "bg-red-900/20 border-red-400/30",
          textClass: "text-red-400",
          description: "Deep convection detected - Potential cyclone formation",
          action: "Immediate meteorological attention required"
        };
      case "moderate":
        return {
          color: "yellow",
          icon: AlertCircle,
          bgClass: "bg-yellow-900/20 border-yellow-400/30",
          textClass: "text-yellow-400",
          description: "Organized cloud cluster - Monitor for intensification",
          action: "Continue monitoring - Prepare for possible escalation"
        };
      default:
        return {
          color: "green",
          icon: CheckCircle,
          bgClass: "bg-green-900/20 border-green-400/30",
          textClass: "text-green-400",
          description: "Normal cloud patterns - No immediate threat",
          action: "Routine monitoring sufficient"
        };
    }
  };

  const config = getRiskConfig(riskLevel);
  const IconComponent = config.icon;
  
  // Determine event classification based on temperature
  const getEventType = (temp: string): string => {
    const tempValue = parseInt(temp);
    if (tempValue < -70) {
      return "Cyclonic Cluster detected";
    } else if (tempValue < -65) {
      return "Severe Thunderstorm detected";
    } else if (tempValue < -60) {
      return "Local Rainstorm detected";
    } else {
      return "Low-Risk Cloud Cluster detected";
    }
  };
  
  // Get the correct event type based on temperature
  const eventTypeDescription = getEventType(temperature);

  return (
    <Card className={`${config.bgClass} ${riskLevel === "high" ? "pulse-danger" : ""}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <IconComponent className={`mr-3 h-6 w-6 ${config.textClass}`} />
            Risk Assessment
          </div>
          <Badge 
            variant={riskLevel === "high" ? "destructive" : riskLevel === "moderate" ? "default" : "secondary"}
            className="text-sm font-bold"
          >
            {riskLevel.toUpperCase()} RISK
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Description */}
        <div>
          <p className={`text-lg font-medium ${config.textClass} mb-2`}>
            {eventTypeDescription}
          </p>
          <p className="text-gray-300 text-sm">
            {config.action}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Thermometer className="h-4 w-4 text-blue-400 mr-2" />
              <span className="text-sm text-gray-400">Temperature</span>
            </div>
            <div className="text-xl font-bold text-white">{temperature}</div>
            <div className="text-xs text-gray-400">
              {parseInt(temperature) < -70 ? "Very Cold - High Altitude" : 
               parseInt(temperature) < -60 ? "Cold - Storm Clouds" : "Moderate"}
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Cloud className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-400">Cluster Area</span>
            </div>
            <div className="text-xl font-bold text-white">{clusterArea} km²</div>
            <div className="text-xs text-gray-400">
              {clusterArea > 2000 ? "Large System" : 
               clusterArea > 1000 ? "Medium Cluster" : "Small Formation"}
            </div>
          </div>

          {coveragePercent !== undefined && (
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Cloud className="h-4 w-4 text-purple-400 mr-2" />
                <span className="text-sm text-gray-400">Coverage</span>
              </div>
              <div className="text-xl font-bold text-white">{coveragePercent.toFixed(2)}%</div>
              <div className="text-xs text-gray-400">
                {coveragePercent > 30 ? "Extensive" : 
                 coveragePercent > 15 ? "Significant" : 
                 coveragePercent > 5 ? "Moderate" : "Minimal"}
              </div>
            </div>
          )}

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <TrendingUp className="h-4 w-4 text-green-400 mr-2" />
              <span className="text-sm text-gray-400">Confidence</span>
            </div>
            <div className="text-xl font-bold text-white">{confidence}%</div>
            <Progress value={confidence} className="mt-2 h-2" />
          </div>
        </div>

        {/* AI Prediction - Enhanced */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-4 border border-blue-400/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <h4 className="text-white font-semibold text-lg">Model Prediction</h4>
            </div>
            {modelType === "real_pytorch" && (
              <Badge variant="secondary" className="bg-green-600 text-white">
                🧠 Real AI Model
              </Badge>
            )}
            {modelType === "mock_demo" && (
              <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                🎭 Demo Mode
              </Badge>
            )}
          </div>
          <div className="bg-black/20 rounded-md p-3 border-l-4 border-blue-400">
            <p className="text-gray-200 leading-relaxed font-medium">{prediction}</p>
          </div>
        </div>

        {/* Calamity Classification */}
        {calamityType && (
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-4 border border-blue-400/20 mb-4">
            <h4 className="text-white font-medium flex items-center mb-3">
              <span className="mr-2">
                {calamityType.includes("Cyclonic") ? "🌪️" : 
                 calamityType.includes("Thunder") ? "⛈️" : 
                 calamityType.includes("Rain") ? "🌧️" : "☁️"}
              </span>
              Event Classification
            </h4>
            
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-medium">
                <span className={
                  calamitySeverity === "EXTREME" ? "text-red-400" : 
                  calamitySeverity === "HIGH" ? "text-orange-400" : 
                  calamitySeverity === "MODERATE" ? "text-yellow-400" : "text-green-400"
                }>
                  {calamityType}
                </span>
              </div>
              
              <Badge 
                variant={
                  calamitySeverity === "EXTREME" ? "destructive" : 
                  calamitySeverity === "HIGH" ? "default" : 
                  calamitySeverity === "MODERATE" ? "outline" : "secondary"
                }
              >
                {calamitySeverity}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-300">
              {calamitySeverity === "EXTREME" ? 
                "High-intensity cyclonic formation with deep convection" :
               calamitySeverity === "HIGH" ?
                "Organized severe convective system" :
               calamitySeverity === "MODERATE" ?
                "Localized heavy precipitation system" :
                "Normal cloud formation with minimal threat"
              }
            </p>
            
            <div className="mt-3 text-xs text-gray-400 bg-black/20 p-2 rounded">
              <strong>Classification Rules:</strong><br/>
              • Cyclonic Cluster: area {'>'} 1500 km² & temp {'<'} -70°C<br/>
              • Severe Thunderstorm: 500 {'<'} area ≤ 1500 km² & temp {'<'} -65°C<br/>
              • Local Rainstorm: 200 {'<'} area ≤ 500 km² & temp {'<'} -60°C<br/>
              • Low-Risk Cloud Cluster: otherwise
            </div>
          </div>
        )}

        {/* Risk Indicators */}
        <div className="space-y-3">
          <h4 className="text-white font-medium">Risk Indicators</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Deep Convection</span>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  parseInt(temperature) < -70 ? "bg-red-400" : 
                  parseInt(temperature) < -60 ? "bg-yellow-400" : "bg-green-400"
                }`}></div>
                <span className="text-sm text-white">
                  {parseInt(temperature) < -70 ? "Active" : 
                   parseInt(temperature) < -60 ? "Developing" : "Minimal"}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Organization</span>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  clusterArea > 2000 ? "bg-red-400" : 
                  clusterArea > 1000 ? "bg-yellow-400" : "bg-green-400"
                }`}></div>
                <span className="text-sm text-white">
                  {clusterArea > 2000 ? "Highly Organized" : 
                   clusterArea > 1000 ? "Moderately Organized" : "Scattered"}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Development Potential</span>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  riskLevel === "high" ? "bg-red-400" : 
                  riskLevel === "moderate" ? "bg-yellow-400" : "bg-green-400"
                }`}></div>
                <span className="text-sm text-white">
                  {riskLevel === "high" ? "High" : 
                   riskLevel === "moderate" ? "Moderate" : "Low"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskClassification;
