"use client";

import { useEffect, useRef } from "react";

export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];
    const mouse = { x: null, y: null, radius: 150 };

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off edges
        if (this.x > canvas.width || this.x < 0) {
          this.speedX = -this.speedX;
        }
        if (this.y > canvas.height || this.y < 0) {
          this.speedY = -this.speedY;
        }

        // Mouse repel effect
        if (mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * force * 3;
            this.y += Math.sin(angle) * force * 3;
          }
        }
      }

      draw() {
        ctx.fillStyle = `rgba(249, 115, 22, ${this.opacity})`; // Orange
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize particles
    const particleCount = window.innerWidth < 768 ? 50 : 100;
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Connect particles
    function connectParticles() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            const opacity = (1 - distance / 120) * 0.3;
            ctx.strokeStyle = `rgba(249, 115, 22, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    // Animation loop
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    // Mouse/Touch move handler - attach to document
    const handleMove = (e) => {
      if (e.touches) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      } else {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      }
    };

    const handleLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    // Click/Touch burst effect
    const handleClick = (e) => {
      // Only create burst if clicking on non-interactive elements
      const target = e.target;
      const isInteractive = 
        target.tagName === 'BUTTON' || 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('.z-10'); // EXCLUDE CONTENT LAYER
      
      if (isInteractive) return;

      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;

      // Create burst particles
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const particle = new Particle();
        particle.x = x;
        particle.y = y;
        particle.speedX = Math.cos(angle) * 2;
        particle.speedY = Math.sin(angle) * 2;
        particle.opacity = 0.8;
        particles.push(particle);

        // Remove after animation
        setTimeout(() => {
          const index = particles.indexOf(particle);
          if (index > -1) particles.splice(index, 1);
        }, 1000);
      }
    };

    // Attach events to document
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("touchmove", handleMove, { passive: true });
    document.addEventListener("mouseleave", handleLeave);
    document.addEventListener("click", handleClick);
    document.addEventListener("touchstart", handleClick, { passive: true });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("touchstart", handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: "transparent" }}
    />
  );
}

