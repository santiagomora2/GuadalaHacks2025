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
  background: linear-gradient(135deg, rgba(250, 252, 255, 0.97) 0%, rgba(240, 244, 252, 0.97) 100%);
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
    let mouseRadius = 150; // Increased radius of influence for mouse interaction
    
    // Declaración previa de initParticles para evitar el error de referencia
  let initParticles; // Declaramos la variable primero
  
  // Set canvas dimensions to match window size
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Reinitialize particles when canvas size changes
    if (initParticles) {
      initParticles();
    }
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
    
    // Refined Particle class
    class Particle {
      constructor() {
        this.reset();
        // More elegant trailing effect
        this.trailLength = Math.floor(Math.random() * 3) + 2; // 2-4 positions for trail
        this.trail = [];
        this.fadeRate = Math.random() * 0.01 + 0.005; // Slower fade rate for elegant effect
      }
      
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        // More balanced star sizes
        this.size = Math.random() * 3 + 2;  // Smaller, more elegant stars (2-5 pixels)
        this.baseSpeed = Math.random() * 0.3 + 0.1; // Slower, more graceful movement
        this.speed = this.baseSpeed;
        this.sway = Math.random() * 0.6 - 0.3; // Subtle swaying
        this.opacity = Math.random() * 0.5 + 0.2; // More subtle visibility
        this.trail = []; // Reset trail
        this.pulseSpeed = Math.random() * 0.02 + 0.01; // For subtle pulsing
        this.pulsePhase = Math.random() * Math.PI * 2; // Random starting phase
        
        // More subtle star shape
        this.spikes = Math.random() > 0.7 ? 5 : 4; // Mix of 4 and 5 pointed stars for variety
        this.spikeRatio = 0.5; // More subtle points (larger ratio = smoother points)
        
        // More refined color palette
        const colors = [
          [74, 86, 166, 0.4],    // HERE blue (more transparent)
          [0, 175, 170, 0.3],    // HERE teal (more transparent)
          [120, 160, 250, 0.25], // Light blue (very transparent)
          [0, 143, 213, 0.3],    // Another blue (more transparent)
          [255, 215, 0, 0.2]     // Gold (very subtle)
        ];
        
        const colorIdx = Math.floor(Math.random() * colors.length);
        this.r = colors[colorIdx][0];
        this.g = colors[colorIdx][1];
        this.b = colors[colorIdx][2];
        this.baseOpacity = colors[colorIdx][3]; // Base opacity from palette
        this.opacity = this.baseOpacity;
        this.color = `rgba(${this.r}, ${this.g}, ${this.b}, ${this.opacity})`;
        
        // Subtle trail color
        this.trailR = this.r;
        this.trailG = this.g;
        this.trailB = this.b;
      }
      
      // Handle mouse interaction with more elegant response
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
          
          // Apply influence: particles move away from mouse (more subtle)
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * influence * 1.5;
          this.y += Math.sin(angle) * influence * 1.5;
          
          // Gentle increase in brightness when near mouse
          this.color = `rgba(${Math.min(255, this.r + influence * 70)}, 
                              ${Math.min(255, this.g + influence * 70)}, 
                              ${Math.min(255, this.b + influence * 70)}, 
                              ${Math.min(0.8, this.baseOpacity + influence * 0.3)})`;
          
          // Make trail subtly brighter too
          this.trailR = Math.min(255, this.r + 30 + influence * 40);
          this.trailG = Math.min(255, this.g + 30 + influence * 40);
          this.trailB = Math.min(255, this.b + 30 + influence * 40);
          
          // Change speed near mouse (gentle slow down)
          this.speed = this.baseSpeed * (1 - influence * 0.5);
        } else {
          // Reset to normal speed and color when away from mouse
          this.speed = this.baseSpeed;
          this.color = `rgba(${this.r}, ${this.g}, ${this.b}, ${this.baseOpacity})`;
          this.trailR = this.r;
          this.trailG = this.g;
          this.trailB = this.b;
        }
      }
      
      update() {
        // Handle mouse interaction
        this.handleMouseInteraction();
        
        // Add current position to trail
        this.trail.push({ x: this.x, y: this.y, size: this.size });
        
        // Keep trail at appropriate length
        if (this.trail.length > this.trailLength) {
          this.trail.shift();
        }
        
        // Move down at elegant pace
        this.y += this.speed;
        
        // Gentle sway with sinusoidal movement
        this.x += Math.sin(this.y * 0.01) * this.sway;
        
        // Subtle pulsing effect
        this.opacity = this.baseOpacity + (Math.sin(this.pulsePhase) * 0.1);
        this.pulsePhase += this.pulseSpeed;
        
        // Reset if offscreen
        if (this.y > canvas.height || this.x < -50 || this.x > canvas.width + 50) {
          this.reset();
        }
      }
      
      draw() {
        // Draw the trail (from oldest to newest) with greater subtlety
        for (let i = 0; i < this.trail.length; i++) {
          const point = this.trail[i];
          const trailOpacity = (i / this.trail.length) * this.opacity * 0.3; // Lower opacity for more subtle trails
          const trailSize = point.size * (i / this.trail.length) * 0.6;
          
          if (trailOpacity > 0.02) { // Only draw if visible enough
            ctx.fillStyle = `rgba(${this.trailR}, ${this.trailG}, ${this.trailB}, ${trailOpacity})`;
            ctx.beginPath();
            this.drawStar(ctx, point.x, point.y, this.spikes, trailSize, trailSize * this.spikeRatio);
            ctx.fill();
          }
        }
        
        // Draw star with subtle outline
        ctx.fillStyle = this.color;
        ctx.strokeStyle = `rgba(255, 255, 255, 0.4)`; // More subtle outline
        ctx.lineWidth = 0.3; // Thinner outline for elegance
        
        // Draw the main star with more refined shape
        ctx.beginPath();
        this.drawStar(ctx, this.x, this.y, this.spikes, this.size, this.size * this.spikeRatio);
        ctx.fill();
        ctx.stroke();
        
        // Add a subtle glow effect
        ctx.shadowBlur = 6; // Subtle glow
        ctx.shadowColor = `rgba(${this.r}, ${this.g}, ${this.b}, 0.3)`;
        ctx.beginPath();
        this.drawStar(ctx, this.x, this.y, this.spikes, this.size * 0.6, this.size * 0.4);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow
      }
      
      // Method to draw a well-defined but subtle star
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
    
    // Create initial particles - SIGNIFICANTLY REDUCED COUNT
    initParticles = () => {
      particles = [];
      // Much fewer particles for elegant, non-overwhelming effect
      const particleCount = Math.max(8, Math.min(12, Math.floor(canvas.width * canvas.height / 120000)));
      
      for (let i = 0; i < particleCount; i++) {
        const particle = new Particle();
        // Distribute initially across the screen
        particle.y = Math.random() * canvas.height;
        
        // Initialize trail positions for smoother start
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
    
    // Add a star at mouse position when clicked - more subtle
    const handleClick = (e) => {
      // Only add star 50% of the time for a more subtle effect
      if (Math.random() > 0.5) {
        const newParticle = new Particle();
        newParticle.x = e.clientX;
        newParticle.y = e.clientY;
        newParticle.size = Math.random() * 4 + 2; // More elegant size for click-created stars
        particles.push(newParticle);
      }
    };
    
    window.addEventListener('click', handleClick);
    
    initParticles();
    
    // Animation loop with elegant fading
    const animate = () => {
      // Semi-transparent clear for very subtle trails
      ctx.fillStyle = 'rgba(250, 252, 255, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
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