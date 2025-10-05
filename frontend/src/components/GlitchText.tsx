import { useState, useEffect } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
  glitchInterval?: number;
  duration?: number;
}

export function GlitchText({
  text,
  className = '',
  glitchInterval = 3000,
  duration = 200
}: GlitchTextProps) {
  const [glitching, setGlitching] = useState(false);
  const [displayText, setDisplayText] = useState(text);
  
  // Characters to use for glitching
  const glitchChars = '!<>-_\\\\./[]{}—=+*^?#________';
  
  const glitchText = () => {
    setGlitching(true);
    
    let iterations = 0;
    const maxIterations = 10;
    const interval = duration / maxIterations;
    
    const glitchEffect = setInterval(() => {
      // Generate glitched version of text
      setDisplayText(
        text
          .split('')
          .map((char, idx) => {
            // Keep some characters intact to maintain readability
            if (Math.random() < 0.7 || char === ' ') {
              return char;
            }
            
            // Replace with random glitch character
            return glitchChars[Math.floor(Math.random() * glitchChars.length)];
          })
          .join('')
      );
      
      iterations++;
      
      // Final iteration restores original text
      if (iterations >= maxIterations) {
        clearInterval(glitchEffect);
        setDisplayText(text);
        setGlitching(false);
      }
    }, interval);
  };
  
  useEffect(() => {
    // Initial glitch on mount
    const initialTimeout = setTimeout(glitchText, 500);
    
    // Set up periodic glitching
    const glitchTimer = setInterval(glitchText, glitchInterval);
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(glitchTimer);
    };
  }, [text, glitchInterval]);
  
  return (
    <span 
      className={`glitch-text ${className} ${glitching ? 'glitching' : ''}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        fontWeight: 'bold'
      }}
      onMouseEnter={glitchText}
    >
      {displayText}
      
      {/* Add data noise effect */}
      <span
        className="data-noise"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          opacity: glitching ? 0.8 : 0,
          backgroundImage: 'linear-gradient(to bottom, var(--color-primary), transparent)',
          backgroundSize: '2px 2px',
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
          transition: 'opacity 0.2s ease'
        }}
      />
    </span>
  );
}
