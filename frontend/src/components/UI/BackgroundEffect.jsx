// frontend/src/components/UI/BackgroundEffect.jsx
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

// Container positioned fixed to cover the entire viewport
const EffectContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(250, 252, 255, 0.9) 0%, rgba(240, 244, 252, 0.9) 100%);
`;

// Canvas element to fill the container
const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
`;

const BackgroundEffect = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let particles = [];
    let animationFrameId = null;
    
    // Mouse position
    let mouseX = null;
    let mouseY = null;
    let mouseRadius = 120; // Radius of influence for mouse interaction
    
    // Set canvas dimensions to match window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Track mouse position
    const updateMousePosition = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    // Mouse events
    window.addEventListener('mousemove', updateMousePosition);
    
    // Reset mouse position when mouse leaves the window
    window.addEventListener('mouseout', () => {
      mouseX = null;
      mouseY = null;
    });
    
    // Particle class with MUCH bigger stars
    class Particle {
      constructor() {
        this.reset();
        // Very short trails that don't persist
        this.trailLength = Math.floor(Math.random() * 2) + 1; // Extremely short trails (1-2 positions)
        this.trail = [];
      }
      
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        // MUCH LARGER STARS
        this.size = Math.random() * 7 + 5;  // Very big stars (5-12 pixels)
        this.baseSpeed = Math.random() * 0.5 + 0.2; // Base fall speed
        this.speed = this.baseSpeed;
        this.sway = Math.random() * 0.8 - 0.4; // Subtle swaying
        this.opacity = Math.random() * 0.7 + 0.3; // Good visibility
        this.trail = []; // Reset trail
        
        // More pronounced star shape
        this.spikes = 5; // Five pointed star
        this.spikeRatio = 0.35; // Even more pronounced points (smaller ratio = sharper points)
        
        // Colorful palette
        const colors = [
          [74, 86, 166],     // HERE blue
          [0, 175, 170],     // HERE teal
          [120, 160, 250],   // Light blue
          [0, 143, 213],     // Another blue
          [255, 140, 0],     // Orange (for contrast)
          [255, 215, 0],     // Gold
          [147, 112, 219],   // Medium purple
          [64, 224, 208],    // Turquoise
          [255, 192, 203]    // Pink
        ];
        
        const colorIdx = Math.floor(Math.random() * colors.length);
        this.r = colors[colorIdx][0];
        this.g = colors[colorIdx][1];
        this.b = colors[colorIdx][2];
        this.color = `rgba(${this.r}, ${this.g}, ${this.b}, ${this.opacity})`;
        
        // Bright trail color
        this.trailR = Math.min(255, this.r + 50);
        this.trailG = Math.min(255, this.g + 50);
        this.trailB = Math.min(255, this.b + 50);
      }
      
      // Handle mouse interaction
      handleMouseInteraction() {
        if (mouseX === null || mouseY === null) return;
        
        // Calculate distance to mouse
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If within influence radius
        if (distance < mouseRadius) {
          // Calculate influence factor (stronger when closer)
          const influence = 1 - distance / mouseRadius;
          
          // Apply influence: particles move away from mouse
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * influence * 2;
          this.y += Math.sin(angle) * influence * 2;
          
          // Increase brightness when near mouse
          this.color = `rgba(${Math.min(255, this.r + influence * 100)}, 
                              ${Math.min(255, this.g + influence * 100)}, 
                              ${Math.min(255, this.b + influence * 100)}, 
                              ${Math.min(1, this.opacity + influence * 0.3)})`;
          
          // Make trail brighter too
          this.trailR = Math.min(255, this.r + 80 + influence * 50);
          this.trailG = Math.min(255, this.g + 80 + influence * 50);
          this.trailB = Math.min(255, this.b + 80 + influence * 50);
          
          // Change speed near mouse (slow down)
          this.speed = this.baseSpeed * (1 - influence * 0.8);
        } else {
          // Reset to normal speed when away from mouse
          this.speed = this.baseSpeed;
        }
      }
      
      update() {
        // Handle mouse interaction
        this.handleMouseInteraction();
        
        // Add current position to trail
        this.trail.push({ x: this.x, y: this.y, size: this.size });
        
        // Keep trail very short
        if (this.trail.length > this.trailLength) {
          this.trail.shift();
        }
        
        // Move down
        this.y += this.speed;
        
        // Gentle sway with sinusoidal movement
        this.x += Math.sin(this.y * 0.01) * this.sway;
        
        // Reset if offscreen
        if (this.y > canvas.height || this.x < -50 || this.x > canvas.width + 50) {
          this.reset();
        }
      }
      
      draw() {
        // Draw the trail (from oldest to newest)
        for (let i = 0; i < this.trail.length; i++) {
          const point = this.trail[i];
          const trailOpacity = (i / this.trail.length) * this.opacity * 0.5; // Lower opacity for less persistence
          const trailSize = point.size * (i / this.trail.length) * 0.7;
          
          ctx.fillStyle = `rgba(${this.trailR}, ${this.trailG}, ${this.trailB}, ${trailOpacity})`;
          ctx.beginPath();
          this.drawStar(ctx, point.x, point.y, this.spikes, trailSize, trailSize * this.spikeRatio);
          ctx.fill();
        }
        
        // Draw star with outline for better definition
        ctx.fillStyle = this.color;
        ctx.strokeStyle = `rgba(255, 255, 255, 0.8)`;
        ctx.lineWidth = 0.8; // Thicker outline for better visibility
        
        // Draw the main star with more defined shape
        ctx.beginPath();
        this.drawStar(ctx, this.x, this.y, this.spikes, this.size, this.size * this.spikeRatio);
        ctx.fill();
        ctx.stroke();
        
        // Add a glow effect for stars
        ctx.shadowBlur = 20; // Even stronger glow
        ctx.shadowColor = `rgba(${this.r}, ${this.g}, ${this.b}, 0.7)`;
        ctx.beginPath();
        this.drawStar(ctx, this.x, this.y, this.spikes, this.size * 0.7, this.size * 0.3);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow
      }
      
      // Method to draw a well-defined star
      drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;
        
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
          x = cx + Math.cos(rot) * outerRadius;
          y = cy + Math.sin(rot) * outerRadius;
          ctx.lineTo(x, y);
          rot += step;
          
          x = cx + Math.cos(rot) * innerRadius;
          y = cy + Math.sin(rot) * innerRadius;
          ctx.lineTo(x, y);
          rot += step;
        }
        
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
      }
    }
    
    // Create initial particles
    const initParticles = () => {
      particles = [];
      // Fewer particles due to their larger size
      const particleCount = Math.max(15, Math.min(25, Math.floor(canvas.width * canvas.height / 50000)));
      
      for (let i = 0; i < particleCount; i++) {
        const particle = new Particle();
        // Distribute initially across the screen
        particle.y = Math.random() * canvas.height;
        
        // Initialize trail positions
        for (let j = 0; j < particle.trailLength; j++) {
          const trailY = particle.y - (j * particle.speed * 3);
          const trailX = particle.x + (Math.sin(trailY * 0.01) * particle.sway * j);
          if (particle.trail.length < particle.trailLength) {
            particle.trail.unshift({ x: trailX, y: trailY, size: particle.size });
          }
        }
        
        particles.push(particle);
      }
    };
    
    // Add a star at mouse position when clicked
    const handleClick = (e) => {
      const newParticle = new Particle();
      newParticle.x = e.clientX;
      newParticle.y = e.clientY;
      newParticle.size = Math.random() * 8 + 6; // Even bigger for click-created stars
      particles.push(newParticle);
    };
    
    window.addEventListener('click', handleClick);
    
    initParticles();
    
    // Animation loop with complete canvas clearing on each frame
    const animate = () => {
      // COMPLETE CLEAR of the canvas each frame - no trail persistence
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup all event listeners when component unmounts
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseout', () => {
        mouseX = null;
        mouseY = null;
      });
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <EffectContainer>
      <Canvas ref={canvasRef} />
    </EffectContainer>
  );
};

export default BackgroundEffect;