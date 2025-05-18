// frontend/src/components/Upload/FileUploadSection.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

// Container for the upload section
const UploadContainer = styled.section`
  width: 100%;
  background-color: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

// Title for the section
const SectionTitle = styled.h2`
  color: #4A56A6;
  font-size: 1.5rem;
  margin-bottom: 20px;
  position: relative;
  display: inline-block;

  &:after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    height: 3px;
    width: 60px;
    background: linear-gradient(90deg, #00AFAA 0%, #4A56A6 100%);
    border-radius: 1.5px;
  }
`;

// Grid layout for the upload boxes
const UploadGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Box for each file upload - use data attribute instead of prop directly
const UploadBox = styled.div`
  border: 2px dashed ${props => props["data-dragging"] === "true" ? '#00AFAA' : '#ddd'};
  border-radius: 8px;
  padding: 30px 20px;
  text-align: center;
  transition: all 0.3s ease;
  background-color: ${props => props["data-dragging"] === "true" ? 'rgba(0, 175, 170, 0.05)' : 'transparent'};
  position: relative;
  
  &:hover {
    border-color: #00AFAA;
    background-color: rgba(0, 175, 170, 0.05);
  }
`;

// File input (hidden)
const FileInput = styled.input`
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
`;

// Upload icon
const UploadIcon = styled.div`
  font-size: 40px;
  color: #4A56A6;
  margin-bottom: 15px;
`;

// Upload label
const UploadLabel = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 10px;
`;

// Upload description
const UploadDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 20px;
`;

// File format badges
const FormatBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  background-color: #f0f2f5;
  color: #4A56A6;
  border-radius: 20px;
  font-size: 0.8rem;
  margin: 0 5px;
  font-weight: 500;
`;

// File info when selected
const FileInfo = styled.div`
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  text-align: left;
`;

// File name
const FileName = styled.p`
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  button {
    background: none;
    border: none;
    color: #ff5c5c;
    cursor: pointer;
    font-size: 16px;
    
    &:hover {
      color: #ff3333;
    }
  }
`;

// File size
const FileSize = styled.p`
  color: #666;
  font-size: 0.8rem;
`;

// Validate button
const ValidateButton = styled.button`
  background: linear-gradient(90deg, #00AFAA 0%, #4A56A6 100%);
  color: white;
  border: none;
  border-radius: 30px;
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 30px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 175, 170, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 175, 170, 0.3);
  }
  
  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// Message after validation
const ValidationMessage = styled.div`
  margin-top: 20px;
  padding: 15px;
  border-radius: 8px;
  background-color: ${props => props.type === 'success' ? 'rgba(46, 213, 115, 0.1)' : 'rgba(255, 71, 87, 0.1)'};
  color: ${props => props.type === 'success' ? '#2ed573' : '#ff4757'};
  display: flex;
  align-items: center;
  
  i {
    font-size: 20px;
    margin-right: 10px;
  }
`;

// Loading spinner for file upload
const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 10px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const FileUploadSection = () => {
  const [poiFile, setPoiFile] = useState(null);
  const [streetsFile, setStreetsFile] = useState(null);
  const [validationStatus, setValidationStatus] = useState(null);
  const [isDraggingPOI, setIsDraggingPOI] = useState(false);
  const [isDraggingStreets, setIsDraggingStreets] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle file selection for POI file
  const handlePoiFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setPoiFile(file);
    }
  };

  // Handle file selection for Streets file
  const handleStreetsFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'application/geo+json' || file.name.endsWith('.geojson'))) {
      setStreetsFile(file);
    }
  };

  // Handle file removal
  const removePoiFile = () => setPoiFile(null);
  const removeStreetsFile = () => setStreetsFile(null);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Handle drag events for POI file
  const handleDragOverPOI = (e) => {
    e.preventDefault();
    setIsDraggingPOI(true);
  };

  const handleDragLeavePOI = () => {
    setIsDraggingPOI(false);
  };

  const handleDropPOI = (e) => {
    e.preventDefault();
    setIsDraggingPOI(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setPoiFile(file);
    }
  };

  // Handle drag events for Streets file
  const handleDragOverStreets = (e) => {
    e.preventDefault();
    setIsDraggingStreets(true);
  };

  const handleDragLeaveStreets = () => {
    setIsDraggingStreets(false);
  };

  const handleDropStreets = (e) => {
    e.preventDefault();
    setIsDraggingStreets(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/geo+json' || file.name.endsWith('.geojson'))) {
      setStreetsFile(file);
    }
  };

  // Handle validation - send files directly to the server
  const handleValidate = async () => {
    if (!poiFile || !streetsFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setErrorMsg('');
    
    try {
      // Create FormData object
      const formData = new FormData();
      formData.append('poiFile', poiFile);
      formData.append('streetsFile', streetsFile);
      
      // Send to backend endpoint
      const response = await axios.post('http://localhost:5000/api/upload-files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      // If successful, set validation status
      if (response.data.success) {
        setValidationStatus('success');
        console.log('Files saved to:', response.data);
      } else {
        setValidationStatus('error');
        setErrorMsg(response.data.message || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setValidationStatus('error');
      setErrorMsg(error.message || 'Failed to upload files. Check the console for details.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <UploadContainer>
      <SectionTitle>Upload Files for Validation</SectionTitle>
      
      <p>Upload your POI CSV file and Streets Navigation GeoJSON file to validate POIs according to Specification 295.</p>
      
      <UploadGrid>
        {/* POI File Upload - Using data attribute instead of custom prop */}
        <UploadBox 
          data-dragging={isDraggingPOI.toString()}
          onDragOver={handleDragOverPOI}
          onDragLeave={handleDragLeavePOI}
          onDrop={handleDropPOI}
        >
          <FileInput 
            type="file" 
            accept=".csv" 
            onChange={handlePoiFileChange} 
          />
          
          {!poiFile ? (
            <>
              <UploadIcon>
                <i className="fas fa-file-csv"></i>
              </UploadIcon>
              <UploadLabel>POI Data File</UploadLabel>
              <UploadDescription>
                Drop your Points of Interest data file here or click to browse
              </UploadDescription>
              <FormatBadge>.CSV</FormatBadge>
            </>
          ) : (
            <FileInfo>
              <FileName>
                {poiFile.name}
                <button onClick={removePoiFile} title="Remove file">
                  <i className="fas fa-times"></i>
                </button>
              </FileName>
              <FileSize>{formatFileSize(poiFile.size)}</FileSize>
            </FileInfo>
          )}
        </UploadBox>
        
        {/* Streets File Upload - Using data attribute instead of custom prop */}
        <UploadBox 
          data-dragging={isDraggingStreets.toString()}
          onDragOver={handleDragOverStreets}
          onDragLeave={handleDragLeaveStreets}
          onDrop={handleDropStreets}
        >
          <FileInput 
            type="file" 
            accept=".geojson" 
            onChange={handleStreetsFileChange} 
          />
          
          {!streetsFile ? (
            <>
              <UploadIcon>
                <i className="fas fa-map-marked-alt"></i>
              </UploadIcon>
              <UploadLabel>Streets Navigation File</UploadLabel>
              <UploadDescription>
                Drop your Streets Navigation data file here or click to browse
              </UploadDescription>
              <FormatBadge>.GEOJSON</FormatBadge>
            </>
          ) : (
            <FileInfo>
              <FileName>
                {streetsFile.name}
                <button onClick={removeStreetsFile} title="Remove file">
                  <i className="fas fa-times"></i>
                </button>
              </FileName>
              <FileSize>{formatFileSize(streetsFile.size)}</FileSize>
            </FileInfo>
          )}
        </UploadBox>
      </UploadGrid>
      
      <div style={{ textAlign: 'center' }}>
        <ValidateButton 
          disabled={!poiFile || !streetsFile || isUploading} 
          onClick={handleValidate}
        >
          {isUploading ? (
            <>
              <LoadingSpinner /> Uploading... {uploadProgress > 0 ? `${uploadProgress}%` : ''}
            </>
          ) : (
            'Validate POIs'
          )}
        </ValidateButton>
      </div>
      
      {validationStatus && (
        <ValidationMessage type={validationStatus}>
          <i className={validationStatus === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'}></i>
          {validationStatus === 'success' 
            ? 'Files uploaded and validation completed successfully. Results are displayed on the map below.' 
            : `Validation failed. ${errorMsg}`}
        </ValidationMessage>
      )}
    </UploadContainer>
  );
};

export default FileUploadSection;