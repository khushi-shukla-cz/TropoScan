import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Wind, Calendar, TrendingUp, CheckCircle, AlertTriangle, Upload } from 'lucide-react';

interface CaseStudy {
  id: string;
  name: string;
  date: string;
  severity: string;
  early_detection_hours: number;
  location: string;
  description: string;
}

interface CaseStudyResult {
  success: boolean;
  risk_data: any;
  overlay_image: string;
  processed_image: string;
  case_study: {
    name: string;
    date: string;
    ai_detection_time: string;
    imd_alert_time: string;
    early_detection_hours: number;
    actual_landfall: string;
    severity: string;
    wind_speed: string;
    location: string;
    validation_message: string;
    proof_statement: string;
    image_filename?: string;
    model_type?: string;
  };
  model_type: string;
}

const CycloneCaseStudy: React.FC = () => {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [result, setResult] = useState<CaseStudyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCases, setLoadingCases] = useState(true);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string>('');

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  const fetchCaseStudies = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/case-studies');
      const data = await response.json();
      setCaseStudies(data.case_studies);
    } catch (error) {
      console.error('Error fetching case studies:', error);
    } finally {
      setLoadingCases(false);
    }
  };

  const processCaseStudy = async (caseId: string) => {
    setLoading(true);
    setSelectedCase(caseId);
    try {
      const response = await fetch(`http://localhost:5000/api/case-study/${caseId}`, {
        method: 'POST'
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error processing case study:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear previous results
      setResult(null);
      setSelectedCase(null);
    }
  };

  const processUploadedImage = async () => {
    if (!uploadedImage) return;
    
    setLoading(true);
    setSelectedCase('uploaded');
    
    try {
      const formData = new FormData();
      formData.append('image', uploadedImage);
      
      const response = await fetch('http://localhost:5000/api/upload-case-study', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error processing uploaded image:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    if (severity.includes('Extremely Severe')) return 'bg-red-600';
    if (severity.includes('Very Severe')) return 'bg-red-500';
    if (severity.includes('Severe')) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  const getRiskLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'text-red-400 bg-red-900/20 border-red-400/30';
      case 'moderate': return 'text-orange-400 bg-orange-900/20 border-orange-400/30';
      case 'low': return 'text-green-400 bg-green-900/20 border-green-400/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-400/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <TrendingUp className="mr-3 h-8 w-8 text-pink-400" />
              🌪️ Real Cyclone Case Study
            </CardTitle>
            <p className="text-gray-300">
              Prove the AI model works on real satellite images. Upload your own or use historical cyclone data.
              <br />
              <strong>Shows:</strong> Image → Mask output, AI detection vs IMD timing, and early warning proof.
            </p>
            <div className="mt-3 p-3 bg-pink-900/20 border border-pink-400/30 rounded-lg">
              <p className="text-pink-200 font-medium">
                📈 Now your "2+ hour early detection" has teeth.
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* Upload Custom Image */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Upload className="mr-2 h-6 w-6 text-blue-400" />
              Upload New Satellite Image
            </CardTitle>
            <p className="text-gray-300 text-sm">
              Upload your own IR satellite image to generate a real-time case study with AI detection analysis
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-gray-300">
                    Click to upload satellite image (JPG, PNG)
                  </span>
                  <span className="text-gray-500 text-sm">
                    Best results with INSAT-3D IR images
                  </span>
                </label>
              </div>
              
              {uploadedImage && (
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium">Ready to analyze: {uploadedImage.name}</span>
                    <Button
                      onClick={processUploadedImage}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {loading && selectedCase === 'uploaded' ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        'Generate Case Study'
                      )}
                    </Button>
                  </div>
                  <img
                    src={uploadedImagePreview}
                    alt="Uploaded satellite image"
                    className="w-full max-w-md mx-auto rounded border"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Historical Case Studies */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Historical Cyclone Cases</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingCases ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading case studies...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {caseStudies.map((caseStudy) => (
                  <Card key={caseStudy.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-medium">{caseStudy.name}</h3>
                          <Badge className={getSeverityColor(caseStudy.severity)}>
                            {caseStudy.severity.includes('Extremely') ? 'Extreme' : 
                             caseStudy.severity.includes('Very') ? 'Very Severe' : 'Severe'}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-300">
                            <Calendar className="h-4 w-4 mr-2" />
                            {caseStudy.date}
                          </div>
                          <div className="flex items-center text-gray-300">
                            <MapPin className="h-4 w-4 mr-2" />
                            {caseStudy.location}
                          </div>
                          <div className="flex items-center text-pink-300">
                            <Clock className="h-4 w-4 mr-2" />
                            +{caseStudy.early_detection_hours} hours early
                          </div>
                        </div>
                        <Button 
                          onClick={() => processCaseStudy(caseStudy.id)}
                          disabled={loading}
                          className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                        >
                          {loading && selectedCase === caseStudy.id ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Analyzing...
                            </div>
                          ) : (
                            'Analyze Case Study'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Display */}
        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image Analysis */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CheckCircle className="mr-2 h-6 w-6 text-green-400" />
                  Image → Mask Output
                  {result.case_study?.image_filename && (
                    <Badge className="ml-2 bg-green-600 text-white text-xs">
                      {selectedCase === 'uploaded' ? 'Your Image' : 'Real Satellite'}: {result.case_study.image_filename}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Original IR Image</h4>
                    <div className="bg-black/20 rounded-lg p-2">
                      <img 
                        src={`data:image/png;base64,${result.processed_image}`}
                        alt="Original satellite image"
                        className="w-full rounded"
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">AI Detection Mask</h4>
                    <div className="bg-black/20 rounded-lg p-2">
                      <img 
                        src={`data:image/png;base64,${result.overlay_image}`}
                        alt="AI detection mask"
                        className="w-full rounded"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getRiskLevelColor(result.risk_data.risk_level)}`}>
                    Risk Level: {result.risk_data.risk_level.toUpperCase()}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-200">Model Type:</span>
                    <Badge className="bg-blue-600 text-white">
                      {result.model_type === 'real_pytorch' ? 'Real PyTorch U-Net' : 'Demo Model'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timing Analysis */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="mr-2 h-6 w-6 text-pink-400" />
                  Detection Timeline Validation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-green-200">🤖 AI Detection Time:</span>
                      <span className="text-white font-mono">{result.case_study.ai_detection_time}</span>
                    </div>
                  </div>
                  
                  <div className="bg-orange-900/20 border border-orange-400/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-orange-200">🏛️ IMD Alert Time:</span>
                      <span className="text-white font-mono">{result.case_study.imd_alert_time}</span>
                    </div>
                  </div>
                  
                  <div className="bg-pink-900/20 border border-pink-400/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-pink-200">⚡ Early Detection:</span>
                      <span className="text-white font-bold text-lg">+{result.case_study.early_detection_hours} Hours</span>
                    </div>
                  </div>

                  {/* Exact Format from Requirements */}
                  <div className="bg-indigo-900/20 border border-indigo-400/30 rounded-lg p-4 mt-4">
                    <h4 className="text-indigo-200 font-semibold mb-2">📋 Proof Statement:</h4>
                    <div className="text-center text-white font-mono text-lg bg-black/30 rounded p-3">
                      "Detected at {result.case_study.ai_detection_time} | IMD Alerted at {result.case_study.imd_alert_time}"
                    </div>
                    <p className="text-indigo-200 text-center mt-2 text-sm">
                      ✅ <strong>{result.case_study.early_detection_hours}+ hour early detection</strong> capability proven
                    </p>
                  </div>
                </div>

                <div className="bg-gray-900/20 border border-gray-400/30 rounded-lg p-3">
                  <p className="text-gray-300 text-sm">
                    {result.case_study.validation_message}
                  </p>
                </div>
                
                <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-3">
                  <p className="text-green-200 text-sm font-medium">
                    {result.case_study.proof_statement}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Analysis */}
        {result && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">
                {result.case_study.name} - Detailed Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="text-pink-400 font-medium">Cyclone Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date:</span>
                      <span className="text-white">{result.case_study.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Severity:</span>
                      <span className="text-white">{result.case_study.severity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Wind Speed:</span>
                      <span className="text-white">{result.case_study.wind_speed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Location:</span>
                      <span className="text-white">{result.case_study.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-blue-400 font-medium">AI Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Confidence:</span>
                      <span className="text-white">{result.risk_data.confidence}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Coverage:</span>
                      <span className="text-white">{result.risk_data.coverage_percent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cluster Area:</span>
                      <span className="text-white">{result.risk_data.cluster_area} km²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Temperature:</span>
                      <span className="text-white">{result.risk_data.temperature}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-green-400 font-medium">Validation</h4>
                  <div className="text-sm text-gray-300">
                    <p>{result.risk_data.prediction}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CycloneCaseStudy;
