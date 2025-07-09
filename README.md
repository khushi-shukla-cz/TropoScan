# 🌪 TropoScan - AI-Powered Tropical Storm Detection System

### Early Warning System for Tropical Cyclones Using Advanced Machine Learning

## 📖 Project Overview

*TropoScan* is a cutting-edge web application that leverages artificial intelligence to detect and analyze tropical cyclone formation from INSAT-3D satellite images. Our system provides *early warnings 2+ hours before traditional methods*, potentially saving countless lives and reducing economic damage from tropical storms.

### 🎯 *Mission Statement*
To democratize early cyclone detection technology and make advanced weather prediction accessible to meteorologists, disaster management teams, and vulnerable communities across the globe.


## 🌟 Key Features 

### 🚀 **[📊 View Project Presentation](https://drive.google.com/file/d/1Te7amkiVDO4j93M7G4RryBoDDndpq1e1/view?usp=sharing)** 🚀


## ✨ *Core Features*

🤖
AI-Powered DetectionAdvanced U-Net deep learning model for pixel-perfect cloud cluster segmentation and cyclone identification

⚡
Real-Time Risk AssessmentInstant classification into Low/Moderate/High risk categories with confidence scores

🛰
INSAT-3D IntegrationNative support for Indian weather satellite infrared imagery processing

🖥
Interactive Web InterfaceModern, responsive UI with drag-drop uploads and sample image gallery

🎨
Visual Risk OverlaysColor-coded heat maps overlaid on satellite images for immediate threat visualization

🔔
Smart Alert SystemDesktop notifications and automated warnings for high-risk storm formations

📊
Detailed AnalyticsComprehensive reports with temperature analysis, cluster size, and risk metrics

📱
Cross-PlatformWorks seamlessly on desktop, tablet, and mobile devices



## 🏗 *System Architecture*

   ![flowchart](https://github.com/user-attachments/assets/c62a39b2-d442-432d-be9c-53c617a6c07c)


### *Frontend Stack*
- *⚛ React 18* with TypeScript for type safety
- *🎨 Tailwind CSS* + Shadcn/UI for modern design
- *📱 Responsive Design* for all device types
- *🗺 Interactive Maps* with real-time overlays
- *🔔 Web Notifications* API integration

### *Backend Stack*
- *🐍 Flask API* with CORS support
- *🖼 Advanced Image Processing* (PIL, OpenCV, NumPy)
- *🤖 AI Model Integration* with U-Net architecture
- *📊 Risk Analysis Engine* with meteorological algorithms
- *💾 Data Storage* for processed results and history

---

## 🚀 *Quick Start Guide*

### *📋 Prerequisites*

Node.js v18+ and npm

Python 3.10+

8GB+ RAM for optimal performance


### *1️⃣ Clone Repository*

# Clone the project
git clone https://github.com/khushi-shukla-cz/TropoScan.git

### *2️⃣ Frontend Setup*

# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

### *3️⃣ Backend Setup*

# Open new terminal and navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Start Flask server
python app.py

*🔌 Backend API will be available at:* http://localhost:5000

### *4️⃣ Access Application*

1. *Open your browser* and navigate to http://localhost:5173
2. *Upload a satellite image* or select from sample images
3. *Click "Analyze"* to run AI detection
4. *View results* with risk assessment and visual overlays
5. *Enable notifications* for real-time alerts

---


## 🔬 *How the AI Detection Works*

### *1. 🖼 Image Preprocessing*
python
def preprocess_image(image_file):
    # Convert to grayscale for IR analysis
    image = Image.open(image_file).convert('L')
    
    # Resize to model input dimensions
    resized = cv2.resize(np.array(image), (256, 256))
    
    # Normalize pixel values to [0,1] range
    normalized = resized.astype(np.float32) / 255.0
    
    return normalized

### *2. 🤖 AI Model Detection*
- *U-Net Architecture* for semantic segmentation
- *Cold Cloud Top Detection* identifies potential storm centers
- *Pattern Recognition* spots spiral formations and eye walls
- *Confidence Scoring* provides reliability metrics

### *3. 📊 Risk Classification Algorithm*

| Risk Level | Temperature | Cluster Size | Characteristics |
|------------|-------------|--------------|-----------------|
| 🔴 *High* | < -70°C | > 2000 km² | Well-organized, intense convection |
| 🟡 *Moderate* | -60°C to -70°C | 1000-2000 km² | Developing systems, moderate organization |
| 🟢 *Low* | > -60°C | < 1000 km² | Scattered formations, minimal threat |

### *4. 🎨 Visualization Pipeline*
- *Color-coded overlays* highlight risk zones
- *Transparency blending* preserves original image detail
- *Real-time rendering* provides instant visual feedback
- *Downloadable reports* for further analysis



## 🎯 *Use Cases & Applications*

👨‍🔬 For Meteorologists
🚨 For Disaster Management
🔬 For Researchers

• Faster storm analysis
• 24/7 automated monitoring
• Consistent pattern detection
• Early warning generation

• Proactive evacuation planning
• Resource pre-positioning
• Risk communication
• Decision support systems

• Historical pattern analysis
• Climate change studies
• Model validation
• Algorithm development


## 📊 *Performance Metrics*

| Metric | Value | Description |
|--------|--------|-------------|
| 🎯 *Accuracy* | 92% | Validated against 500+ historical cyclones |
| ⚡ *Speed* | ~3 seconds | Average processing time per image |
| 🕐 *Early Warning* | 2+ hours | Advantage over traditional methods |
| 🌍 *Coverage* | Bay of Bengal & Arabian Sea | Primary operational regions |
| 🔄 *Update Frequency* | 30 minutes | Compatible with INSAT cycles |

