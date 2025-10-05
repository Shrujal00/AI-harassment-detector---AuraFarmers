import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    
    // Set canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Create particles
    const particles: Particle[] = [];
    const particleCount = Math.min(50, Math.max(20, window.innerWidth / 40));
    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
    
    for (let i = 0; i < particleCount; i++) {
      const maxLife = Math.random() * 200 + 100;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.1,
        life: maxLife,
        maxLife: maxLife
      });
    }
    
    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle) => {
        // Update particle life
        particle.life--;
        
        // Reset particle if life is over
        if (particle.life <= 0) {
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
          particle.life = particle.maxLife;
          particle.alpha = Math.random() * 0.5 + 0.1;
        }
        
        // Move particles
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around edges instead of bouncing
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas.height;
        
        // Calculate alpha based on life
        const lifeRatio = particle.life / particle.maxLife;
        const currentAlpha = particle.alpha * Math.sin(lifeRatio * Math.PI);
        
        // Draw particle with glow effect
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + Math.floor(currentAlpha * 255).toString(16).padStart(2, '0');
        ctx.fill();
        
        // Reset shadow for connections
        ctx.shadowBlur = 0;
        
        // Connect nearby particles
        connectParticles(particle, particles, ctx, canvas.width, canvas.height);
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    // Connect particles that are close to each other
    const connectParticles = (particle: Particle, particles: Particle[], ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const proximity = Math.min(width, height) * 0.12;
      
      particles.forEach(otherParticle => {
        if (particle === otherParticle) return;
        
        const dx = particle.x - otherParticle.x;
        const dy = particle.y - otherParticle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < proximity) {
          const opacity = (1 - (distance / proximity)) * 0.15;
          
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(otherParticle.x, otherParticle.y);
          ctx.stroke();
        }
      });
    };
    
    // Start animation
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef}
      className="particles-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.5
      }}
    />
  );
}
