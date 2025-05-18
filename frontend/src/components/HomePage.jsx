// frontend/src/components/HomePage.jsx
import React from 'react';
import styled from 'styled-components';
import FileUploadSection from './Upload/FileUploadSection';
import HEREMapComponent from './Map/HEREMapComponent';
import POIListComponent from './POI/POIListComponent';

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

// Section styling (common for both map and list)
const Section = styled.section`
  width: 100%;
  margin-top: 20px;
  margin-bottom: 40px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  animation: slideUp 1s ease-in-out;
  background-color: white;
  padding: ${props => props.noPadding ? '0' : '20px'};
  animation-delay: ${props => props.delay || '0s'};
  animation-fill-mode: both;

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

// Section title
const SectionTitle = styled.h2`
  color: #333;
  font-size: 1.5rem;
  margin: 0 0 20px 0;
  padding: 0 20px;
`;

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
      
      <FileUploadSection />
      
      {/* POI List Section (now above the map) */}
      <Section id="poi-list" noPadding={true}>
        <POIListComponent />
      </Section>
      
      {/* Map Section */}
      <Section id="map" delay="0.2s">
        <SectionTitle>Map Visualization</SectionTitle>
        <HEREMapComponent />
      </Section>
    </>
  );
};

export default HomePage;