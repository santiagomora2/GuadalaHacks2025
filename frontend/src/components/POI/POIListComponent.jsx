// frontend/src/components/POI/POIListComponent.jsx
import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { POIContext } from '../../context/POIContext';

// Styled components for the list view
const ListContainer = styled.div`
  width: 100%;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
`;

const ListHeader = styled.div`
  padding: 15px 20px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e9f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ListTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  color: #333;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const SearchBar = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 250px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #4a56a6;
  }
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`;

const TableHead = styled.thead`
  background-color: #f5f7fa;
  th {
    padding: 12px 15px;
    text-align: left;
    font-weight: 600;
    color: #555;
    border-bottom: 2px solid #e4e9f0;
    white-space: nowrap;
    cursor: pointer;
    
    &:hover {
      background-color: #e9ecf3;
    }
  }
`;

const TableBody = styled.tbody`
  tr {
    &:nth-child(even) {
      background-color: #f9f9f9;
    }
    
    &:hover {
      background-color: #f0f4ff;
    }
    
    &.non-existent {
      background-color: rgba(244, 67, 54, 0.1);
      
      &:hover {
        background-color: rgba(244, 67, 54, 0.2);
      }
    }
    
    &.wrong-location {
      background-color: rgba(255, 152, 0, 0.1);
      
      &:hover {
        background-color: rgba(255, 152, 0, 0.2);
      }
    }
    
    &.invalid {
      background-color: rgba(156, 39, 176, 0.1);
      
      &:hover {
        background-color: rgba(156, 39, 176, 0.2);
      }
    }
    
    &.exception {
      background-color: rgba(76, 175, 80, 0.1);
      
      &:hover {
        background-color: rgba(76, 175, 80, 0.2);
      }
    }
  }
  
  td {
    padding: 10px 15px;
    border-bottom: 1px solid #e4e9f0;
    white-space: nowrap;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  background-color: ${props => {
    switch(props.status) {
      case 'non-existent': return '#F44336'; // Red
      case 'wrong-location': return '#FF9800'; // Orange
      case 'invalid': return '#9C27B0'; // Purple
      case 'exception': return '#4CAF50'; // Green
      default: return '#757575'; // Grey
    }
  }};
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f5f7fa;
  border-top: 1px solid #e4e9f0;
`;

const PageInfo = styled.div`
  font-size: 14px;
  color: #666;
`;

const PageButtons = styled.div`
  display: flex;
  gap: 5px;
`;

const PageButton = styled.button`
  padding: 5px 10px;
  border: 1px solid #ddd;
  background-color: ${props => props.active ? '#4a56a6' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 4px;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background-color: ${props => props.active ? '#4a56a6' : '#f0f0f0'};
  }
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 15px;
  padding: 15px 20px;
  background-color: #f8f9fb;
  border-bottom: 1px solid #e4e9f0;
  flex-wrap: wrap;
`;

const StatBox = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  padding: 12px 15px;
  flex: 1;
  min-width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  border: ${props => props.selected ? '2px solid #4a56a6' : '2px solid transparent'};
  
  &:hover {
    background-color: ${props => props.clickable ? '#f9f9f9' : 'white'};
  }
`;

const StatTitle = styled.span`
  font-size: 13px;
  color: #666;
  margin-bottom: 5px;
  text-align: center;
`;

const StatValue = styled.span`
  font-size: 22px;
  font-weight: 600;
  color: ${props => props.color || '#333'};
`;

const FilterContainer = styled.div`
  padding: 0 20px;
  margin: 15px 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 2px solid ${props => props.color};
  background-color: ${props => props.active ? props.color : 'white'};
  color: ${props => props.active ? 'white' : props.color};
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.active ? props.color : `${props.color}22`};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #888;
  
  p {
    margin: 5px 0;
  }
`;

const DebugPanel = styled.div`
  margin: 15px 20px;
  padding: 15px;
  background-color: #f0f4f8;
  border-radius: 8px;
  border: 1px solid #d0d9e4;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DebugTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #333;
`;

const DebugContent = styled.pre`
  background-color: #1e1e1e;
  color: #f8f8f8;
  padding: 10px;
  border-radius: 5px;
  overflow: auto;
  font-size: 12px;
  max-height: 200px;
`;

const POIListComponent = () => {
  // State variables
  const [poiList, setPoiList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [stats, setStats] = useState({ 
    total: 0, 
    non_existent: 0, 
    wrong_location: 0,
    invalid_location: 0,
    rule_exception: 0
  });
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'non_existent', 'wrong_location', etc.
  const [showDebug, setShowDebug] = useState(true);
  
  // Get POI data from context
  const { poiData } = useContext(POIContext);
  
  // Helper function to determine status from label
  const getStatusFromLabel = (label) => {
    if (typeof label === 'string') {
      if (label.startsWith('1.')) return 'non-existent';
      if (label.startsWith('2.')) return 'wrong-location';
      if (label.startsWith('3.')) return 'invalid';
      if (label.startsWith('4.')) return 'exception';
    } else if (label === 0 || label === '0') {
      return 'non-existent';
    } else if (label === 1 || label === '1') {
      return 'exception';
    }
    return 'unknown';
  };
  
  // Process POI data when it changes
  useEffect(() => {
    if (!poiData) return;
    
    try {
      // Convert object to array for table display
      const poiArray = Object.entries(poiData).map(([id, poi]) => {
        const status = getStatusFromLabel(poi.label);
        return {
          id,
          ...poi,
          status
        };
      });
      
      // Calculate stats
      const totalPOIs = poiArray.length;
      const nonExistentPOIs = poiArray.filter(poi => poi.status === 'non-existent').length;
      const wrongLocationPOIs = poiArray.filter(poi => poi.status === 'wrong-location').length;
      const invalidLocationPOIs = poiArray.filter(poi => poi.status === 'invalid').length;
      const ruleExceptionPOIs = poiArray.filter(poi => poi.status === 'exception').length;
      
      // Set stats
      setStats({
        total: totalPOIs,
        non_existent: nonExistentPOIs,
        wrong_location: wrongLocationPOIs,
        invalid_location: invalidLocationPOIs,
        rule_exception: ruleExceptionPOIs
      });
      
      // Set the POI list
      setPoiList(poiArray);
      
      console.log(`Processed ${poiArray.length} POIs for list view`);
    } catch (error) {
      console.error('Error processing POI data for list:', error);
    }
  }, [poiData]);
  
  // Apply filters, sorting, and update filtered list
  useEffect(() => {
    if (poiList.length === 0) return;
    
    // First apply status filter
    let filtered = [...poiList];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(poi => poi.status === statusFilter);
    }
    
    // Then apply search filter
    if (searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(poi => 
        (poi.id && poi.id.toString().toLowerCase().includes(lowerSearchTerm)) ||
        (poi.POI_NAME && poi.POI_NAME.toString().toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    // Sort the filtered list
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle undefined values
      if (aValue === undefined) aValue = '';
      if (bValue === undefined) bValue = '';
      
      // Handle numeric vs string sorting
      if (!isNaN(aValue) && !isNaN(bValue)) {
        return sortDirection === 'asc' 
          ? Number(aValue) - Number(bValue) 
          : Number(bValue) - Number(aValue);
      }
      
      // String comparison
      if (sortDirection === 'asc') {
        return String(aValue).localeCompare(String(bValue));
      } else {
        return String(bValue).localeCompare(String(aValue));
      }
    });
    
    setFilteredList(filtered);
    setCurrentPage(1); // Reset to first page after filtering
    
  }, [poiList, searchTerm, sortBy, sortDirection, statusFilter]);
  
  // Handle sort column click
  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortBy(column);
      setSortDirection('asc');
    }
  };
  
  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle status filter change
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };
  
  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  
  // Render page numbers
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <PageButton 
          key={i} 
          active={i === currentPage}
          onClick={() => paginate(i)}
        >
          {i}
        </PageButton>
      );
    }
    
    return pageNumbers;
  };
  
  // Function to format coordinate values
  const formatCoord = (value) => {
    if (value === undefined || value === null) return 'N/A';
    return typeof value === 'number' ? value.toFixed(6) : value;
  };
  
  // Get the human-readable status text
  const getStatusText = (status) => {
    switch(status) {
      case 'non-existent': return 'POI Non-existent';
      case 'wrong-location': return 'Wrong Location';
      case 'invalid': return 'Invalid Location';
      case 'exception': return 'Rule Exception';
      default: return 'Unknown';
    }
  };
  
  // Render the stats section
  const renderStats = () => {
    return (
      <StatsContainer>
        <StatBox 
          clickable={true} 
          selected={statusFilter === 'all'}
          onClick={() => handleStatusFilter('all')}
        >
          <StatTitle>Total POIs</StatTitle>
          <StatValue>{stats.total}</StatValue>
        </StatBox>
        <StatBox 
          clickable={true} 
          selected={statusFilter === 'non-existent'}
          onClick={() => handleStatusFilter('non-existent')}
        >
          <StatTitle>Non-existent</StatTitle>
          <StatValue color="#F44336">{stats.non_existent}</StatValue>
        </StatBox>
        <StatBox 
          clickable={true} 
          selected={statusFilter === 'wrong-location'}
          onClick={() => handleStatusFilter('wrong-location')}
        >
          <StatTitle>Wrong Location</StatTitle>
          <StatValue color="#FF9800">{stats.wrong_location}</StatValue>
        </StatBox>
        <StatBox 
          clickable={true} 
          selected={statusFilter === 'invalid'}
          onClick={() => handleStatusFilter('invalid')}
        >
          <StatTitle>Invalid Location</StatTitle>
          <StatValue color="#9C27B0">{stats.invalid_location}</StatValue>
        </StatBox>
        <StatBox 
          clickable={true} 
          selected={statusFilter === 'exception'}
          onClick={() => handleStatusFilter('exception')}
        >
          <StatTitle>Rule Exception</StatTitle>
          <StatValue color="#4CAF50">{stats.rule_exception}</StatValue>
        </StatBox>
      </StatsContainer>
    );
  };
  
  // Render filter buttons
  const renderFilterButtons = () => {
    return (
      <FilterContainer>
        <FilterButton 
          color="#4A56A6" 
          active={statusFilter === 'all'}
          onClick={() => handleStatusFilter('all')}
        >
          All POIs
        </FilterButton>
        <FilterButton 
          color="#F44336" 
          active={statusFilter === 'non-existent'}
          onClick={() => handleStatusFilter('non-existent')}
        >
          Non-existent
        </FilterButton>
        <FilterButton 
          color="#FF9800" 
          active={statusFilter === 'wrong-location'}
          onClick={() => handleStatusFilter('wrong-location')}
        >
          Wrong Location
        </FilterButton>
        <FilterButton 
          color="#9C27B0" 
          active={statusFilter === 'invalid'}
          onClick={() => handleStatusFilter('invalid')}
        >
          Invalid Location
        </FilterButton>
        <FilterButton 
          color="#4CAF50" 
          active={statusFilter === 'exception'}
          onClick={() => handleStatusFilter('exception')}
        >
          Rule Exception
        </FilterButton>
      </FilterContainer>
    );
  };
  
  
  // Render the main table for POI data
  const renderTable = () => {
    if (poiList.length === 0) {
      return (
        <EmptyState>
          <p>No POI data available</p>
          <p>Upload files and analyze POIs to see results</p>
        </EmptyState>
      );
    }
    
    if (filteredList.length === 0) {
      return (
        <EmptyState>
          <p>No POIs match your current filters</p>
          <p>Try changing your filter settings or search term</p>
        </EmptyState>
      );
    }
    
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <tr>
              <th onClick={() => handleSort('id')}>
                ID {sortBy === 'id' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('POI_NAME')}>
                Name {sortBy === 'POI_NAME' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('label')}>
                Status {sortBy === 'label' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('y_cord')}>
                Latitude {sortBy === 'y_cord' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('x_cord')}>
                Longitude {sortBy === 'x_cord' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('distance')}>
                Distance {sortBy === 'distance' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
            </tr>
          </TableHead>
          <TableBody>
            {currentItems.map((poi) => (
              <tr key={poi.id} className={poi.status}>
                <td>{poi.id}</td>
                <td>{poi.POI_NAME || 'Unnamed'}</td>
                <td>
                  <StatusBadge status={poi.status}>
                    {getStatusText(poi.status)}
                  </StatusBadge>
                </td>
                <td>{formatCoord(poi.y_cord)}</td>
                <td>{formatCoord(poi.x_cord)}</td>
                <td>{poi.distance !== undefined ? `${poi.distance.toFixed(2)} m` : 'N/A'}</td>
              </tr>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  return (
    <ListContainer>
      <ListHeader>
        <ListTitle>POI Data Analysis</ListTitle>
        <SearchContainer>
          <SearchBar 
            type="text" 
            placeholder="Search by ID or name..." 
            value={searchTerm}
            onChange={handleSearch}
          />
        </SearchContainer>
      </ListHeader>
    
      
      {poiData && renderStats()}
      {poiData && renderFilterButtons()}
      
      {!poiData ? (
        <EmptyState>
          <p>Waiting for POI data...</p>
        </EmptyState>
      ) : (
        renderTable()
      )}
      
      {filteredList.length > 0 && (
        <Pagination>
          <PageInfo>
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredList.length)} of {filteredList.length} POIs
          </PageInfo>
          <PageButtons>
            <PageButton onClick={prevPage} disabled={currentPage === 1}>
              Previous
            </PageButton>
            
            {renderPageNumbers()}
            
            <PageButton onClick={nextPage} disabled={currentPage === totalPages}>
              Next
            </PageButton>
          </PageButtons>
        </Pagination>
      )}
    </ListContainer>
  );
};

export default POIListComponent;