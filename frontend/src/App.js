// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Navbar from './components/UI/Navbar';
import HomePage from './components/HomePage'; // Importar el componente HomePage actualizado
import TeamPage from './components/Team/TeamPage';
import Footer from './components/UI/Footer';
import BackgroundEffect from './components/UI/BackgroundEffect';
import POI295GuidePage from './components/Guide/POI295GuidePage';
import { POIProvider } from './context/POIContext';

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

function App() {
  return (
    <Router>
      <POIProvider>
        <GlobalContainer>
          <BackgroundEffect />
          <Navbar />
          
          <MainContainer>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/guide" element={<POI295GuidePage />} />
            </Routes>
          </MainContainer>
          
          <Footer />
        </GlobalContainer>
      </POIProvider>
    </Router>
  );
}

export default App;