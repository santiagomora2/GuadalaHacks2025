# POI 295 Validation Tool - Backend

## 📋 Overview

This is the Backend application for the POI 295 Validation Tool, developed for the **Guadalahacks 2025** hackathon. It provides the brains behind the interface where POI data is processed and is classified using Deep Learning models based on HERE Maps Specification 295.

## ✨ Features

- **Data Processing**: Merge information from various datasets in different formats.
- **POI segmentation**: Segmentation of the POIs based on location and orientation attributes.
- **Satellite Image Estraction**: Using Here API.
- **Deep Learning - based prediction**: Use of CNNs for image processing and prediction.
- **Multiple scenarios**: Handle each particular case with an adequate solution.
## 🚀 Quick Start

### Development Environment

1. Install dependencies:
   ```bash
   pip install requirements.txt
   ```

2. Run FastAPI server:
   ```
   python app.py
   ```
3. The API will be available at [http://localhost:8000](http://localhost:8000)


## 🧩 Application Structure

```
backend/
├── functions/
│ └── cnn_functions.py
| └── data_processing_functions.py
| └── satellite_functions.py
├── models/
│ ├── modelo_camellones.pth
│ └── modelo_side.pth
├── .dockerignore
├── .gitignore
├── Dockerfile
└── README.md
```
## 🧠 Key Concepts

- **Image-Based Classification**: Use of CNNs trained on POI satellite data.
- **295 Specification Logic**: Backend logic built around the HERE Maps 295 format.
- **Coordinate Normalization**: Efficient coordinate parsing and map tile management.

---

## HERE Maps Integration

The HERE API is used to:
- Fetch satellite tiles based on POI coordinates.
- Normalize zoom levels and tile formatting.
- Store images in a consistent format (PNG, 256x256 px).

## 📦 Dependencies```
- ```FastAPI``` – Web framework for serving the API.

- ```GeoPandas``` - Handle map data effectively.

- ```torch``` – For running CNN-based classification.

- ```requests, PIL``` – To handle image retrieval and processing.

- ```python-dotenv``` – Load sensitive info like API keys from .env.


## 🔄 CI/CD Integration

This project can be set up with:

- **Docker Hub**: For container registry integration

## 📫 Questions?
Feel free to reach out or open an issue if you need help understanding or extending this backend.
