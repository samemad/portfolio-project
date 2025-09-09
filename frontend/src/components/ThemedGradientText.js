// src/components/ThemedGradientText.js
import React, { useContext } from 'react';
import { ThemeContext } from '../App';
import GradientText from './GradientText';

export default function ThemedGradientText({ 
  children, 
  className = '',
  animationSpeed = 6,
  showBorder = false 
}) {
  const { theme } = useContext(ThemeContext);
  
  // Theme-based gradient colors matching your CSS
  const themeColors = {
    dark: ["#2b2b36, #1f1f2a"], // Purple gradients
    light: ["#ff6a00", "#ff8a1c", "#ff9e33", "#ffb84d", "#ff6a00"] // Orange gradients
  };
  
  const colors = themeColors[theme] || themeColors.dark;
  
  return (
    <GradientText
      colors={colors}
      animationSpeed={animationSpeed}
      showBorder={showBorder}
      className={className}
    >
      {children}
    </GradientText>
  );
}