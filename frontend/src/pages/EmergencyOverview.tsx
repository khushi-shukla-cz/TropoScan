import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Clock, 
  Users, 
  Shield, 
  Navigation,
  Heart,
  ChevronRight,
  ExternalLink,
  Car,
  Home,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import EmergencyNavbar from "@/components/EmergencyNavbar";

const EmergencyOverview = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userLocation, setUserLocation] = useState("Mumbai, Maharashtra");
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const emergencyServices = [
    {
      name: "Emergency Contacts",
      description: "24/7 helplines and emergency services",
      icon: <Phone className="w-6 h-6" />,
      path: "/emergency/contacts",
      color: "bg-red-500",
      urgent: true
    },
    {
      name: "Evacuation Centers",
      description: "Find nearest safe shelters and relief camps",
      icon: <MapPin className="w-6 h-6" />,
      path: "/emergency/evacuation",
      color: "bg-orange-500",
      urgent: true
    },
    {
      name: "Disaster Preparedness",
      description: "Essential survival guides and preparation tips",
      icon: <Shield className="w-6 h-6" />,
      path: "/emergency/preparedness",
      color: "bg-blue-500",
      urgent: false
    },
    {
      name: "Live Emergency Map",
      description: "Real-time emergency services and safe zones",
      icon: <Navigation className="w-6 h-6" />,
      path: "/emergency/evacuation",
      color: "bg-green-500",
      urgent: false
    }
  ];

  const currentAlert = {
    level: "HIGH",
    message: "Severe Cyclone Warning - Immediate Action Required",
    location: "Mumbai Metropolitan Area",
    time: "Active since 14:30 IST",
    nextUpdate: "18:00 IST"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      {/* Fixed Emergency Navigation */}
      <EmergencyNavbar currentPage="emergency" />

      {/* Location and Time Display */}
      <div className="bg-red-600/10 border-b border-red-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
              <div>
                <h2 className="text-xl font-bold text-white">Emergency Response Center</h2>
                <p className="text-gray-300 text-sm">Real-time emergency coordination and support</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-mono text-lg">
                {currentTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
              </div>
              <div className="text-gray-300 text-sm">
                <MapPin className="w-4 h-4 inline mr-1" />
                {userLocation}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Current Alert Banner */}
        <Card className="mb-8 border-red-500 bg-red-950/50 animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <AlertTriangle className="w-8 h-8 text-red-400 mt-1" />
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="destructive" className="animate-pulse">
                      {currentAlert.level} ALERT
                    </Badge>
                    <span className="text-gray-300 text-sm">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {currentAlert.time}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {currentAlert.message}
                  </h3>
                  <p className="text-gray-300">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Affecting: {currentAlert.location}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Next update scheduled: {currentAlert.nextUpdate}
                  </p>
                </div>
              </div>
              <Button 
                variant="destructive" 
                className="animate-bounce"
                onClick={() => navigate('/emergency/contacts')}
              >
                Get Help Now
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Action Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {emergencyServices.map((service, index) => (
            <Card 
              key={index}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 ${
                service.urgent ? 'border-red-500 bg-red-950/30' : 'border-blue-500/30 bg-blue-950/20'
              }`}
              onClick={() => navigate(service.path)}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 rounded-full ${service.color} flex items-center justify-center mx-auto mb-4 ${
                  service.urgent ? 'animate-pulse' : ''
                }`}>
                  {service.icon}
                </div>
                <h3 className="font-bold text-white mb-2">{service.name}</h3>
                <p className="text-gray-300 text-sm mb-4">{service.description}</p>
                <Button 
                  variant={service.urgent ? "destructive" : "secondary"} 
                  size="sm"
                  className="w-full"
                >
                  Access Now
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Critical Information Panel */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Immediate Actions */}
          <Card className="border-orange-500/30 bg-orange-950/20">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-400">
                <Zap className="w-5 h-5 mr-2" />
                Immediate Actions Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-orange-900/30 rounded-lg">
                  <Home className="w-5 h-5 text-orange-400" />
                  <span className="text-white">Secure all outdoor items and windows</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-orange-900/30 rounded-lg">
                  <Car className="w-5 h-5 text-orange-400" />
                  <span className="text-white">Avoid travel unless absolutely necessary</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-orange-900/30 rounded-lg">
                  <Phone className="w-5 h-5 text-orange-400" />
                  <span className="text-white">Keep emergency contacts readily available</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-orange-900/30 rounded-lg">
                  <Heart className="w-5 h-5 text-orange-400" />
                  <span className="text-white">Check on elderly neighbors and relatives</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
                onClick={() => navigate('/emergency/preparedness')}
              >
                View Complete Checklist
              </Button>
            </CardContent>
          </Card>

          {/* Emergency Statistics */}
          <Card className="border-blue-500/30 bg-blue-950/20">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-400">
                <Users className="w-5 h-5 mr-2" />
                Emergency Response Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Evacuation Centers Active</span>
                  <Badge variant="secondary">47</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Emergency Teams Deployed</span>
                  <Badge variant="secondary">156</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Medical Facilities Ready</span>
                  <Badge variant="secondary">23</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Communication Networks</span>
                  <Badge className="bg-green-600">Operational</Badge>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                onClick={() => navigate('/emergency/evacuation')}
              >
                Find Nearest Center
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white"
          >
            ← Back to TropoScan Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyOverview;
