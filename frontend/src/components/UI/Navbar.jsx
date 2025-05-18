// frontend/src/components/UI/Navbar.jsx
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import hereLogoUrl from '../../assets/images/logo.png';

// Subtle animation for gradient background
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Main navbar container with premium styling
const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 40px;
  background: linear-gradient(135deg, #00AFAA, #4A56A6, #3862B8, #00AFAA);
  background-size: 300% 300%;
  animation: ${gradientShift} 15s ease infinite;
  color: white;
  box-shadow: 0 3px 20px rgba(0, 0, 0, 0.15), 0 0 40px rgba(74, 86, 166, 0.2);
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent);
  }
  
  @media (max-width: 768px) {
    padding: 16px 25px;
  }
`;

// Container for logo and app name with enhanced animation
const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 0;
    height: 2px;
    background: white;
    transition: width 0.3s ease;
  }
  
  &:hover:after {
    width: 100%;
  }
`;

// Pulse animation for logo
const logoPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.3); }
  70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
`;

// Logo styling with enhanced effects
const Logo = styled.div`
  height: 38px;
  width: 38px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    animation: ${logoPulse} 1.5s infinite;
    transform: rotate(5deg);
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
  }
`;

// App name styling with premium typography
const AppName = styled.h1`
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  color: white;
  letter-spacing: 0.6px;
  position: relative;
  
  span {
    background: linear-gradient(to right, #ffffff, #e0e6ff);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
    font-weight: 700;
  }
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
  
  @media (max-width: 600px) {
    display: none;
  }
`;

// Navigation menu with improved spacing
const NavMenu = styled.div`
  display: flex;
  gap: 25px;
  align-items: center;
  
  @media (max-width: 768px) {
    gap: 15px;
  }
`;

// Base effects for nav items
const navItemFocus = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(255, 255, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
`;

// Navigation item with premium styling and animations
const NavItemLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 30px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  letter-spacing: 0.5px;
  background-color: ${props => props.isactive === "true" ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  overflow: hidden;
  z-index: 1;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
    opacity: 0;
    z-index: -1;
    transition: opacity 0.3s ease;
    border-radius: 30px;
  }
  
  &:hover {
    transform: translateY(-3px);
    background-color: ${props => props.isactive === "true" ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)'};
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
    
    &:before {
      opacity: 1;
    }
  }
  
  &:active {
    transform: translateY(1px);
    animation: ${navItemFocus} 0.8s;
  }
  
  ${props => props.isactive === "true" && `
    font-weight: 600;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
    
    &:after {
      content: '';
      position: absolute;
      bottom: 5px;
      left: 20px;
      right: 20px;
      height: 2px;
      background: linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0));
      border-radius: 1px;
    }
  `}
  
  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 15px;
  }
`;

const Navbar = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const [scrolled, setScrolled] = useState(false);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <NavbarContainer style={{ 
      padding: scrolled ? '14px 40px' : '18px 40px',
      boxShadow: scrolled ? '0 5px 25px rgba(0, 0, 0, 0.2), 0 0 40px rgba(74, 86, 166, 0.25)' : '0 3px 20px rgba(0, 0, 0, 0.15), 0 0 40px rgba(74, 86, 166, 0.2)'
    }}>
      <LogoContainer>
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <Logo>
            <img src={hereLogoUrl} alt="HERE Maps Logo" />
          </Logo>
        </Link>
        <AppName><span>POI</span> 295 Validation Tool</AppName>
      </LogoContainer>
      
      <NavMenu>
        <NavItemLink to="/" isactive={(pathname === '/' || pathname === '') ? "true" : "false"}>
          Map
        </NavItemLink>
        <NavItemLink to="/team" isactive={pathname === '/team' ? "true" : "false"}>
          Meet the Team
        </NavItemLink>
      </NavMenu>
    </NavbarContainer>
  );
};

export default Navbar;