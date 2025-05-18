// frontend/src/components/Team/TeamPage.jsx
import React from 'react';
import styled from 'styled-components';

// Import developer images
// You'll need to place these images in your assets/images folder
import developer1 from '../../assets/images/developer1.jpg';
import developer2 from '../../assets/images/developer2.jpg';
import developer3 from '../../assets/images/developer3.jpg';
import developer4 from '../../assets/images/developer4.jpg';

// Container for the entire team page
const TeamContainer = styled.section`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
`;

// Section title with HERE Maps style
const SectionTitle = styled.h2`
  color: #4A56A6;
  font-size: 2.2rem;
  margin-bottom: 40px;
  text-align: center;
  position: relative;
  display: inline-block;
  margin-left: auto;
  margin-right: auto;
  width: 100%;

  &:after {
    content: '';
    position: absolute;
    bottom: -12px;
    left: 50%;
    transform: translateX(-50%);
    height: 4px;
    width: 80px;
    background: linear-gradient(90deg, #00AFAA 0%, #4A56A6 100%);
    border-radius: 2px;
  }
`;

// Description text
const TeamDescription = styled.p`
  color: #555;
  font-size: 1.1rem;
  line-height: 1.6;
  text-align: center;
  max-width: 800px;
  margin: 0 auto 40px;
`;

// Grid layout for the team members
const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 30px;
  margin-top: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
`;

// Individual team member card
const MemberCard = styled.div`
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.1);
  }
`;

// Photo container with consistent aspect ratio
const PhotoContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 100%; /* 1:1 Aspect Ratio */
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
`;

// Developer photo
const Photo = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  
  ${MemberCard}:hover & {
    transform: scale(1.05);
  }
`;

// Info section under the photo
const MemberInfo = styled.div`
  padding: 20px;
  text-align: center;
`;

// Name with gradient effect
const MemberName = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #4A56A6;
`;

// Role/title
const MemberRole = styled.p`
  margin: 0 0 12px 0;
  font-size: 0.9rem;
  color: #00AFAA;
  font-weight: 500;
`;

// Social media links
const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 15px;
`;

// Individual social link
const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f0f2f5;
  color: #4A56A6;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #4A56A6;
    color: white;
    transform: translateY(-3px);
  }
  
  i {
    font-size: 15px;
  }
`;

// Footer note
const TeamFooter = styled.p`
  margin-top: 50px;
  text-align: center;
  font-size: 0.9rem;
  color: #777;
`;

// Developer data
const developers = [
  {
    id: 1,
    name: "Santiago Mora Cruz",
    role: "Data Scientist",
    photo: developer1,
    github: "https://github.com/santiagomora",
    linkedin: "https://linkedin.com/in/santiagomora",
  },
  {
    id: 2,
    name: "Jose Manuel Martinez Morales",
    role: "Software Developer",
    photo: developer2,
    github: "https://github.com/JoseMartinezM",
    linkedin: "https://www.linkedin.com/in/jose-manuel-martinez-morales-2880ab343/",
  },
  {
    id: 3,
    name: "Rene Abraham Calzadilla Calderon",
    role: "Data Scientist",
    photo: developer3,
    github: "https://github.com/rene-abraham",
    linkedin: "https://linkedin.com/in/rene-abraham",
  },
  {
    id: 4,
    name: "Guillermo Villegas Morales",
    role: "Data Scientist",
    photo: developer4,
    github: "https://github.com/memo",
    linkedin: "https://linkedin.com/in/memo",
  }
];

const TeamPage = () => {
  return (
    <TeamContainer>
      <SectionTitle>Meet Our Team</SectionTitle>
      
      <TeamDescription>
      We’re a team of young, passionate developers who love building cool stuff with code.
      During this hackathon, we’ve combined our creativity and technical skills to develop a powerful solution for validating and visualizing Points of Interest using HERE Maps and location-based services.
      </TeamDescription>
      
      <TeamGrid>
        {developers.map(developer => (
          <MemberCard key={developer.id}>
            <PhotoContainer>
              <Photo src={developer.photo} alt={developer.name} />
            </PhotoContainer>
            <MemberInfo>
              <MemberName>{developer.name}</MemberName>
              <MemberRole>{developer.role}</MemberRole>
              <SocialLinks>
                <SocialLink href={developer.github} target="_blank" aria-label="GitHub">
                  <i className="fab fa-github"></i>
                </SocialLink>
                <SocialLink href={developer.linkedin} target="_blank" aria-label="LinkedIn">
                  <i className="fab fa-linkedin-in"></i>
                </SocialLink>
              </SocialLinks>
            </MemberInfo>
          </MemberCard>
        ))}
      </TeamGrid>
      
      <TeamFooter>
        This team was assembled for the Guadalahacks Hackathon 2025.
      </TeamFooter>
    </TeamContainer>
  );
};

export default TeamPage;