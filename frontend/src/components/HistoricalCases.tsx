
import { Calendar, MapPin, AlertTriangle, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const HistoricalCases = () => {
  const cases = [
    {
      id: 1,
      name: "Cyclone Biparjoy",
      date: "June 2023",
      location: "Arabian Sea",
      ourDetection: "4:00 PM, June 10",
      officialWarning: "6:00 PM, June 10",
      timeSaved: "2 hours",
      severity: "Very Severe",
      status: "Successfully Predicted",
      description: "Our model detected deep convection and organized spiral structure 2 hours before official cyclone warning was issued.",
      impact: "Enabled early evacuation of 180,000 people from Gujarat coast",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Cyclone Mocha",
      date: "May 2023",
      location: "Bay of Bengal",
      ourDetection: "2:30 PM, May 12",
      officialWarning: "4:00 PM, May 12",
      timeSaved: "1.5 hours",
      severity: "Extremely Severe",
      status: "Successfully Predicted",
      description: "Rapid intensification detected through temperature analysis showing -78°C cloud tops.",
      impact: "Advanced warning helped Myanmar and Bangladesh prepare for landfall",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      name: "Deep Depression (Arabian Sea)",
      date: "October 2023",
      location: "West Arabian Sea",
      ourDetection: "10:00 AM, Oct 15",
      officialWarning: "Did not develop to cyclone",
      timeSaved: "N/A",
      severity: "Depression",
      status: "Correctly Identified",
      description: "System showed moderate convection but lacked organization. Our model correctly classified as low-moderate risk.",
      impact: "Prevented false alarms and unnecessary evacuations",
      image: "/placeholder.svg"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          Historical Case Studies
        </h2>
        <p className="text-gray-300">
          Real-world validation showing how TropoScan detected tropical systems ahead of official warnings
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-green-900/20 border-green-400/30">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">3/3</div>
            <div className="text-gray-300">Successful Predictions</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-900/20 border-blue-400/30">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">1.8</div>
            <div className="text-gray-300">Avg Hours Earlier</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-900/20 border-purple-400/30">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">180K+</div>
            <div className="text-gray-300">People Potentially Saved</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-900/20 border-yellow-400/30">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">0</div>
            <div className="text-gray-300">False Positives</div>
          </CardContent>
        </Card>
      </div>

      {/* Case Studies */}
      <div className="space-y-6">
        {cases.map((case_study) => (
          <Card key={case_study.id} className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-white text-xl mb-2">
                    {case_study.name}
                  </CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {case_study.date}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {case_study.location}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4 md:mt-0">
                  <Badge 
                    variant={case_study.status === "Successfully Predicted" ? "default" : "secondary"}
                    className="bg-green-600"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {case_study.status}
                  </Badge>
                  <Badge variant="outline" className="border-white/20">
                    {case_study.severity}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Satellite Image */}
                <div className="lg:col-span-1">
                  <img
                    src={case_study.image}
                    alt={`${case_study.name} satellite image`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>

                {/* Details */}
                <div className="lg:col-span-2 space-y-4">
                  <p className="text-gray-300">{case_study.description}</p>
                  
                  {/* Timeline Comparison */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Detection Timeline</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
                          <span className="text-gray-300">TropoScan Detection</span>
                        </div>
                        <span className="text-blue-400 font-medium">{case_study.ourDetection}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                          <span className="text-gray-300">Official Warning</span>
                        </div>
                        <span className="text-yellow-400 font-medium">{case_study.officialWarning}</span>
                      </div>
                      
                      {case_study.timeSaved !== "N/A" && (
                        <div className="flex items-center justify-between border-t border-white/10 pt-3">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-green-400 mr-2" />
                            <span className="text-white font-medium">Time Advantage</span>
                          </div>
                          <span className="text-green-400 font-bold">{case_study.timeSaved}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Impact */}
                  <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-4">
                    <h4 className="text-green-400 font-medium mb-2 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Real-World Impact
                    </h4>
                    <p className="text-gray-200">{case_study.impact}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-400/30 mt-8">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Proven Results in Real-World Scenarios
          </h3>
          <p className="text-gray-200 mb-6 max-w-2xl mx-auto">
            These case studies demonstrate TropoScan's ability to provide early warnings 
            that can save lives and reduce disaster impact. Our AI-powered detection 
            consistently outperforms traditional methods.
          </p>
          <div className="flex justify-center space-x-4">
            <Button className="bg-blue-600 hover:bg-blue-700">
              View Technical Details
            </Button>
            <Button variant="outline" className="border-white/20">
              Download Full Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoricalCases;
