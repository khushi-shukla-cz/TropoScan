import React, { useState } from "react";
import {
  Phone,
  Shield,
  Heart,
  Users,
  Zap,
  Car,
  MapPin,
  Clock,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import EmergencyNavbar from "@/components/EmergencyNavbar";

const EmergencyContacts = () => {
  const [copiedNumber, setCopiedNumber] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const emergencyContacts = [
    {
      name: "NDMA India",
      number: "1078",
      type: "National Disaster Management",
      icon: <Shield className="w-5 h-5" />,
      priority: "critical",
      description: "24/7 National emergency coordination",
    },
    {
      name: "Emergency Services",
      number: "108",
      type: "Medical/Fire/Police",
      icon: <Heart className="w-5 h-5" />,
      priority: "critical",
      description: "All emergency medical services",
    },
    {
      name: "Coast Guard",
      number: "1554",
      type: "Maritime Emergency",
      icon: <Users className="w-5 h-5" />,
      priority: "high",
      description: "Marine rescue and coordination",
    },
    {
      name: "Women Helpline",
      number: "1091",
      type: "Women Safety",
      icon: <Heart className="w-5 h-5" />,
      priority: "high",
      description: "24/7 women emergency support",
    },
    {
      name: "Traffic Police",
      number: "103",
      type: "Traffic Control",
      icon: <Car className="w-5 h-5" />,
      priority: "medium",
      description: "Road emergency and traffic control",
    },
    {
      name: "Power Emergency",
      number: "1912",
      type: "Electricity",
      icon: <Zap className="w-5 h-5" />,
      priority: "medium",
      description: "Electrical emergency services",
    },
  ];

  const localEmergencyServices = [
    {
      name: "Mumbai Control Room",
      number: "022-22621855",
      type: "Local Control Room",
      area: "Mumbai Metropolitan",
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      name: "Pune Control Room",
      number: "020-26123601",
      type: "Local Control Room",
      area: "Pune District",
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      name: "Thane Control Room",
      number: "022-25346861",
      type: "Local Control Room",
      area: "Thane District",
      icon: <MapPin className="w-5 h-5" />,
    },
  ];

  // const copyToClipboard = async (number, name) => {
  //   try {
  //     await navigator.clipboard.writeText(number);
  //     setCopiedNumber(number);
  //     toast({
  //       title: "Copied to clipboard",
  //       description: `${name}: ${number}`,
  //     });
  //     setTimeout(() => setCopiedNumber(null), 2000);
  //   } catch (err) {
  //     toast({
  //       title: "Failed to copy",
  //       description: "Please copy the number manually",
  //       variant: "destructive",
  //     });
  //   }
  // };

  const makeCall = (number) => {
    window.location.href = `tel:${number}`;
  };

  // const getPriorityColor = (priority) => {
  //   switch (priority) {
  //     case "critical":
  //       return "border-red-500 bg-red-950/30";
  //     case "high":
  //       return "border-orange-500 bg-orange-950/30";
  //     case "medium":
  //       return "border-yellow-500 bg-yellow-950/30";
  //     default:
  //       return "border-blue-500 bg-blue-950/30";
  //   }
  // };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "high":
        return <Badge className="bg-orange-600">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-600">Medium</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      {/* Fixed Emergency Navigation */}
      <EmergencyNavbar currentPage="contacts" />

      <div className="container mx-auto px-4 py-8">
        {/* Critical Alert */}
        {/* <Card className="mb-8 border-red-500 bg-red-950/50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Emergency Situation Active</h3>
                <p className="text-gray-300">Keep these numbers handy and ensure your phone is charged</p>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* National Emergency Services */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Shield className="w-6 h-6 mr-2 text-blue-400" />
            National Emergency Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emergencyContacts.map((contact, index) => (
              <Card
                key={index}
                className={`transition-all duration-300 hover:scale-105 border-2 border-yellow-500/30 bg-blue-950/20 `}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {contact.icon}
                      <CardTitle className="text-lg text-white">
                        {contact.name}
                      </CardTitle>
                    </div>
                    {getPriorityBadge(contact.priority)}
                  </div>
                  <p className="text-gray-300 text-sm">{contact.type}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-400 text-sm">
                      {contact.description}
                    </p>
                    <div className="flex items-center justify-between bg-black/20 p-3 rounded-lg">
                      <span className="text-2xl font-mono font-bold text-white">
                        {contact.number}
                      </span>
                      <div className="flex space-x-2">
                        {/* <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            copyToClipboard(contact.number, contact.name)
                          }
                          className="border-gray-500"
                        >
                          {copiedNumber === contact.number ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button> */}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => makeCall(contact.number)}
                          className="bg-green-600 hover:bg-green-300"
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Local Emergency Services */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <MapPin className="w-6 h-6 mr-2 text-green-400" />
            Regional Emergency Control Rooms
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localEmergencyServices.map((service, index) => (
              <Card
                key={index}
                className="transition-all duration-300 hover:scale-105 border-2 border-green-500/30 bg-green-950/20"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    {service.icon}
                    <CardTitle className="text-lg text-white">
                      {service.name}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between bg-black/20 p-3 rounded-lg">
                    <span className="text-lg font-mono font-bold text-white">
                      {service.number}
                    </span>
                    <div className="flex space-x-2">
                      {/* <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          copyToClipboard(service.number, service.name)
                        }
                        className="border-gray-500"
                      >
                        {copiedNumber === service.number ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button> */}
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => makeCall(service.number)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <Card className="border-2 border-blue-500/30 bg-blue-950/30 shadow-lg max-w-5xl mx-auto mt-8">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-blue-400 text-2xl font-bold">
              <Clock className="w-6 h-6 mr-3" />
              Emergency Call Tips
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 px-8 pb-8">
            <div className="grid md:grid-cols-2 gap-8 ">
              {/* Left Column */}
              <div className="space-y-4 pt-4 pl-8 ">
                <p className="text-white text-lg font-semibold">
                  When calling emergency services:
                </p>
                <ul className="text-gray-300 text-base space-y-2 list-inside list-[square]">
                  <li>Stay calm and speak clearly</li>
                  <li>Provide your exact location</li>
                  <li>Describe the emergency situation</li>
                  <li>Follow the operator's instructions</li>
                </ul>
              </div>

              {/* Right Column */}
              <div className="space-y-4 pl-8 pt-4 ">
                <p className="text-white text-lg font-semibold">
                  Information to have ready:
                </p>
                <ul className="text-gray-300 text-base space-y-2 list-[square] list-inside ">
                  <li>Your name and phone number</li>
                  <li>Number of people involved</li>
                  <li>Any medical conditions</li>
                  <li>Nearest landmarks or address</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmergencyContacts;
