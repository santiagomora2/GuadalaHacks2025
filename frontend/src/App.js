// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Navbar from './components/UI/Navbar';
import TeamPage from './components/Team/TeamPage';
import Footer from './components/UI/Footer';
import BackgroundEffect from './components/UI/BackgroundEffect';
import FileUploadSection from './components/Upload/FileUploadSection';
import HEREMapComponent from './components/Map/HEREMapComponent';

// Global container style
const GlobalContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
`;

// Main container style
const MainContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  position: relative;
  z-index: 1;
`;

// Hero section with animation
const HeroSection = styled.header`
  width: 100%;
  text-align: center;
  margin-bottom: 30px;
  padding: 30px 20px;
  animation: fadeIn 1s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Title with HERE Maps style
const Title = styled.h1`
  color: #4A56A6;
  font-size: 2.5rem;
  margin-bottom: 16px;
  position: relative;
  display: inline-block;

  &:after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    right: 0;
    margin: 0 auto;
    height: 4px;
    width: 80px;
    background: linear-gradient(90deg, #00AFAA 0%, #4A56A6 100%);
    border-radius: 2px;
  }
`;

// Subtitle with modern style
const Subtitle = styled.p`
  color: #555;
  font-size: 1.2rem;
  margin-bottom: 30px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

// Map section with improved style
const MapSection = styled.section`
  width: 100%;
  margin-top: 20px;
  margin-bottom: 40px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  animation: slideUp 1s ease-in-out;
  background-color: white;
  padding: 20px;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// HomePage component
const HomePage = () => {
  return (
    <>
      <HeroSection id="home">
        <Title>POI Validation Tool</Title>
        <Subtitle>
          Upload, validate and visualize Points of Interest (POIs) according to HERE Maps Specification 295.
          Verify POIs on medians and ensure compliance with location standards.
        </Subtitle>
      </HeroSection>
      
      <div id="upload">
        <FileUploadSection />
      </div>
      
      <MapSection id="map">
        <HEREMapComponent />
      </MapSection>
    </>
  );
};

function App() {
  return (
    <Router>
      <GlobalContainer>
        <BackgroundEffect />
        <Navbar />
        
        <MainContainer>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/team" element={<TeamPage />} />
          </Routes>
        </MainContainer>
        
        <Footer />
      </GlobalContainer>
    </Router>
  );
}

export default App;