import React, { useState, useEffect } from "react";
import {
  Phone,
  AlertTriangle,
  MapPin,
  Clock,
  Shield,
  Users,
  Home,
  Zap,
  Heart,
  Car,
  Info,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import EmergencyMap from "./EmergencyMap";
const EmergencyInfo = () => {
  const [activeTab, setActiveTab] = useState("immediate");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userLocation, setUserLocation] = useState("Mumbai, Maharashtra");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const emergencyContacts = [
    {
      name: "NDMA India",
      number: "1078",
      type: "National Disaster",
      icon: <Shield className="w-5 h-5" />,
    },
    {
      name: "Emergency Services",
      number: "108",
      type: "Medical/Fire/Police",
      icon: <Heart className="w-5 h-5" />,
    },
    {
      name: "Coast Guard",
      number: "1554",
      type: "Maritime Emergency",
      icon: <Users className="w-5 h-5" />,
    },
    {
      name: "Women Helpline",
      number: "1091",
      type: "Women Safety",
      icon: <Shield className="w-5 h-5" />,
    },
    {
      name: "Child Helpline",
      number: "1098",
      type: "Child Safety",
      icon: <Users className="w-5 h-5" />,
    },
  ];

  const cycloneCategories = [
    {
      category: "Depression",
      windSpeed: "Up to 61 km/h",
      action: "Monitor conditions",
      color: "bg-yellow-500",
    },
    {
      category: "Cyclonic Storm",
      windSpeed: "62-88 km/h",
      action: "Prepare for impact",
      color: "bg-orange-500",
    },
    {
      category: "Severe Cyclone",
      windSpeed: "89-117 km/h",
      action: "Evacuate coastal areas",
      color: "bg-red-500",
    },
    {
      category: "Very Severe",
      windSpeed: "118-221 km/h",
      action: "Immediate evacuation",
      color: "bg-red-700",
    },
    {
      category: "Super Cyclone",
      windSpeed: "222+ km/h",
      action: "Emergency shelter",
      color: "bg-purple-700",
    },
  ];

  const safetyChecklist = [
    {
      item: "Emergency kit prepared (water, food, medicines)",
      priority: "HIGH",
      checked: false,
    },
    {
      item: "Important documents secured in waterproof container",
      priority: "HIGH",
      checked: false,
    },
    {
      item: "Mobile phones fully charged + power bank",
      priority: "HIGH",
      checked: false,
    },
    {
      item: "Family emergency plan discussed",
      priority: "MEDIUM",
      checked: false,
    },
    { item: "Evacuation route identified", priority: "HIGH", checked: false },
    { item: "Emergency contacts saved", priority: "MEDIUM", checked: false },
    {
      item: "Vehicle fueled (if applicable)",
      priority: "MEDIUM",
      checked: false,
    },
    {
      item: "Home secured (windows, doors)",
      priority: "MEDIUM",
      checked: false,
    },
  ];

  const historicalData = [
    {
      name: "Cyclone Fani (2019)",
      impact: "3 million evacuated",
      damage: "$4.2B",
      lessons: "Early warning system saved thousands of lives",
      preparedness: "96% evacuation success rate",
    },
    {
      name: "Cyclone Amphan (2020)",
      impact: "5 million affected",
      damage: "$13.2B",
      lessons: "Infrastructure damage extensive in urban areas",
      preparedness: "COVID-19 complicated shelter management",
    },
    {
      name: "Cyclone Biparjoy (2023)",
      impact: "180,000 evacuated",
      damage: "$2.8B",
      lessons: "Accurate 5-day forecasts enabled timely action",
      preparedness: "Zero casualties due to early warnings",
    },
  ];

  const nearbyResources = [
    {
      name: "Community Relief Center",
      distance: "2.1 km",
      capacity: "500 people",
      status: "Available",
    },
    {
      name: "District Hospital",
      distance: "3.5 km",
      capacity: "Emergency services",
      status: "Operational",
    },
    {
      name: "Government School Shelter",
      distance: "1.8 km",
      capacity: "300 people",
      status: "Preparing",
    },
    {
      name: "Fire Station",
      distance: "2.7 km",
      capacity: "Rescue services",
      status: "On standby",
    },
  ];

  const TabButton = ({ id, label, icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
        active
          ? "bg-blue-600 text-white shadow-lg"
          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-red-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 animate-pulse" />
            <div>
              <h1 className="text-2xl font-bold">Emergency & Safety Center</h1>
              <p className="text-red-100">Location: {userLocation}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-mono">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-sm text-red-100">
              {currentTime.toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          <TabButton
            id="immediate"
            label="Immediate Action"
            icon={<AlertTriangle className="w-5 h-5" />}
            active={activeTab === "immediate"}
            onClick={setActiveTab}
          />
          <TabButton
            id="contacts"
            label="Emergency Contacts"
            icon={<Phone className="w-5 h-5" />}
            active={activeTab === "contacts"}
            onClick={setActiveTab}
          />
          <TabButton
            id="preparation"
            label="Preparation Guide"
            icon={<Shield className="w-5 h-5" />}
            active={activeTab === "preparation"}
            onClick={setActiveTab}
          />
          <TabButton
            id="resources"
            label="Local Resources"
            icon={<MapPin className="w-5 h-5" />}
            active={activeTab === "resources"}
            onClick={setActiveTab}
          />
          <TabButton
            id="history"
            label="Case Studies"
            icon={<Clock className="w-5 h-5" />}
            active={activeTab === "history"}
            onClick={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        {activeTab === "immediate" && (
          <div className="space-y-6">
            {/* Current Risk Level */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-xl shadow-xl">
              <div className="flex items-center space-x-4">
                <AlertTriangle className="w-12 h-12 text-white" />
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    HIGH RISK DETECTED
                  </h3>
                  <p className="text-red-100">
                    Immediate action required - Strong cyclonic activity
                    detected
                  </p>
                </div>
              </div>
            </div>

            {/* Immediate Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Zap className="w-6 h-6 mr-2 text-yellow-400" />
                  Immediate Actions
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>
                      Move to higher ground immediately if in
                      coastal/flood-prone areas
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>
                      Charge all devices and prepare backup power sources
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Secure loose outdoor items and board up windows</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>
                      Stay indoors and monitor official communications
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-800 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Car className="w-6 h-6 mr-2 text-blue-400" />
                  Evacuation Info
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <p className="font-medium">Evacuation Order: ACTIVE</p>
                    <p className="text-sm text-blue-100">
                      Coastal areas within 5km of shoreline
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p>
                      <strong>Route:</strong> Highway NH-48 towards inland
                      shelters
                    </p>
                    <p>
                      <strong>Transport:</strong> Government buses available at
                      community centers
                    </p>
                    <p>
                      <strong>Deadline:</strong> Next 6 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cyclone Category Guide */}
            <div className="bg-slate-800 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">
                Cyclone Categories & Response
              </h3>
              <div className="grid md:grid-cols-5 gap-4">
                {cycloneCategories.map((cat, index) => (
                  <div key={index} className="text-center">
                    <div className={`${cat.color} p-3 rounded-lg mb-2`}>
                      <div className="font-bold text-white">{cat.category}</div>
                      <div className="text-sm text-white opacity-90">
                        {cat.windSpeed}
                      </div>
                    </div>
                    <div className="text-sm text-slate-300">{cat.action}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "contacts" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {emergencyContacts.map((contact, index) => (
                <div
                  key={index}
                  className="bg-slate-800 p-6 rounded-xl hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-red-600 rounded-lg">
                      {contact.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{contact.name}</h3>
                      <p className="text-sm text-slate-400">{contact.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-400">
                      {contact.number}
                    </span>
                    <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors">
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-800 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">
                Quick Emergency SMS
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <button className="bg-red-600 hover:bg-red-700 p-4 rounded-lg transition-colors text-left">
                  <h4 className="font-semibold">Send Location to Family</h4>
                  <p className="text-sm text-red-100">
                    Automatically sends your location to emergency contacts
                  </p>
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 p-4 rounded-lg transition-colors text-left">
                  <h4 className="font-semibold">Request Help</h4>
                  <p className="text-sm text-blue-100">
                    Sends distress signal to local authorities
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "preparation" && (
          <div className="space-y-6">
            <div className="bg-slate-800 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">
                Emergency Preparedness Checklist
              </h3>
              <div className="space-y-3">
                {safetyChecklist.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="text-white">{item.item}</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded text-xs ${
                          item.priority === "HIGH"
                            ? "bg-red-600"
                            : "bg-yellow-600"
                        }`}
                      >
                        {item.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Home className="w-6 h-6 mr-2 text-green-400" />
                  Home Preparation
                </h3>
                <ul className="space-y-2 text-slate-300">
                  <li>• Secure outdoor furniture and decorations</li>
                  <li>• Install storm shutters or board up windows</li>
                  <li>• Clear gutters and drains</li>
                  <li>• Check and secure roof tiles</li>
                  <li>• Trim trees near your home</li>
                </ul>
              </div>

              <div className="bg-slate-800 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-blue-400" />
                  Family Planning
                </h3>
                <ul className="space-y-2 text-slate-300">
                  <li>• Create family communication plan</li>
                  <li>• Identify meeting points</li>
                  <li>• Prepare emergency supplies for each person</li>
                  <li>• Plan for pets</li>
                  <li>• Practice evacuation routes</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "resources" && (
          <div className="space-y-6">
            <div className="bg-slate-800 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <MapPin className="w-6 h-6 mr-2 text-red-400" />
                Nearby Emergency Resources
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {nearbyResources.map((resource, index) => (
                  <div key={index} className="bg-slate-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{resource.name}</h4>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          resource.status === "Available"
                            ? "bg-green-600"
                            : resource.status === "Operational"
                            ? "bg-blue-600"
                            : "bg-yellow-600"
                        }`}
                      >
                        {resource.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mb-2">
                      {resource.capacity}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">
                        {resource.distance}
                      </span>
                      <a
                        href={`https://www.google.com/maps/search/${encodeURIComponent(
                          resource.name + " " + userLocation
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 flex items-center"
                      >
                        Get Directions <ChevronRight className="w-4 h-4 ml-1" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Interactive Map</h3>
              <div className="rounded-lg overflow-hidden shadow-lg">
                {" "}
                <EmergencyMap />{" "}
              </div>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-6">
            {historicalData.map((cyclone, index) => (
              <div key={index} className="bg-slate-800 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 text-blue-400">
                  {cyclone.name}
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="bg-slate-700 p-4 rounded-lg text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                    <p className="text-sm text-slate-300">Impact</p>
                    <p className="font-semibold">{cyclone.impact}</p>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg text-center">
                    <div className="text-2xl mb-2">💰</div>
                    <p className="text-sm text-slate-300">Damage</p>
                    <p className="font-semibold">{cyclone.damage}</p>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg text-center">
                    <Shield className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <p className="text-sm text-slate-300">Preparedness</p>
                    <p className="font-semibold text-sm">
                      {cyclone.preparedness}
                    </p>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg text-center">
                    <Info className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <p className="text-sm text-slate-300">Key Learning</p>
                    <p className="font-semibold text-sm">{cyclone.lessons}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyInfo;
