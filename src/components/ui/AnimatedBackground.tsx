import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
  life: number;
  maxLife: number;
}

const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(undefined);

  const createParticle = (): Particle => {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.6 + 0.2,
      hue: Math.random() * 60 + 200, // Blue to purple range
      life: 0,
      maxLife: Math.random() * 300 + 200,
    };
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas with a slight trail effect
    ctx.fillStyle = "rgba(13, 17, 23, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particlesRef.current = particlesRef.current.filter((particle) => {
      // Update particle
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life++;

      // Bounce off edges
      if (particle.x <= 0 || particle.x >= canvas.width) particle.vx *= -1;
      if (particle.y <= 0 || particle.y >= canvas.height) particle.vy *= -1;

      // Calculate opacity based on life
      const lifeRatio = particle.life / particle.maxLife;
      const currentOpacity = particle.opacity * (1 - lifeRatio);

      // Draw particle with glow effect
      ctx.save();
      ctx.globalAlpha = currentOpacity;

      // Create gradient for glow
      const gradient = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.size * 3,
      );
      gradient.addColorStop(0, `hsla(${particle.hue}, 70%, 60%, 1)`);
      gradient.addColorStop(1, `hsla(${particle.hue}, 70%, 60%, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
      ctx.fill();

      // Draw core particle
      ctx.fillStyle = `hsla(${particle.hue}, 80%, 70%, 1)`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      return particle.life < particle.maxLife;
    });

    // Add new particles
    while (particlesRef.current.length < 50) {
      particlesRef.current.push(createParticle());
    }

    // Draw connecting lines between nearby particles
    ctx.save();
    particlesRef.current.forEach((particle, i) => {
      particlesRef.current.slice(i + 1).forEach((otherParticle) => {
        const dx = particle.x - otherParticle.x;
        const dy = particle.y - otherParticle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          const opacity = (1 - distance / 100) * 0.3;
          ctx.globalAlpha = opacity;
          ctx.strokeStyle = `hsla(220, 50%, 60%, 1)`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(otherParticle.x, otherParticle.y);
          ctx.stroke();
        }
      });
    });
    ctx.restore();

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    // Initialize particles
    for (let i = 0; i < 50; i++) {
      particlesRef.current.push(createParticle());
    }

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        background:
          "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%)",
      }}
    />
  );
};

export default AnimatedBackground;
