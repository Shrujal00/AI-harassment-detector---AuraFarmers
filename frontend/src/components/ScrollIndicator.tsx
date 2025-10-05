import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export function ScrollIndicator() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      // Calculate how far down the page the user has scrolled
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx = 
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = scrollPx / winHeightPx * 100;
      
      setScrollProgress(scrolled);
      setShowScrollTop(scrollPx > 500);
    };
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  const handleScrollDown = () => {
    const viewportHeight = window.innerHeight;
    window.scrollTo({
      top: viewportHeight,
      behavior: 'smooth'
    });
  };
  
  return (
    <>
      {/* Scroll progress indicator */}
      <div 
        className="progress fixed-top" 
        style={{ 
          height: '4px', 
          zIndex: 1031,
          opacity: 0.8,
          background: 'transparent' 
        }}
      >
        <div 
          className="progress-bar" 
          role="progressbar" 
          style={{ 
            width: `${scrollProgress}%`,
            backgroundColor: 'var(--color-primary)',
            boxShadow: '0 0 8px var(--color-primary)',
          }}
          aria-valuenow={scrollProgress} 
          aria-valuemin={0} 
          aria-valuemax={100}
        ></div>
      </div>
      
      {/* Initial scroll down button */}
      <div 
        className="scroll-down-indicator"
        style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: showScrollTop ? 0 : 0.8,
          transition: 'opacity 0.3s ease',
          pointerEvents: showScrollTop ? 'none' : 'all',
          zIndex: 10,
        }}
      >
        <button 
          className="btn btn-floating rounded-circle"
          onClick={handleScrollDown}
          style={{
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(10, 132, 255, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            animation: 'float 3s infinite',
          }}
        >
          <ChevronDown style={{ width: '24px', height: '24px' }} className="text-white" />
        </button>
      </div>
      
      {/* Scroll to top button */}
      <div 
        className="scroll-to-top" 
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          opacity: showScrollTop ? 0.8 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: showScrollTop ? 'all' : 'none',
          zIndex: 1000,
        }}
      >
        <button 
          className="btn btn-floating rounded-circle glow-effect"
          onClick={handleScrollToTop}
          style={{
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(10, 132, 255, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <ChevronDown 
            style={{ width: '24px', height: '24px', transform: 'rotate(180deg)' }} 
            className="text-white" 
          />
        </button>
      </div>
    </>
  );
}
