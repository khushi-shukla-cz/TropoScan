import { useState, useEffect } from "react";
import { Cloud, Satellite, AlertTriangle, TrendingUp, Eye, Download, MapPin, Clock, Thermometer, Sun, Moon, Activity, Zap, Bell, FileText, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import DetectionInterface from "@/components/DetectionInterface";
import HistoricalCases from "@/components/HistoricalCases";
import SystemStatus from "@/components/SystemStatus";
import CycloneSimulator from "@/components/CycloneSimulator";
import ModelValidation from "@/components/ModelValidation";
import { useNavigate, useLocation } from "react-router-dom";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync activeTab with URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['home', 'detection', 'cases'].includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab('home');
    }
  }, [location.search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 transition-all duration-500">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 animate-fade-in">
              <Satellite className="h-8 w-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">TropoScan</h1>
              <Badge variant="secondary" className="ml-2">
                AI-Powered
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-white hover:bg-white/10 transition-all duration-300 hover:scale-110"
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </Button>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab("home")}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
                    activeTab === "home"
                      ? "bg-blue-600 text-white shadow-lg animate-scale-in"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Cloud className="h-4 w-4" />
                  <span>Home</span>
                </button>
                
                <button
                  onClick={() => setActiveTab("detection")}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
                    activeTab === "detection"
                      ? "bg-blue-600 text-white shadow-lg animate-scale-in"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  <span>Detection</span>
                </button>
                
                <button
                  onClick={() => setActiveTab("cases")}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
                    activeTab === "cases"
                      ? "bg-blue-600 text-white shadow-lg animate-scale-in"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>Cases</span>
                </button>
                
                <button
                  onClick={() => navigate("/emergency")}
                  className="px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-white/10"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>Emergency</span>
                </button>

                <button
                  onClick={() => navigate("/CycloneSimulator")}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
                    location.pathname === "/CycloneSimulator"
                      ? "bg-blue-600 text-white shadow-lg animate-scale-in"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Activity className="h-4 w-4" />
                  <span>Simulator</span>
                </button>

                <button
                  onClick={() => navigate("/trending")}
                  className="px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-white/10"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Trends</span>
                </button>

                <button
                  onClick={() => navigate("/notifications")}
                  className="px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-white/10"
                >
                  <Bell className="h-4 w-4" />
                  <span>Alerts</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {activeTab === "home" && (
        <div className="animate-fade-in">
          {/* Hero Section */}
          <section className="container mx-auto px-4 py-16">
            <div className="text-center mb-16 animate-scale-in">
              <h2 className="text-5xl font-bold text-white mb-6 animate-fade-in delay-100">
                Early Warning System for{" "}
                <span className="text-blue-400">Tropical Storms</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto animate-fade-in delay-200">
                Using AI and INSAT satellite data to detect dangerous cloud
                clusters before they develop into cyclones.
              </p>
              <div className="flex justify-center space-x-4 animate-fade-in delay-300">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  onClick={() => setActiveTab("detection")}
                >
                  <Eye className="mr-2 h-5 w-5" />
                  Try Detection
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 transform hover:scale-105 transition-all duration-300"
                  onClick={() => navigate("/CycloneSimulator")}
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Cyclone Simulator
                </Button>
              </div>
            </div>

            {/* How It Works */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              {[
                {
                  icon: Satellite,
                  title: "INSAT Data Processing",
                  description:
                    "Real-time infrared satellite images from INSAT-3D/3DR processed every 30 minutes for temperature and cloud pattern analysis.",
                  color: "blue",
                  delay: "delay-100",
                },
                {
                  icon: Cloud,
                  title: "AI Detection",
                  description:
                    "U-Net deep learning model identifies deep convection zones and organized cloud clusters with pixel-level precision.",
                  color: "green",
                  delay: "delay-300",
                },
                {
                  icon: AlertTriangle,
                  title: "Risk Assessment",
                  description:
                    "Automated risk classification and alert generation for meteorologists and disaster management agencies.",
                  color: "red",
                  delay: "delay-500",
                },
              ].map((item, index) => (
                <Card
                  key={index}
                  className={`bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-500 transform hover:scale-105 hover:shadow-xl animate-fade-in ${item.delay}`}
                >
                  <CardHeader>
                    <item.icon
                      className={`h-12 w-12 text-${item.color}-400 mb-4`}
                    />
                    <CardTitle className="text-white">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Impact */}
            <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-400/30 hover:shadow-2xl transition-all duration-500 animate-fade-in delay-700">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Real-World Impact
                </h3>
                <p className="text-lg text-gray-200 mb-6">
                  "Early detection can save thousands of lives. In 2023, Cyclone
                  Biparjoy was detected by our system 2 hours before official
                  warnings, providing crucial time for evacuation and
                  preparation."
                </p>
                <div className="flex justify-center items-center space-x-8">
                  <div className="text-center transform hover:scale-110 transition-all duration-300">
                    <div className="text-2xl font-bold text-blue-400">70%</div>
                    <div className="text-sm text-gray-300">
                      India's rainfall from tropical systems
                    </div>
                  </div>
                  <div className="text-center transform hover:scale-110 transition-all duration-300">
                    <div className="text-2xl font-bold text-green-400">
                      500M+
                    </div>
                    <div className="text-sm text-gray-300">
                      People in vulnerable coastal areas
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Model Validation Component */}
            <div className="animate-fade-in delay-800">
              <ModelValidation />
            </div>
          </section>
        </div>
      )}

      {activeTab === "detection" && (
        <div className="animate-fade-in">
          <DetectionInterface />
        </div>
      )}

      {activeTab === "cases" && (
        <div className="animate-fade-in">
          <HistoricalCases />
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black/20 border-t border-white/10 py-8 animate-fade-in">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            TropoScan - AI-Powered Tropical Storm Detection System
          </p>
          <p className="text-gray-500 mt-2">
            Built for early disaster detection and meteorological research
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
