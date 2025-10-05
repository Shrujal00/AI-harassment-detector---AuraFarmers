// Scroll Animation Handler

export function initScrollAnimations() {
  // Elements with scroll-driven animations
  const animatedElements = document.querySelectorAll(
    '.reveal-on-scroll, .scroll-trigger, .staggered-item, .scroll-parallax'
  );
  
  // Track mouse for magnetic elements
  const magneticElements = document.querySelectorAll('.magnetic');
  
  // Handle scroll animations
  const handleScrollAnimation = () => {
    const windowHeight = window.innerHeight;
    const triggerPoint = windowHeight * 0.8; // 80% of viewport height
    
    animatedElements.forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      const distanceFromTop = rect.top;
      
      // Element is in view
      if (distanceFromTop < triggerPoint) {
        // Add visible class with delay based on index for staggered items
        if (el.classList.contains('staggered-item')) {
          setTimeout(() => {
            el.classList.add('visible');
          }, index * 100);
        } else {
          el.classList.add('visible');
        }
        
        // Handle parallax effect
        if (el.classList.contains('scroll-parallax')) {
          const scrolled = window.scrollY;
          const speed = el.dataset.speed || 0.1;
          el.style.transform = `translateY(${scrolled * speed}px)`;
        }
      } else {
        // Optional: remove class when out of view for repeat animations
        // el.classList.remove('visible');
      }
    });
  };
  
  // Magnetic effect on hover
  const handleMagneticEffect = (e) => {
    magneticElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // Only apply effect when mouse is close to element
      const distance = Math.sqrt(x*x + y*y);
      const maxDistance = 100; // max distance to apply effect
      
      if (distance < maxDistance) {
        // Scale down effect based on distance
        const scale = 1 - (distance / maxDistance);
        const power = 15 * scale; // max movement in pixels
        
        el.style.transform = `translate(${x/power}px, ${y/power}px)`;
      } else {
        el.style.transform = 'translate(0, 0)';
      }
    });
  };
  
  // Create mouse trailer effect
  const createMouseTrailer = () => {
    const trailer = document.createElement('div');
    trailer.className = 'cursor-trailer';
    document.body.appendChild(trailer);
    
    // Array to store trail points
    const trails = [];
    const trailCount = 5;
    
    for (let i = 0; i < trailCount; i++) {
      const trail = document.createElement('div');
      trail.className = 'cursor-trailer';
      trail.style.opacity = 0.3 - (i * 0.05);
      trail.style.width = `${8 - i}px`;
      trail.style.height = `${8 - i}px`;
      document.body.appendChild(trail);
      trails.push({
        element: trail,
        x: 0,
        y: 0
      });
    }
    
    window.addEventListener('mousemove', (e) => {
      // Update main trailer
      trailer.style.left = `${e.clientX}px`;
      trailer.style.top = `${e.clientY}px`;
      
      // Update trail with delay
      setTimeout(() => {
        // Shift positions
        for (let i = trails.length - 1; i > 0; i--) {
          trails[i].x = trails[i-1].x;
          trails[i].y = trails[i-1].y;
        }
        
        // Set first trail to current position
        trails[0].x = e.clientX;
        trails[0].y = e.clientY;
        
        // Update all trails
        trails.forEach(trail => {
          trail.element.style.left = `${trail.x}px`;
          trail.element.style.top = `${trail.y}px`;
        });
      }, 50);
    });
  };
  
  // Init parallax items
  const initParallax = () => {
    const parallaxSections = document.querySelectorAll('.parallax-section');
    
    parallaxSections.forEach(section => {
      const elements = section.querySelectorAll('.parallax-element');
      
      window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const sectionTop = section.offsetTop;
        const scrollPosition = scrollY - sectionTop;
        
        elements.forEach(element => {
          const speed = element.dataset.speed || 0.1;
          element.style.transform = `translateY(${scrollPosition * speed}px)`;
        });
      });
    });
  };
  
  // Initialize everything
  window.addEventListener('scroll', handleScrollAnimation);
  window.addEventListener('mousemove', handleMagneticEffect);
  
  // Run once on load
  handleScrollAnimation();
  initParallax();
  createMouseTrailer();
  
  // Optional: Clean up event listeners
  return () => {
    window.removeEventListener('scroll', handleScrollAnimation);
    window.removeEventListener('mousemove', handleMagneticEffect);
  };
}
