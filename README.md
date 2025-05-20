# POI 295 Validation Tool

## 🌟 Project Overview

POI 295 Validation Tool is a specialized web application built for the **Guadalahacks 2025** hackathon, focused on validating Points of Interest (POIs) according to HERE Maps Specification 295. The tool verifies if POIs are improperly located on road medians, helping to ensure high-quality geospatial data for navigation and mapping services.

### 📊 Key Features

- **File Upload**: Support for POI CSV files and Streets Navigation GeoJSON files
- **Automated Validation**: POIs are automatically validated against Specification 295
- **Interactive Visualization**: Results are displayed on an interactive HERE map
- **Dockerized Deployment**: Easy setup with Docker for consistent environments

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose (recommended)
- Alternatively: [Node.js](https://nodejs.org/) (v14+) and [Python](https://www.python.org/) (v3.8+)
- HERE Maps API Key ([Get one here](https://developer.here.com/))

### Quick Start with Docker

1. Clone the repository:
   ```bash
   git clone https://https://github.com/JoseMartinezM/GuadalaHacks2025/
   ```

2. Set your HERE Maps API key in the `.env` file:
   ```
   REACT_APP_HERE_API_KEY=your_api_key_here
   ```

3. Build and run with Docker Compose:
   ```bash
   docker-compose up --build
   ```

4. Access the application:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)

### Manual Setup

#### Frontend
```bash
cd frontend
npm install
npm start
```

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

## 🧩 Architecture

The application follows a modern client-server architecture:

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│             │       │             │       │             │
│  React.js   │◄─────►│  Fast API   │◄─────►│  HERE Maps  │
│  Frontend   │       │  Backend    │       │  Services   │
│             │       │             │       │             │
└─────────────┘       └─────────────┘       └─────────────┘
```

- **Frontend**: React.js application with HERE Maps JavaScript SDK
- **Backend**: Fast API for file processing and POI validation
- **Data Storage**: Validated files are stored in a `/data` directory

## 💻 Technology Stack

### Frontend
- React.js
- styled-components
- HERE Maps JavaScript API
- React Router
- Axios

### Backend
- Python 3.8+
- Pytorch
- Pandas
- GeoPandas
- Fast API

### DevOps
- Docker & Docker Compose
- Node.js development server
- Python virtual environments

## 📁 Project Structure

```
Guadalahacks/
├── frontend/             # React frontend application
│   ├── public/           # Static files
│   ├── src/              # Source code
│   └── Dockerfile        # Frontend Docker configuration
│
├── backend/              # Fast API backend service
│   ├── app.py            # Main application file
│   ├── requirements.txt  # Python dependencies
│   └── Dockerfile        # Backend Docker configuration
│
├── data/                 # Shared data directory for uploads
│   ├── POI.csv           # Uploaded POI data (renamed)
│   └── NAV.geojson       # Uploaded Navigation data (renamed)
│
├── docker-compose.yml    # Docker Compose configuration
└── README.md             # This documentation
```

## 🔍 Validation Process

1. **File Upload**: Users upload two files:
   - POI CSV file (containing Points of Interest data)
   - Streets Navigation GeoJSON file (containing road network data)

2. **Backend Processing**: The backend processes these files to:
   - Associate POIs to their link_ids and coordinates
   - Identify POIs that are located on medians
   - Classify them into 4 cases using Convolutional Neural Networks (CNNs)
   - Apply HERE Maps Specification 295 validation rules

3. **Result Visualization**: The results are displayed on an interactive map with:
   - Valid POIs (green markers)
   - Invalid POIs on medians (red markers)
   - Warning cases (yellow markers)

## 👥 Team Members

This project was developed for Guadalahacks 2025 by:

- Santiago Mora Cruz - Data Scientist
- Jose Manuel Martinez Morales - Software Developer
- René Abraham Calzadilla Calderon - Data Scientist
- Guillermo Villegas Morales - Data Scientist

## 🛠 Development


### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request


## 🙏 Acknowledgements

- [HERE Maps](https://www.here.com/) for their excellent mapping platform and API
- [Guadalahacks 2025](https://guadalahacks.com/) for hosting this hackathon
- All open-source libraries and frameworks used in this project
