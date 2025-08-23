import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Satellite, 
  AlertTriangle, 
  Eye,
  Activity,
  FileText,
  Cloud,
  TrendingUp,
  Bell,
  Moon,
  Sun
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface EmergencyNavbarProps {
  currentPage?: string;
}

const EmergencyNavbar: React.FC<EmergencyNavbarProps> = ({ currentPage = "emergency" }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleNavigation = (tab: string) => {
    switch (tab) {
      case "home":
        navigate('/');
        break;
      case "detection":
        navigate('/?tab=detection');
        break;
      case "simulator":
        navigate('/CycloneSimulator');
        break;
      case "cases":
        navigate('/?tab=cases');
        break;
      case "emergency":
        navigate('/emergency');
        break;
      case "trends":
        navigate('/trending');
        break;
      case "alerts":
        navigate('/notifications');
        break;
      default:
        navigate('/');
    }
  };

  const getActiveTab = () => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    
    if (path === '/trending') return "trends";
    if (path === '/notifications') return "alerts";
    if (path === '/CycloneSimulator') return "simulator";
    if (path === '/emergency' || currentPage === "emergency" || currentPage === "overview") return "emergency";
    if (currentPage === "contacts") return "emergency";
    if (currentPage === "evacuation") return "emergency";
    if (currentPage === "preparedness") return "emergency";
    if (path === '/' && tab === 'detection') return "detection";
    if (path === '/' && tab === 'cases') return "cases";
    if (path === '/') return "home";
    
    return "home";
  };

  const activeTab = getActiveTab();

  return (
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
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleNavigation("home")}
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
                onClick={() => handleNavigation("detection")}
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
                onClick={() => handleNavigation("cases")}
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
                onClick={() => handleNavigation("emergency")}
                className={`px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
                  activeTab === "emergency" 
                    ? "bg-blue-600 text-white shadow-lg animate-scale-in" 
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Emergency</span>
              </button>
              
              <button
                onClick={() => handleNavigation("simulator")}
                className={`px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
                  activeTab === "simulator" 
                    ? "bg-blue-600 text-white shadow-lg animate-scale-in" 
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Activity className="h-4 w-4" />
                <span>Simulator</span>
              </button>
              
              <button
                onClick={() => handleNavigation("trends")}
                className={`px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
                  activeTab === "trends" 
                    ? "bg-blue-600 text-white shadow-lg animate-scale-in" 
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Trends</span>
              </button>
              
              <button
                onClick={() => handleNavigation("alerts")}
                className={`px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
                  activeTab === "alerts" 
                    ? "bg-blue-600 text-white shadow-lg animate-scale-in" 
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Bell className="h-4 w-4" />
                <span>Alerts</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default EmergencyNavbar;