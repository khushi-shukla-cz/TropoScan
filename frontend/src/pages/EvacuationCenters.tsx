import React, { useState, useEffect } from "react";
import {
  MapPin,
  Navigation,
  Users,
  Home,
  Heart,
  Utensils,
  Car,
  Clock,
  Phone,
  AlertTriangle,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import EmergencyMap from "@/assets/EmergencyMap";
import EmergencyNavbar from "@/components/EmergencyNavbar";

const EvacuationCenters = () => {
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [userLocation, setUserLocation] = useState("Mumbai, Maharashtra");
  const navigate = useNavigate();

  const evacuationCenters = [
    {
      id: 1,
      name: "Mumbai Central Relief Center",
      address: "Azad Maidan, Fort, Mumbai - 400001",
      capacity: 2500,
      currentOccupancy: 850,
      facilities: ["Medical", "Food", "Shelter", "Communication"],
      distance: "2.3 km",
      status: "Active",
      contact: "022-22621855",
      coordinates: [19.076, 72.8777],
      priority: "high"
    },
    {
      id: 2,
      name: "Oval Maidan Community Center",
      address: "Oval Maidan, Churchgate, Mumbai - 400020",
      capacity: 1800,
      currentOccupancy: 420,
      facilities: ["Medical", "Food", "Shelter"],
      distance: "3.1 km",
      status: "Active",
      contact: "022-22073456",
      coordinates: [19.0825, 72.8854],
      priority: "high"
    },
    {
      id: 3,
      name: "Shivaji Park Emergency Shelter",
      address: "Shivaji Park, Dadar West, Mumbai - 400028",
      capacity: 3000,
      currentOccupancy: 1200,
      facilities: ["Medical", "Food", "Shelter", "Communication", "Transport"],
      distance: "5.7 km",
      status: "Active",
      contact: "022-24441234",
      coordinates: [19.0845, 72.8936],
      priority: "medium"
    },
    {
      id: 4,
      name: "Thane District Relief Camp",
      address: "Civil Hospital Campus, Thane - 400601",
      capacity: 2200,
      currentOccupancy: 680,
      facilities: ["Medical", "Food", "Shelter", "Communication"],
      distance: "18.5 km",
      status: "Active",
      contact: "022-25346861",
      coordinates: [19.2183, 72.9781],
      priority: "medium"
    },
    {
      id: 5,
      name: "Navi Mumbai Evacuation Center",
      address: "Sector 17, Vashi, Navi Mumbai - 400703",
      capacity: 1500,
      currentOccupancy: 320,
      facilities: ["Medical", "Food", "Shelter"],
      distance: "22.1 km",
      status: "Active",
      contact: "022-27893456",
      coordinates: [19.0768, 73.0185],
      priority: "low"
    }
  ];

  const getOccupancyColor = (occupancy, capacity) => {
    const percentage = (occupancy / capacity) * 100;
    if (percentage < 50) return "text-green-400";
    if (percentage < 80) return "text-yellow-400";
    return "text-red-400";
  };

  const getOccupancyStatus = (occupancy, capacity) => {
    const percentage = (occupancy / capacity) * 100;
    if (percentage < 50) return "Available";
    if (percentage < 80) return "Limited Space";
    return "Nearly Full";
  };

  const getFacilityIcon = (facility) => {
    switch (facility) {
      case "Medical": return <Heart className="w-4 h-4" />;
      case "Food": return <Utensils className="w-4 h-4" />;
      case "Shelter": return <Home className="w-4 h-4" />;
      case "Communication": return <Phone className="w-4 h-4" />;
      case "Transport": return <Car className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-green-500 bg-green-950/30';
      case 'medium': return 'border-yellow-500 bg-yellow-950/30';
      case 'low': return 'border-blue-500 bg-blue-950/30';
      default: return 'border-gray-500 bg-gray-950/30';
    }
  };

  const getDirections = (center) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${center.coordinates[0]},${center.coordinates[1]}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      {/* Fixed Emergency Navigation */}
      <EmergencyNavbar currentPage="evacuation" />

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-green-500/30 bg-green-950/20">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-white">5</h3>
              <p className="text-gray-300">Active Centers</p>
            </CardContent>
          </Card>
          <Card className="border-blue-500/30 bg-blue-950/20">
            <CardContent className="p-6 text-center">
              <Home className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-white">11,000</h3>
              <p className="text-gray-300">Total Capacity</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-500/30 bg-yellow-950/20">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-white">3,470</h3>
              <p className="text-gray-300">Current Occupancy</p>
            </CardContent>
          </Card>
          <Card className="border-purple-500/30 bg-purple-950/20">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-white">7,530</h3>
              <p className="text-gray-300">Available Space</p>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Map */}
        <Card className="mb-8 border-blue-500/30 bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-400">
              <Navigation className="w-5 h-5 mr-2" />
              Emergency Centers Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 rounded-lg overflow-hidden">
              <EmergencyMap />
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Click on markers to view center details. Use your device's GPS for accurate directions.
            </p>
          </CardContent>
        </Card>

        {/* Centers List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Home className="w-6 h-6 mr-2 text-green-400" />
            Available Evacuation Centers
          </h2>
          
          {evacuationCenters.map((center) => (
            <Card 
              key={center.id}
              className={`transition-all duration-300 hover:scale-[1.02] border-2 ${getPriorityColor(center.priority)}`}
            >
              <CardContent className="p-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Basic Info */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{center.name}</h3>
                        <p className="text-gray-300 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {center.address}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          <Navigation className="w-4 h-4 inline mr-1" />
                          {center.distance} away
                        </p>
                      </div>
                      <Badge 
                        className={center.status === 'Active' ? 'bg-green-600' : 'bg-red-600'}
                      >
                        {center.status}
                      </Badge>
                    </div>

                    {/* Capacity */}
                    <div className="bg-black/20 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">Occupancy Status</span>
                        <span className={`font-bold ${getOccupancyColor(center.currentOccupancy, center.capacity)}`}>
                          {getOccupancyStatus(center.currentOccupancy, center.capacity)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-300">
                          Current: <span className="text-white font-semibold">{center.currentOccupancy.toLocaleString()}</span>
                        </span>
                        <span className="text-gray-300">
                          Capacity: <span className="text-white font-semibold">{center.capacity.toLocaleString()}</span>
                        </span>
                        <span className="text-gray-300">
                          Available: <span className="text-green-400 font-semibold">
                            {(center.capacity - center.currentOccupancy).toLocaleString()}
                          </span>
                        </span>
                      </div>
                      <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            (center.currentOccupancy / center.capacity) * 100 < 50 ? 'bg-green-500' :
                            (center.currentOccupancy / center.capacity) * 100 < 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(center.currentOccupancy / center.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Facilities */}
                    <div>
                      <h4 className="text-white font-semibold mb-2">Available Facilities</h4>
                      <div className="flex flex-wrap gap-2">
                        {center.facilities.map((facility, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="flex items-center space-x-1"
                          >
                            {getFacilityIcon(facility)}
                            <span>{facility}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-4">
                    <div className="bg-black/20 p-4 rounded-lg">
                      <h4 className="text-white font-semibold mb-3">Quick Actions</h4>
                      <div className="space-y-2">
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={() => getDirections(center)}
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Get Directions
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
                          onClick={() => window.location.href = `tel:${center.contact}`}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Call Center
                        </Button>
                        <Button 
                          variant="secondary" 
                          className="w-full"
                          onClick={() => setSelectedCenter(center)}
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>

                    <div className="text-center text-gray-400 text-sm">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Last updated: 5 minutes ago
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Emergency Instructions */}
        <Card className="mt-8 border-orange-500/30 bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-400">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Evacuation Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="text-white font-semibold">What to bring:</h4>
                <ul className="text-gray-300 text-sm space-y-1 ml-4">
                  <li>• Important documents (ID, insurance papers)</li>
                  <li>• Essential medications</li>
                  <li>• Change of clothes and blankets</li>
                  <li>• Non-perishable food and water</li>
                  <li>• Mobile phone and charger</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-white font-semibold">Transportation:</h4>
                <ul className="text-gray-300 text-sm space-y-1 ml-4">
                  <li>• Use public transport when available</li>
                  <li>• Emergency buses operating on main routes</li>
                  <li>• Avoid driving unless absolutely necessary</li>
                  <li>• Emergency services have priority on roads</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EvacuationCenters;
