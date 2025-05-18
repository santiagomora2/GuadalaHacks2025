// frontend/src/components/UI/MovingCarsEffect.jsx
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const EffectContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
  overflow: hidden;
`;

const MovingCarsEffect = () => {
  const canvasRef = useRef(null);
  const requestIdRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let cars = [];
    let animationActive = true;

    // Set canvas dimensions to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Initialize the canvas
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Car class
    class Car {
      constructor() {
        this.reset();
      }

      reset() {
        // Direction: left-to-right or right-to-left
        this.direction = Math.random() > 0.5 ? 1 : -1;
        
        // Position
        this.x = this.direction === 1 ? -50 : canvas.width + 50;
        
        // Vertical position - distribute at different "lanes"
        // But avoid the center area where content will be
        const topMargin = canvas.height * 0.2;
        const bottomMargin = canvas.height * 0.8;
        const middleAvoid = canvas.height * 0.4;
        const middleAvoidHeight = canvas.height * 0.2;
        
        // Randomly place in top or bottom sections, avoiding the middle
        if (Math.random() > 0.5) {
          this.y = Math.random() * (middleAvoid - topMargin) + topMargin;
        } else {
          this.y = Math.random() * (bottomMargin - (middleAvoid + middleAvoidHeight)) + (middleAvoid + middleAvoidHeight);
        }
        
        // Size (length of the car)
        this.width = Math.random() * 20 + 30;
        this.height = this.width / 2;
        
        // Speed
        this.speed = Math.random() * 2 + 1;
        
        // Opacity for fade effect
        this.opacity = Math.random() * 0.3 + 0.1;
        
        // Color variations - HERE color palette
        const colors = [
          'rgba(74, 86, 166, opacity)',  // Primary HERE blue
          'rgba(0, 175, 170, opacity)',   // Secondary HERE teal
          'rgba(112, 112, 112, opacity)', // Gray
          'rgba(0, 143, 213, opacity)'    // Another blue shade
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)]
          .replace('opacity', this.opacity);
      }

      update() {
        // Move in the right direction
        this.x += this.speed * this.direction;
        
        // Reset if it goes off screen
        if ((this.direction === 1 && this.x > canvas.width + 50) ||
            (this.direction === -1 && this.x < -50)) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        
        // Car body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Car details (windows, etc.)
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity + 0.1})`;
        
        // Windows
        const windowWidth = this.width * 0.2;
        const windowHeight = this.height * 0.6;
        const windowY = this.y + (this.height - windowHeight) / 2;
        
        // Front window
        ctx.fillRect(
          this.direction === 1 ? this.x + this.width * 0.7 : this.x + this.width * 0.1,
          windowY,
          windowWidth,
          windowHeight
        );
        
        // Back window
        ctx.fillRect(
          this.direction === 1 ? this.x + this.width * 0.2 : this.x + this.width * 0.6,
          windowY,
          windowWidth,
          windowHeight
        );
        
        // Headlights and taillights
        ctx.fillStyle = this.direction === 1 
          ? `rgba(255, 255, 200, ${this.opacity + 0.2})` // Headlight color
          : `rgba(255, 0, 0, ${this.opacity + 0.2})`; // Taillight color
        
        // Front light
        ctx.fillRect(
          this.direction === 1 ? this.x + this.width - 3 : this.x,
          this.y + this.height * 0.2,
          3,
          this.height * 0.2
        );
        
        // Rear light
        ctx.fillStyle = this.direction === 1 
          ? `rgba(255, 0, 0, ${this.opacity + 0.2})` // Taillight color
          : `rgba(255, 255, 200, ${this.opacity + 0.2})`; // Headlight color
        
        ctx.fillRect(
          this.direction === 1 ? this.x : this.x + this.width - 3,
          this.y + this.height * 0.6,
          3,
          this.height * 0.2
        );
        
        ctx.restore();
      }
    }

    // Create cars
    const initCars = () => {
      // Number of cars - adjust for density
      const carCount = Math.floor(canvas.width / 150);
      cars = [];
      
      for (let i = 0; i < carCount; i++) {
        const car = new Car();
        // Distribute cars horizontally to start
        car.x = Math.random() * canvas.width;
        cars.push(car);
      }
    };
    
    initCars();

    // Animation loop
    const animate = () => {
      if (!animationActive) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      cars.forEach(car => {
        car.update();
        car.draw();
      });
      
      requestIdRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    // Clean up on unmount
    return () => {
      animationActive = false;
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(requestIdRef.current);
    };
  }, []);

  return (
    <EffectContainer>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </EffectContainer>
  );
};

export default MovingCarsEffect;