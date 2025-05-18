// frontend/src/components/Guide/POI295GuidePage.jsx
import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

// Animation for highlighting sections
const highlight = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Main container
const GuideContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
`;

// Header with HERE Maps style
const GuideHeader = styled.div`
  margin-bottom: 40px;
  text-align: center;
`;

// Title
const GuideTitle = styled.h1`
  color: #4A56A6;
  font-size: 2.2rem;
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

// Subtitle
const GuideSubtitle = styled.p`
  color: #555;
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
`;

// Navigation tabs
const GuideTabs = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
`;

// Tab button
const TabButton = styled.button`
  background: ${props => props.active ? 'linear-gradient(90deg, #00AFAA, #4A56A6)' : 'transparent'};
  color: ${props => props.active ? 'white' : '#4A56A6'};
  border: none;
  padding: 12px 20px;
  margin: 0 5px 10px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.active ? '0 4px 10px rgba(0, 0, 0, 0.1)' : 'none'};
  
  &:hover {
    background: ${props => props.active ? 'linear-gradient(90deg, #00AFAA, #4A56A6)' : 'rgba(74, 86, 166, 0.1)'};
    transform: translateY(-2px);
  }
`;

// Section container
const Section = styled.div`
  margin-bottom: 40px;
  opacity: ${props => props.active ? 1 : 0};
  display: ${props => props.active ? 'block' : 'none'};
  animation: ${props => props.active ? `fadeIn 0.5s ease` : 'none'};
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

// Section title
const SectionTitle = styled.h2`
  color: #4A56A6;
  font-size: 1.8rem;
  margin-bottom: 20px;
  position: relative;
  display: inline-block;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    height: 3px;
    width: 60px;
    background: linear-gradient(90deg, #00AFAA 0%, #4A56A6 100%);
    border-radius: 1.5px;
  }
`;

// Content card
const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

// Card title
const CardTitle = styled.h3`
  color: #4A56A6;
  font-size: 1.4rem;
  margin-bottom: 15px;
`;

// Two column layout
const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin: 30px 0;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Interactive example
const InteractiveExample = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 75%; /* 4:3 aspect ratio */
  margin: 30px 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
`;

// Map visualization
const MapVisualization = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
`;

// POI marker
const POIMarker = styled.div`
  position: absolute;
  top: ${props => props.top}%;
  left: ${props => props.left}%;
  width: 20px;
  height: 20px;
  margin-left: -10px;
  margin-top: -10px;
  border-radius: 50%;
  background-color: ${props => props.valid ? 'rgba(46, 213, 115, 0.8)' : 'rgba(255, 71, 87, 0.8)'};
  border: 2px solid white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  z-index: 10;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: scale(1.5);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
  }
  
  &:after {
    content: '${props => props.label}';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    color: #333;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover:after {
    opacity: 1;
  }
`;

// Road marker
const RoadLine = styled.div`
  position: absolute;
  top: ${props => props.top}%;
  left: ${props => props.left}%;
  width: ${props => props.width}%;
  height: 6px;
  background-color: ${props => props.color || 'rgba(74, 86, 166, 0.7)'};
  border-radius: 3px;
  transform: rotate(${props => props.rotate || 0}deg);
  transform-origin: ${props => props.transformOrigin || 'center'};
  z-index: 5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
`;

// Divider median
const Median = styled.div`
  position: absolute;
  top: ${props => props.top}%;
  left: ${props => props.left}%;
  width: ${props => props.width}%;
  height: ${props => props.height || 10}px;
  background-color: rgba(0, 175, 170, 0.5);
  border-radius: 5px;
  transform: rotate(${props => props.rotate || 0}deg);
  transform-origin: ${props => props.transformOrigin || 'center'};
  z-index: 6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
`;

// Highlight box
const HighlightBox = styled.div`
  background: linear-gradient(270deg, rgba(74, 86, 166, 0.1), rgba(0, 175, 170, 0.1), rgba(74, 86, 166, 0.1));
  background-size: 200% 200%;
  animation: ${highlight} 3s ease infinite;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
  border-left: 4px solid #4A56A6;
`;

// Key point
const KeyPoint = styled.div`
  margin: 20px 0;
  padding-left: 20px;
  border-left: 3px solid #00AFAA;
`;

// Data set info
const DatasetInfo = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
`;

// Steps indicator 
const StepsContainer = styled.div`
  display: flex;
  margin: 30px 0;
  overflow-x: auto;
  padding-bottom: 10px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

// Step item
const StepItem = styled.div`
  flex: 1;
  padding: 15px;
  position: relative;
  
  &:not(:last-child):after {
    content: '';
    position: absolute;
    top: 30px;
    right: 0;
    width: 30px;
    height: 2px;
    background-color: #ddd;
    
    @media (max-width: 768px) {
      top: unset;
      right: unset;
      bottom: 0;
      left: 30px;
      width: 2px;
      height: 30px;
    }
  }
  
  @media (max-width: 768px) {
    padding: 15px 15px 15px 60px;
  }
`;

// Step number
const StepNumber = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(90deg, #00AFAA, #4A56A6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 10px;
  
  @media (max-width: 768px) {
    position: absolute;
    left: 15px;
    top: 15px;
  }
`;

// Step text
const StepText = styled.div`
  font-size: 14px;
  color: #555;
`;

const POI295GuidePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Content tabs
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'specification', label: 'Specification 295' },
    { id: 'examples', label: 'Visual Examples' },
    { id: 'datasets', label: 'Available Datasets' },
    { id: 'validation', label: 'Validation Process' }
  ];
  
  return (
    <GuideContainer>
      <GuideHeader>
        <GuideTitle>POI 295 Specification Guide</GuideTitle>
        <GuideSubtitle>
          Understanding HERE Maps Specification 295 for validating Points of Interest on road medians
        </GuideSubtitle>
      </GuideHeader>
      
      <GuideTabs>
        {tabs.map(tab => (
          <TabButton 
            key={tab.id} 
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </TabButton>
        ))}
      </GuideTabs>
      
      {/* Overview Section */}
      <Section active={activeTab === 'overview'}>
        <SectionTitle>Why POI Validation Matters</SectionTitle>
        
        <Card>
          <CardTitle>The Evolving Road Network</CardTitle>
          <p>
            The road network is continuously evolving, and HERE Maps aims to maintain up-to-date
            maps to enhance navigation and overall user experience. Accurate Points of Interest (POIs)
            are critical for providing reliable directions and location services.
          </p>
          
          <HighlightBox>
            HERE has developed and maintains a robust set of validations to detect issues within the data:
            <ul>
              <li>Based on a comprehensive set of rules</li>
              <li>Currently <strong>3000+ validations</strong> in place</li>
              <li>Intended to reflect real-world situations</li>
              <li>Data is cleaned before release</li>
              <li>Issues are reviewed: fixed or labeled as "legal exceptions"</li>
            </ul>
          </HighlightBox>
          
          <p>
            In this guide, we focus on Specification 295, which deals with the validation of POIs
            located on road medians - a common data quality issue that affects navigation accuracy.
          </p>
        </Card>
        
        <TwoColumnLayout>
          <Card>
            <CardTitle>Why Accurate POIs Matter</CardTitle>
            <p>
              Points of Interest (POIs) serve as critical reference points in mapping and navigation systems.
              Inaccurate POIs can lead to:
            </p>
            <ul>
              <li>Incorrect routing instructions</li>
              <li>Confusion for drivers and pedestrians</li>
              <li>Degraded user experience</li>
              <li>Safety concerns in navigation</li>
              <li>Reduced trust in mapping services</li>
            </ul>
          </Card>
          
          <Card>
            <CardTitle>The Challenge of Road Medians</CardTitle>
            <p>
              Road medians present a particular challenge for POI placement:
            </p>
            <ul>
              <li>Physical barriers prevent direct access</li>
              <li>Routes must account for proper entry points</li>
              <li>Automatically generated POIs may incorrectly place locations on medians</li>
              <li>Visual satellite imagery may be misleading</li>
              <li>Real-world POIs are virtually never on medians</li>
            </ul>
          </Card>
        </TwoColumnLayout>
      </Section>
      
      {/* Specification Section */}
      <Section active={activeTab === 'specification'}>
        <SectionTitle>Understanding Specification 295</SectionTitle>
        
        <Card>
          <CardTitle>Definition & Trigger</CardTitle>
          <p>
            Specification 295 deals with the validation of Points of Interest (POIs) located on road medians.
          </p>
          
          <HighlightBox>
            <strong>Trigger:</strong> A Point of Interest (POI) feature is suspicious when located on the 
            inside of Multiply Digitized roads (roads with medians or dividers).
          </HighlightBox>
          
          <p>
            This specification is designed to catch potential errors in POI placement that could impact
            navigation quality and user experience.
          </p>
        </Card>
        
        <Card>
          <CardTitle>Outcome Scenarios</CardTitle>
          <p>
            When a POI is flagged by Specification 295, there are four possible explanations:
          </p>
          
          <StepsContainer>
            <StepItem>
              <StepNumber>1</StepNumber>
              <StepText><strong>No POI in reality</strong><br/>The POI feature is likely outdated or has been moved</StepText>
            </StepItem>
            
            <StepItem>
              <StepNumber>2</StepNumber>
              <StepText><strong>Incorrect POI location</strong><br/>There is a POI, but it's been associated with the wrong side of the road</StepText>
            </StepItem>
            
            <StepItem>
              <StepNumber>3</StepNumber>
              <StepText><strong>Incorrect Multiply Digitized attribution</strong><br/>The road may not actually have a median</StepText>
            </StepItem>
            
            <StepItem>
              <StepNumber>4</StepNumber>
              <StepText><strong>Legitimate Exception</strong><br/>The POI is correctly placed on a median (rare cases)</StepText>
            </StepItem>
          </StepsContainer>
          
          <p>
            Most cases fall into the first two categories, representing data that needs correction
            to improve mapping accuracy.
          </p>
        </Card>
        
        <InteractiveExample>
          <MapVisualization image="https://miro.medium.com/v2/resize:fit:1400/1*_oVJcKk3-IzYJ7jFwXRa5Q.png">
            {/* Main roads */}
            <RoadLine top={45} left={5} width={90} color="rgba(100, 100, 100, 0.7)" />
            <RoadLine top={55} left={5} width={90} color="rgba(100, 100, 100, 0.7)" />
            
            {/* Median */}
            <Median top={50} left={5} width={90} height={5} />
            
            {/* POI markers */}
            <POIMarker top={35} left={30} valid={true} label="Valid POI (correctly placed)" />
            <POIMarker top={50} left={50} valid={false} label="Invalid POI (on median)" />
            <POIMarker top={65} left={70} valid={true} label="Valid POI (correctly placed)" />
          </MapVisualization>
        </InteractiveExample>
        
        <KeyPoint>
          <strong>Key concept:</strong> POIs should be positioned on the appropriate side of divided roads, 
          not on the median itself. This ensures navigation systems provide accurate directions for reaching
          the actual location.
        </KeyPoint>
      </Section>
      
      {/* Examples Section */}
      <Section active={activeTab === 'examples'}>
        <SectionTitle>Visual Examples</SectionTitle>
        
        <Card>
          <CardTitle>No POI in Reality</CardTitle>
          <p>
            In this scenario, the POI data includes a location that no longer exists or has moved.
            The validated data should remove these phantom POIs to improve accuracy.
          </p>
          
          <InteractiveExample>
            <MapVisualization image="https://developers.google.com/static/maps/documentation/javascript/images/aerial-simple.jpg">
              {/* Main roads */}
              <RoadLine top={40} left={10} width={80} rotate={-5} color="rgba(100, 100, 100, 0.7)" />
              <RoadLine top={50} left={10} width={80} rotate={-5} color="rgba(100, 100, 100, 0.7)" />
              
              {/* Median */}
              <Median top={45} left={10} width={80} height={5} rotate={-5} />
              
              {/* POI markers */}
              <POIMarker top={45} left={50} valid={false} label="Phantom POI (no longer exists)" />
            </MapVisualization>
          </InteractiveExample>
          
          <KeyPoint>
            <strong>Resolution:</strong> The POI should be removed from the dataset after verification
            using satellite imagery or ground truth data.
          </KeyPoint>
        </Card>
        
        <Card>
          <CardTitle>Incorrect POI Location</CardTitle>
          <p>
            In this scenario, there is a real POI, but it has been incorrectly positioned on
            the median instead of on the correct side of the road.
          </p>
          
          <InteractiveExample>
            <MapVisualization image="https://developers.google.com/static/maps/documentation/javascript/images/aerial-simple.jpg">
              {/* Main roads */}
              <RoadLine top={40} left={10} width={80} rotate={-5} color="rgba(100, 100, 100, 0.7)" />
              <RoadLine top={50} left={10} width={80} rotate={-5} color="rgba(100, 100, 100, 0.7)" />
              
              {/* Median */}
              <Median top={45} left={10} width={80} height={5} rotate={-5} />
              
              {/* POI markers */}
              <POIMarker top={45} left={30} valid={false} label="Incorrect POI location" />
              <POIMarker top={35} left={30} valid={true} label="Correct POI location" />
            </MapVisualization>
          </InteractiveExample>
          
          <KeyPoint>
            <strong>Resolution:</strong> The POI should be relocated to the correct side of the road,
            allowing navigation systems to provide accurate routing instructions.
          </KeyPoint>
        </Card>
        
        <Card>
          <CardTitle>Legitimate Exception</CardTitle>
          <p>
            Although rare, there are cases where a POI might legitimately be located on what appears to be
            a road median. These exceptions should be carefully validated.
          </p>
          
          <InteractiveExample>
            <MapVisualization image="https://developers.google.com/static/maps/documentation/javascript/images/aerial-simple.jpg">
              {/* Main roads */}
              <RoadLine top={40} left={10} width={80} rotate={-5} color="rgba(100, 100, 100, 0.7)" />
              <RoadLine top={50} left={10} width={80} rotate={-5} color="rgba(100, 100, 100, 0.7)" />
              
              {/* Median - wider to indicate a plaza or accessible area */}
              <Median top={45} left={40} width={20} height={15} rotate={-5} />
              
              {/* POI markers */}
              <POIMarker top={45} left={50} valid={true} label="Valid exception (accessible median)" />
            </MapVisualization>
          </InteractiveExample>
          
          <KeyPoint>
            <strong>Resolution:</strong> After verification, these POIs can be marked as "legal exceptions"
            to prevent them from being flagged in future validation passes.
          </KeyPoint>
        </Card>
      </Section>
      
      {/* Datasets Section */}
      <Section active={activeTab === 'datasets'}>
        <SectionTitle>Available Datasets</SectionTitle>
        
        <Card>
          <CardTitle>Streets - Nav Dataset</CardTitle>
          <DatasetInfo>
            <strong>Definition:</strong> Contains all roads plus Road Network features related to navigation
            such as direction of travel, dividers, lane counts etc.
            <br/>
            <strong>Spatial Feature Type:</strong> LineString
            <br/>
            <strong>Location:</strong> Geojson files in the 'STREETS_NAV' folder, split into 20 separate files for convenience.
          </DatasetInfo>
          
          <p>
            This dataset is essential for Specification 295 validation as it contains the road
            network topology and attributes needed to identify multiply digitized roads (roads with medians).
          </p>
        </Card>
        
        <Card>
          <CardTitle>Streets – Naming & Addressing Dataset</CardTitle>
          <DatasetInfo>
            <strong>Definition:</strong> Contains all roads plus Road Network features related to naming and addressing.
            <br/>
            <strong>Spatial Feature Type:</strong> LineString
            <br/>
            <strong>Location:</strong> Geojson files in the 'STREETS_NAMING_ADDRESSING' folder, split into 20 separate files.
          </DatasetInfo>
          
          <p>
            This dataset provides context for the POIs and helps in understanding the addressing along road segments.
          </p>
        </Card>
        
        <Card>
          <CardTitle>POI Dataset</CardTitle>
          <DatasetInfo>
            <strong>Definition:</strong> Contains all Places of Interest features along with relevant attribution.
            <br/>
            <strong>Feature Note:</strong> Its location is derived by joining it with the Streets dataset and calculating its placement based on indicated distances.
            <br/>
            <strong>Spatial Feature Type:</strong> Point (but its geometry needs to be derived)
            <br/>
            <strong>Location:</strong> Geojson files in the 'POIs' folder, split into 20 separate files.
          </DatasetInfo>
          
          <p>
            This is the primary dataset being validated against Specification 295, containing the POIs
            that need to be checked for improper placement on road medians.
          </p>
        </Card>
        
        <Card>
          <CardTitle>HERE Raster Tile API</CardTitle>
          <DatasetInfo>
            <strong>Definition:</strong> Offers bitmap images with a resolution of either 256x256 or 512x512 pixels.
            <br/>
            <strong>Feature:</strong> Satellite imagery is one of the pre-defined response types that can be requested.
            <br/>
            <strong>Access:</strong> Available through REST API requests. Requires API Key (30k request for free in the Base Plan)
          </DatasetInfo>
          
          <p>
            Satellite imagery can be used as reference to visually verify the actual presence and location of POIs,
            helping to resolve validation issues flagged by Specification 295.
          </p>
        </Card>
      </Section>
      
      {/* Validation Section */}
      <Section active={activeTab === 'validation'}>
        <SectionTitle>Validation Process</SectionTitle>
        
        <Card>
          <CardTitle>Validation Workflow</CardTitle>
          <p>
            The validation process for POI 295 involves several steps to identify and correct POIs
            that are improperly located on road medians.
          </p>
          
          <StepsContainer>
            <StepItem>
              <StepNumber>1</StepNumber>
              <StepText><strong>Data Loading</strong><br/>Load the Streets-Nav and POI datasets</StepText>
            </StepItem>
            
            <StepItem>
              <StepNumber>2</StepNumber>
              <StepText><strong>Identification</strong><br/>Identify multiply digitized roads with medians</StepText>
            </StepItem>
            
            <StepItem>
              <StepNumber>3</StepNumber>
              <StepText><strong>Spatial Analysis</strong><br/>Check for POIs located on medians</StepText>
            </StepItem>
            
            <StepItem>
              <StepNumber>4</StepNumber>
              <StepText><strong>Classification</strong><br/>Categorize issues based on the outcome scenarios</StepText>
            </StepItem>
            
            <StepItem>
              <StepNumber>5</StepNumber>
              <StepText><strong>Verification</strong><br/>Use satellite imagery to verify actual conditions</StepText>
            </StepItem>
            
            <StepItem>
              <StepNumber>6</StepNumber>
              <StepText><strong>Resolution</strong><br/>Correct, remove, or mark as exception</StepText>
            </StepItem>
          </StepsContainer>
        </Card>
        
        <Card>
          <CardTitle>Technical Implementation</CardTitle>
          <p>
            A typical algorithm for POI 295 validation would involve:
          </p>
          
          <ol>
            <li>
              <strong>Identifying multiply digitized roads:</strong> These are parallel road segments that 
              represent two sides of a divided road with a median.
            </li>
            <li>
              <strong>Creating median polygons:</strong> Generating polygon geometries that represent the 
              area between parallel road segments.
            </li>
            <li>
              <strong>Spatial intersection:</strong> Checking if POI points fall within these median polygons.
            </li>
            <li>
              <strong>Validation results:</strong> Flagging POIs that intersect with median polygons for 
              further review.
            </li>
          </ol>
          
          <HighlightBox>
            <strong>Challenge:</strong> The data provided for the Mexico City area includes hidden errors 
            that need to be discovered through this validation process.
          </HighlightBox>
        </Card>
        
        <Card>
          <CardTitle>Quality Assurance</CardTitle>
          <p>
            After validation, quality assurance steps are essential:
          </p>
          
          <ul>
            <li>
              <strong>Manual review:</strong> Visual inspection of flagged POIs using satellite imagery.
            </li>
            <li>
              <strong>Documentation:</strong> Recording the reason for each POI correction or exception.
            </li>
            <li>
              <strong>Data update:</strong> Applying corrections to the POI dataset.
            </li>
            <li>
              <strong>Verification testing:</strong> Running the validation again to ensure all issues 
              have been addressed.
            </li>
          </ul>
          
          <p>
            This process ensures that the final POI data meets HERE Maps' high standards for accuracy
            and provides the best possible user experience for navigation and location-based services.
          </p>
        </Card>
      </Section>
    </GuideContainer>
  );
};

export default POI295GuidePage