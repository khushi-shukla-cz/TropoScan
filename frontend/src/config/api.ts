// API Configuration for TropoScan
// For single-service deployment, use relative URLs or same domain
export const API_BASE_URL = import.meta.env.VITE_API_URL || (
  // In production (Render), use same domain. In development, use localhost:5000
  import.meta.env.PROD ? '' : 'http://localhost:5000'
);

// API Endpoints
export const API_ENDPOINTS = {
  health: `${API_BASE_URL}/api/health`,
  detect: `${API_BASE_URL}/api/detect`,
  sampleImages: `${API_BASE_URL}/api/sample-images`,
  sample: (id: string) => `${API_BASE_URL}/api/sample/${id}`,
  modelInfo: `${API_BASE_URL}/api/model-info`,
  caseStudies: `${API_BASE_URL}/api/case-studies`,
  caseStudy: (id: string) => `${API_BASE_URL}/api/case-study/${id}`,
  uploadCaseStudy: `${API_BASE_URL}/api/upload-case-study`,
  samplePreview: (id: string) => `${API_BASE_URL}/api/sample/${id}/preview`,
};