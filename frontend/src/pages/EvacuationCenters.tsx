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
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import EmergencyMap from "@/assets/EmergencyMap";
import EmergencyNavbar from "@/components/EmergencyNavbar";
import { Link } from "react-router-dom";

const EvacuationCenters = () => {
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [userLocation, setUserLocation] = useState("Mumbai, Maharashtra");
  const navigate = useNavigate();

  const evacuationCenters = [
    {
      id: 1,
      name: "Mumbai Central Relief Center",
      address: "Azad Maidan, Fort, Mumbai - 400001",
      facilities: ["Medical", "Food", "Shelter", "Communication"],
      contact: "022-22621855",
      coordinates: [19.076, 72.8777],
      priority: "high",
    },
    {
      id: 2,
      name: "Oval Maidan Community Center",
      address: "Oval Maidan, Churchgate, Mumbai - 400020",
      facilities: ["Medical", "Food", "Shelter"],
      contact: "022-22073456",
      coordinates: [19.0825, 72.8854],
      priority: "high",
    },
    {
      id: 3,
      name: "Shivaji Park Emergency Shelter",
      address: "Shivaji Park, Dadar West, Mumbai - 400028",
      facilities: ["Medical", "Food", "Shelter", "Communication", "Transport"],
      contact: "022-24441234",
      coordinates: [19.0845, 72.8936],
      priority: "medium",
    },
    {
      id: 4,
      name: "Thane District Relief Camp",
      address: "Civil Hospital Campus, Thane - 400601",
      facilities: ["Medical", "Food", "Shelter", "Communication"],
      contact: "022-25346861",
      coordinates: [19.2183, 72.9781],
      priority: "medium",
    },
    {
      id: 5,
      name: "Breach Candy Hospital",
      address: "60 A, Bhulabhai Desai Road, Mumbai - 400026",
      facilities: ["Medical", "Emergency", "ICU"],
      contact: "022-23667901",
      coordinates: [18.9712, 72.8072],
      priority: "high",
    },
  ];

  const getFacilityIcon = (facility) => {
    switch (facility) {
      case "Medical":
        return <Heart className="w-4 h-4" />;
      case "Food":
        return <Utensils className="w-4 h-4" />;
      case "Shelter":
        return <Home className="w-4 h-4" />;
      case "Communication":
        return <Phone className="w-4 h-4" />;
      case "Transport":
        return <Car className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-green-500 bg-green-950/30";
      case "medium":
        return "border-yellow-500 bg-yellow-950/30";
      case "low":
        return "border-blue-500 bg-blue-950/30";
      default:
        return "border-gray-500 bg-gray-950/30";
    }
  };

  const getDirections = (center) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${center.coordinates[0]},${center.coordinates[1]}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      {/* Fixed Emergency Navigation */}
      <EmergencyNavbar currentPage="evacuation" />

      {/* Page Title */}
      <div className="container mx-auto px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-white flex items-center space-x-2">
            <span role="img" aria-label="loc">
              📍
            </span>
            <span>Evacuation Center</span>
          </h1>

          <Link
            to="/emergency"
            className="bg-blue-800 text-white px-4 py-2 rounded shadow hover:bg-blue-900 transition"
          >
            🆘 Go to Emergency Page
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
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
              Click on markers to view center details. Use your device's GPS for
              accurate directions.
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
              className={`transition-all duration-300 hover:scale-[1.02] border-2 ${getPriorityColor(
                center.priority
              )}`}
            >
              <CardContent className="p-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Basic Info */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {center.name}
                        </h3>
                        <p className="text-gray-300 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {center.address}
                        </p>
                      </div>
                    </div>

                    {/* Facilities */}
                    <div>
                      <h4 className="text-white font-semibold mb-2">
                        Available Facilities
                      </h4>
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
                      <h4 className="text-white font-semibold mb-3">
                        Quick Actions
                      </h4>
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
                          onClick={() =>
                            (window.location.href = `tel:${center.contact}`)
                          }
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Call for help
                        </Button>
                        <Button
                          variant="secondary"
                          className="w-full"
                          onClick={() =>
                            window.open(
                              `https://www.google.com/search?q=${encodeURIComponent(
                                center.name
                              )}`,
                              "_blank"
                            )
                          }
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EvacuationCenters;
