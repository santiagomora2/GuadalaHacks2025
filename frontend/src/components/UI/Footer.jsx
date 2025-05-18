// frontend/src/components/UI/Footer.jsx
import React from 'react';
import styled from 'styled-components';

// Main footer container
const FooterContainer = styled.footer`
  background: rgba(45, 48, 53, 0.95);
  color: white;
  padding: 30px 20px;
  text-align: center;
  position: relative;
  z-index: 2;
  backdrop-filter: blur(10px);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
`;

// Footer content grid
const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto 30px;
  text-align: left;
  position: relative;
  z-index: 2;
`;

// Footer section
const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  background: rgba(35, 38, 43, 0.5);
  padding: 20px;
  border-radius: 8px;
  backdrop-filter: blur(5px);
`;

// Section title
const SectionTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 16px;
  color: #00AFAA;
  font-weight: 600;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    height: 2px;
    width: 40px;
    background-color: #00AFAA;
  }
`;

// Footer link
const FooterLink = styled.a`
  color: #ffffff;
  text-decoration: none;
  margin-bottom: 10px;
  font-size: 14px;
  transition: color 0.2s ease;
  
  &:hover {
    color: #00AFAA;
    text-decoration: underline;
  }
`;

// Footer text paragraph
const FooterText = styled.p`
  color: #ffffff;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 10px;
`;

// Social icons container
const SocialIcons = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 10px;
`;

// Social icon
const SocialIcon = styled.a`
  color: white;
  background-color: rgba(74, 86, 166, 0.8);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(5px);
  
  &:hover {
    background-color: #00AFAA;
    transform: translateY(-2px);
  }
`;

// Copyright section
const Copyright = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 14px;
  color: #ffffff;
  position: relative;
  z-index: 2;
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterGrid>
        <FooterSection>
          <SectionTitle>About HERE</SectionTitle>
          <FooterText>
            HERE Technologies is a leading location data and technology platform, providing precise mapping and location intelligence for enterprises and developers worldwide.
          </FooterText>
          <SocialIcons>
            <SocialIcon href="https://x.com/here" target="_blank" aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </SocialIcon>
            <SocialIcon href="https://www.linkedin.com/company/here" target="_blank" aria-label="LinkedIn">
              <i className="fab fa-linkedin-in"></i>
            </SocialIcon>
            <SocialIcon href="https://github.com/heremaps" target="_blank" aria-label="GitHub">
              <i className="fab fa-github"></i>
            </SocialIcon>
          </SocialIcons>
        </FooterSection>
        
        <FooterSection>
          <SectionTitle>Documentation</SectionTitle>
          <FooterLink href="https://developer.here.com/documentation" target="_blank">API Reference</FooterLink>
          <FooterLink href="https://developer.here.com/tutorials" target="_blank">Tutorials</FooterLink>
          <FooterLink href="https://developer.here.com/blog" target="_blank">Developer Blog</FooterLink>
          <FooterLink href="https://stackoverflow.com/questions/tagged/here-api" target="_blank">Stack Overflow</FooterLink>
        </FooterSection>
        
        <FooterSection>
          <SectionTitle>Validation Tools</SectionTitle>
          <FooterLink href="#" target="_blank">POI Validation Specs</FooterLink>
          <FooterLink href="#" target="_blank">Median Detection</FooterLink>
          <FooterLink href="#" target="_blank">Specification 295</FooterLink>
          <FooterLink href="#" target="_blank">Validation Result Guide</FooterLink>
        </FooterSection>
        
        <FooterSection>
          <SectionTitle>Contact</SectionTitle>
          <FooterText>
            Questions about our POI validation tools or APIs?
          </FooterText>
          <FooterLink href="mailto:developer.support@here.com">developer.support@here.com</FooterLink>
          <FooterText>
            Zapopan, Jalisco, Mexico
          </FooterText>
        </FooterSection>
      </FooterGrid>
      
      <Copyright>
        © {new Date().getFullYear()} HERE POI Validation Tool. All rights reserved.
      </Copyright>
    </FooterContainer>
  );
};

export default Footer;