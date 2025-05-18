// frontend/src/components/UI/Navigation.jsx
import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import hereLogoUrl from '../../assets/images/here-logo.svg';

// Main navbar container
const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(90deg, #00AFAA 0%, #4A56A6 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

// Logo and app name container
const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

// Logo styling
const Logo = styled.img`
  height: 32px;
  width: auto;
`;

// App name styling
const AppName = styled.h1`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: white;
  text-decoration: none;
  
  @media (max-width: 600px) {
    display: none;
  }
`;

// Navigation menu
const NavMenu = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

// Navigation item
const NavItem = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 16px;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  position: relative;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  ${props => props.active && `
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 12px;
      right: 12px;
      height: 3px;
      background-color: white;
      border-radius: 1.5px;
    }
  `}

  @media (max-width: 600px) {
    padding: 8px;
    font-size: 14px;
  }
`;

// Documentation button
const DocsButton = styled.a`
  background-color: white;
  color: #4A56A6;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: flex;
  align-items: center;
  margin-left: 10px;

  &:hover {
    background-color: #f0f0f0;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  i {
    margin-right: 6px;
    font-size: 14px;
  }

  @media (max-width: 600px) {
    padding: 6px 12px;
    font-size: 14px;
  }
`;

const Navigation = () => {
  // Get current location to highlight active link
  const location = useLocation();
  
  return (
    <NavbarContainer>
      <LogoContainer>
        <Link to="/">
          <Logo src={hereLogoUrl} alt="HERE Maps Logo" />
        </Link>
        <AppName>POI Validation Tool</AppName>
      </LogoContainer>
      
      <NavMenu>
        <NavItem to="/" active={location.pathname === '/'}>
          Home
        </NavItem>
        <NavItem to="/team" active={location.pathname === '/team'}>
          Team
        </NavItem>
        <DocsButton href="https://developer.here.com/documentation" target="_blank">
          <i className="fas fa-book"></i> API Docs
        </DocsButton>
      </NavMenu>
    </NavbarContainer>
  );
};

export default Navigation;