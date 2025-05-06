import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const FPSDisplay = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 1000;
`;

const FPSCounter = () => {
  const [fps, setFps] = useState(0);
  
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    const updateInterval = 100; 
    
    const updateFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= updateInterval) {
        setFps(Math.round((frameCount * 1000) / updateInterval));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(updateFPS);
    };
    
    const animationId = requestAnimationFrame(updateFPS);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return <FPSDisplay>FPS: {fps}</FPSDisplay>;
};

export default FPSCounter;