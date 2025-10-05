# Harassment Detector AI Application

A modern web application that uses AI models to detect and analyze harassment and misogynistic content in text. This tool helps users identify potentially harmful content through advanced natural language processing techniques.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Setup and Installation](#setup-and-installation)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Model Information](#model-information)
- [Development](#development)
- [Deployment](#deployment)
- [License](#license)

## 🔍 Overview

Harassment Detector is a full-stack application designed to analyze text for harassment and misogynistic content. It uses pre-trained NLP models to detect potentially harmful language, providing detailed analysis and risk assessments for both individual text inputs and batch file processing.

The application provides a modern, responsive UI for analyzing text inputs, uploading files for batch analysis, and visualizing the results with interactive components.

## ✨ Features

### Text Analysis
- Real-time analysis of input text
- Detection of harassment and misogynistic content
- Detailed toxicity scoring for different categories
- Risk level categorization (low, medium, high, critical)

### File Upload & Batch Analysis
- Support for CSV and TXT file formats
- Batch processing of multiple text entries
- Statistical breakdown of analysis results
- Visual representation of toxicity distribution

### User Interface
- Modern, intuitive design
- Interactive visualization of analysis results
- Progress indicators for batch operations
- Responsive layout for desktop and mobile

### API Features
- RESTful endpoints for single and batch text analysis
- Health check and model information endpoints
- Comprehensive error handling
- Detailed documentation

## 📁 Project Structure

```
/
├── backend/                  # Python Flask backend
│   ├── api/                  # API implementation
│   │   ├── app.py            # Flask application setup
│   │   ├── routes.py         # API endpoints
│   │   ├── predictor.py      # AI model integration
│   │   └── mock_predictor.py # Mock implementation for testing
│   ├── config/               # Configuration settings
│   ├── data/                 # Data processing utilities
│   ├── models/               # ML model definitions
│   │   ├── base_model.py     # Base model class
│   │   ├── harassment_model/ # Harassment detection model
│   │   └── misogyny_model/   # Misogyny detection model
│   ├── scripts/              # Utility scripts
│   ├── tests/                # Backend tests
│   ├── training/             # Model training code
│   └── requirements.txt      # Python dependencies
│
└── frontend/                 # React/TypeScript frontend
    ├── public/               # Static assets
    ├── src/                  # Source code
    │   ├── assets/           # Images and resources
    │   ├── components/       # React components
    │   │   └── ui/           # Reusable UI components
    │   ├── config/           # Frontend configuration
    │   ├── contexts/         # React contexts
    │   ├── hooks/            # Custom hooks
    │   ├── lib/              # Utility functions
    │   ├── services/         # API client services
    │   ├── styles/           # CSS styles
    │   ├── types/            # TypeScript type definitions
    │   ├── utils/            # Helper utilities
    │   ├── App.tsx           # Main application component
    │   └── main.tsx          # Application entry point
    ├── package.json          # Frontend dependencies
    └── tsconfig.json         # TypeScript configuration
```

## 🛠️ Technology Stack

### Backend
- **Python 3.8+**
- **Flask**: Web framework
- **HuggingFace Transformers**: NLP models (RoBERTa)
- **NumPy/Pandas**: Data processing
- **PyTorch**: Deep learning framework

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type-safe JavaScript
- **Vite**: Build tool
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animations
- **Shadcn UI**: Component library

## 🚀 Setup and Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn
- Git

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/harassment-detector.git
   cd harassment-detector
   ```

2. Set up Python environment:
   ```bash
   cd backend
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux/macOS
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the backend server:
   ```bash
   python run_server.py
   ```
   The API server will run at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The frontend will run at `http://localhost:5173`

## 📖 Usage Guide

### Text Analysis

1. Open the application in your browser
2. Navigate to the "Text Analysis" section
3. Enter or paste the text you want to analyze
4. Click "Analyze Text"
5. Review the results:
   - Overall risk level
   - Harassment detection score
   - Misogyny detection score
   - Flagged categories (if applicable)

### File Upload & Batch Analysis

1. Navigate to the "File Upload" section
2. Prepare your CSV or TXT file with one text entry per line
3. Drag and drop your file or click to select
4. Click "Upload and Analyze"
5. Review the batch results:
   - Individual analysis for each text entry
   - Statistical summary (total toxic comments, percentages)
   - Risk distribution chart

## 📡 API Documentation

### Endpoints

#### Text Analysis
```
POST /api/analyze
```
Request body:
```json
{
  "text": "Text to analyze",
  "include_details": true
}
```
Response:
```json
{
  "text": "Text to analyze",
  "predictions": {
    "harassment": {
      "label": "non-toxic",
      "confidence": 0.12,
      "threshold": 0.5
    },
    "misogyny": {
      "label": "non-toxic",
      "confidence": 0.08,
      "threshold": 0.5
    }
  },
  "toxicity_scores": {
    "harassment": 0.12,
    "misogyny": 0.08,
    "combined": 0.10
  },
  "is_toxic": false,
  "riskLevel": "low",
  "flagged_categories": []
}
```

#### Batch Analysis
```
POST /api/analyze/batch
```
Request body:
```json
{
  "texts": ["Text 1", "Text 2", "Text 3"],
  "include_statistics": true
}
```

#### Health Check
```
GET /api/health
```

#### Model Information
```
GET /api/models/info
```

## 🧠 Model Information

The application uses two specialized RoBERTa-based models:

### Harassment Detection Model
- Base: RoBERTa
- Fine-tuned on harassment datasets
- Binary classification (toxic/non-toxic)
- Includes positive sentiment detection to avoid false positives

### Misogyny Detection Model
- Base: RoBERTa
- Fine-tuned on misogyny-specific datasets
- Binary classification (toxic/non-toxic)
- Specialized in detecting gender-biased content

## 🧩 Development

### Backend Development

- Add new endpoints in `backend/api/routes.py`
- Extend model functionality in `backend/api/predictor.py`
- Add tests in `backend/tests/`

### Frontend Development

- Add new components in `frontend/src/components/`
- Update API client in `frontend/src/services/`
- Add new types in `frontend/src/types/`

## 📦 Deployment

### Backend Deployment Options

- **Docker**: Containerize the Flask application
- **Heroku**: Deploy using the Procfile
- **AWS/Azure/GCP**: Deploy to cloud platforms

### Frontend Deployment Options

- **Vercel**: Optimized for React applications
- **Netlify**: Simple deployment with continuous integration
- **GitHub Pages**: Static hosting

## 📄 License

[MIT License](LICENSE)

---
## 🙏 Acknowledgments

- HuggingFace for providing pre-trained models
- Open source libraries and frameworks used in this project
