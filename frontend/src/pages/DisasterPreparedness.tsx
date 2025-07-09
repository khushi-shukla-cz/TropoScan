import React, { useState } from "react";
import {
  Shield,
  Home,
  Utensils,
  Heart,
  Zap,
  Car,
  Phone,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Droplets,
  Battery,
  Radio,
  Package,
  FileText,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import EmergencyNavbar from "@/components/EmergencyNavbar";

const DisasterPreparedness = () => {
  const [checkedItems, setCheckedItems] = useState({});
  const navigate = useNavigate();

  const toggleItem = (category, item) => {
    const key = `${category}-${item}`;
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const emergencyKitItems = [
    {
      category: "Essential Documents",
      icon: <FileText className="w-5 h-5" />,
      items: [
        "Government-issued ID cards (Aadhaar, PAN, Voter ID)",
        "Passport and visa documents",
        "Insurance policies (health, property, vehicle)",
        "Bank account details and important financial documents",
        "Property ownership documents",
        "Emergency contact list with phone numbers",
        "Medical records and prescription details",
        "Recent photographs of family members"
      ]
    },
    {
      category: "Food & Water",
      icon: <Utensils className="w-5 h-5" />,
      items: [
        "3-day supply of non-perishable food per person",
        "1 gallon of water per person per day (3-day supply)",
        "Water purification tablets or portable filter",
        "Manual can opener and eating utensils",
        "Baby formula and food (if applicable)",
        "Pet food and supplies",
        "Special dietary requirements food",
        "Energy bars and dried fruits"
      ]
    },
    {
      category: "Medical Supplies",
      icon: <Heart className="w-5 h-5" />,
      items: [
        "First aid kit with bandages and antiseptics",
        "Prescription medications (7-day supply)",
        "Over-the-counter pain relievers",
        "Thermometer and blood pressure monitor",
        "Hand sanitizer and face masks",
        "Personal hygiene items",
        "Glasses/contact lenses and solutions",
        "Medical alert bracelets or tags"
      ]
    },
    {
      category: "Electronics & Communication",
      icon: <Battery className="w-5 h-5" />,
      items: [
        "Battery-powered or hand crank radio",
        "Mobile phone with chargers and power banks",
        "Flashlights with extra batteries",
        "Emergency weather radio",
        "Portable solar charger",
        "Two-way radios for family communication",
        "Backup batteries (various sizes)",
        "Emergency whistle for signaling"
      ]
    },
    {
      category: "Clothing & Shelter",
      icon: <Home className="w-5 h-5" />,
      items: [
        "Change of clothes for each family member",
        "Sturdy shoes and extra socks",
        "Rain gear and warm clothing",
        "Blankets and sleeping bags",
        "Emergency tent or tarp",
        "Work gloves and safety gear",
        "Dust masks and plastic sheeting",
        "Duct tape and zip-lock bags"
      ]
    },
    {
      category: "Tools & Supplies",
      icon: <Package className="w-5 h-5" />,
      items: [
        "Multi-tool or Swiss Army knife",
        "Rope and utility knife",
        "Matches in waterproof container",
        "Cash in small denominations",
        "Local area maps (physical copies)",
        "Fire extinguisher and smoke alarms",
        "Plastic garbage bags and ties",
        "Paper plates, cups, and utensils"
      ]
    }
  ];

  const evacuationPlan = {
    beforeCyclone: [
      "Monitor weather updates and official warnings regularly",
      "Secure outdoor furniture, decorations, and loose objects",
      "Trim trees and bushes around your property",
      "Check and clean drainage systems around your home",
      "Fill bathtubs and containers with fresh water",
      "Charge all electronic devices and power banks",
      "Review evacuation routes and alternate paths",
      "Inform family and friends of your emergency plan"
    ],
    duringCyclone: [
      "Stay indoors and away from windows and glass doors",
      "Move to the lowest floor and stay in interior rooms",
      "Avoid using electrical appliances and landline phones",
      "Listen to battery-powered radio for emergency updates",
      "Do not go outside during the eye of the storm",
      "If flooding occurs, move to higher ground immediately",
      "Avoid walking or driving through flood water",
      "Use flashlights instead of candles for lighting"
    ],
    afterCyclone: [
      "Wait for official all-clear before going outside",
      "Be cautious of fallen power lines and debris",
      "Check for gas leaks and electrical damage",
      "Take photos of property damage for insurance",
      "Avoid drinking tap water until declared safe",
      "Help neighbors, especially elderly and disabled",
      "Report emergencies to local authorities",
      "Stay away from damaged buildings and bridges"
    ]
  };

  const emergencyContacts = [
    { name: "National Emergency", number: "112", priority: "critical" },
    { name: "NDMA Helpline", number: "1078", priority: "critical" },
    { name: "Medical Emergency", number: "108", priority: "critical" },
    { name: "Local Emergency Control", number: "1077", priority: "high" },
    { name: "Power Emergency", number: "1912", priority: "medium" },
    { name: "Gas Emergency", number: "1906", priority: "medium" }
  ];

  const getCompletionPercentage = (category) => {
    const categoryItems = emergencyKitItems.find(kit => kit.category === category)?.items || [];
    const checkedCount = categoryItems.filter((_, index) => 
      checkedItems[`${category}-${index}`]
    ).length;
    return Math.round((checkedCount / categoryItems.length) * 100);
  };

  const getTotalCompletion = () => {
    const totalItems = emergencyKitItems.reduce((sum, kit) => sum + kit.items.length, 0);
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    return Math.round((checkedCount / totalItems) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      <EmergencyNavbar currentPage="preparedness" />
      
      {/* Page Header */}
      <div className="bg-green-600/20 border-b border-green-500/30 backdrop-blur-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-green-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">Disaster Preparedness</h1>
                <p className="text-gray-300">Essential survival guides and preparation checklists</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-white font-bold text-lg">
                  {getTotalCompletion()}% Complete
                </div>
                <div className="text-gray-300 text-sm">Emergency Kit Preparation</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-green-500/30 bg-green-950/20">
            <CardContent className="p-6 text-center">
              <Package className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-white">{emergencyKitItems.length}</h3>
              <p className="text-gray-300">Kit Categories</p>
            </CardContent>
          </Card>
          <Card className="border-blue-500/30 bg-blue-950/20">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-white">
                {Object.values(checkedItems).filter(Boolean).length}
              </h3>
              <p className="text-gray-300">Items Prepared</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-500/30 bg-yellow-950/20">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-white">72</h3>
              <p className="text-gray-300">Hours Coverage</p>
            </CardContent>
          </Card>
          <Card className="border-purple-500/30 bg-purple-950/20">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-white">4</h3>
              <p className="text-gray-300">Family Members</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="emergency-kit" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="emergency-kit" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Emergency Kit</span>
            </TabsTrigger>
            <TabsTrigger value="evacuation-plan" className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Action Plan</span>
            </TabsTrigger>
            <TabsTrigger value="emergency-contacts" className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>Quick Contacts</span>
            </TabsTrigger>
          </TabsList>

          {/* Emergency Kit Tab */}
          <TabsContent value="emergency-kit" className="space-y-6">
            <Card className="border-blue-500/30 bg-blue-950/20">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-400">
                  <Package className="w-5 h-5 mr-2" />
                  Emergency Kit Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-6">
                  Prepare a comprehensive emergency kit that can sustain your family for at least 72 hours. 
                  Check items as you add them to your kit.
                </p>
                <div className="space-y-6">
                  {emergencyKitItems.map((kit, kitIndex) => (
                    <Card key={kitIndex} className="border-gray-600/30 bg-gray-900/30">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center text-white text-lg">
                            {kit.icon}
                            <span className="ml-2">{kit.category}</span>
                          </CardTitle>
                          <Badge 
                            variant={getCompletionPercentage(kit.category) === 100 ? "default" : "secondary"}
                            className={getCompletionPercentage(kit.category) === 100 ? "bg-green-600" : ""}
                          >
                            {getCompletionPercentage(kit.category)}% Complete
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-2">
                          {kit.items.map((item, itemIndex) => (
                            <div 
                              key={itemIndex}
                              className="flex items-center space-x-3 p-2 rounded hover:bg-gray-800/50 cursor-pointer"
                              onClick={() => toggleItem(kit.category, itemIndex)}
                            >
                              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                                checkedItems[`${kit.category}-${itemIndex}`] 
                                  ? 'bg-green-600 border-green-600' 
                                  : 'border-gray-400'
                              }`}>
                                {checkedItems[`${kit.category}-${itemIndex}`] && (
                                  <CheckCircle className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span className={`text-sm ${
                                checkedItems[`${kit.category}-${itemIndex}`] 
                                  ? 'text-green-400 line-through' 
                                  : 'text-gray-300'
                              }`}>
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Evacuation Plan Tab */}
          <TabsContent value="evacuation-plan" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Before Cyclone */}
              <Card className="border-yellow-500/30 bg-yellow-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-yellow-400">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Before Cyclone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {evacuationPlan.beforeCyclone.map((action, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-yellow-600 text-white text-xs rounded-full flex items-center justify-center font-bold mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-gray-300 text-sm">{action}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* During Cyclone */}
              <Card className="border-red-500/30 bg-red-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-400">
                    <Shield className="w-5 h-5 mr-2" />
                    During Cyclone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {evacuationPlan.duringCyclone.map((action, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-gray-300 text-sm">{action}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* After Cyclone */}
              <Card className="border-green-500/30 bg-green-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-400">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    After Cyclone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {evacuationPlan.afterCyclone.map((action, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-green-600 text-white text-xs rounded-full flex items-center justify-center font-bold mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-gray-300 text-sm">{action}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Emergency Contacts Tab */}
          <TabsContent value="emergency-contacts" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {emergencyContacts.map((contact, index) => (
                <Card 
                  key={index}
                  className={`transition-all duration-300 hover:scale-105 border-2 ${
                    contact.priority === 'critical' ? 'border-red-500 bg-red-950/30' :
                    contact.priority === 'high' ? 'border-orange-500 bg-orange-950/30' :
                    'border-blue-500 bg-blue-950/30'
                  }`}
                >
                  <CardContent className="p-6 text-center">
                    <Phone className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                    <h3 className="font-bold text-white mb-2">{contact.name}</h3>
                    <div className="text-3xl font-mono font-bold text-white mb-4">
                      {contact.number}
                    </div>
                    <Button 
                      variant={contact.priority === 'critical' ? 'destructive' : 'default'}
                      className="w-full"
                      onClick={() => window.location.href = `tel:${contact.number}`}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-blue-500/30 bg-blue-950/20">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-400">
                  <Users className="w-5 h-5 mr-2" />
                  Family Emergency Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold">Establish Meeting Points:</h4>
                    <ul className="text-gray-300 text-sm space-y-1 ml-4">
                      <li>• Primary: Near your home (e.g., neighborhood center)</li>
                      <li>• Secondary: Outside your area (e.g., relative's house)</li>
                      <li>• Out-of-state contact for family coordination</li>
                      <li>• Share locations with all family members</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold">Communication Plan:</h4>
                    <ul className="text-gray-300 text-sm space-y-1 ml-4">
                      <li>• Designate an out-of-area emergency contact</li>
                      <li>• Ensure everyone knows the contact information</li>
                      <li>• Practice your emergency communication plan</li>
                      <li>• Keep contact information updated regularly</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DisasterPreparedness;
