/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Crazy Engineering Particle & Circuit Grid
 * Lightweight 60fps canvas animation rendering electric circuit traces,
 * floating engineering equations, and responsive interactive spark pulses.
 */

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  symbol: string;
  pulsePhase: number;
}

const FORMULA_SYMBOLS = [
  'E=mc²',
  '∇×B',
  'PV=nRT',
  'σ=Eε',
  'τ=Tr/J',
  'η=1-Qc/Qh',
  'V=IR',
  'F=ma',
  'P=ρgQH',
  'I=dq/dt'
];

export const CrazyEngineeringParticles: React.FC<{ theme?: 'light' | 'dark' }> = ({ theme = 'dark' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const isDark = theme === 'dark';
    const primaryColor = isDark ? 'rgba(82, 183, 136, ' : 'rgba(27, 67, 50, ';
    const goldColor = isDark ? 'rgba(224, 168, 68, ' : 'rgba(198, 125, 10, ';

    const particles: Particle[] = [];
    const count = Math.min(32, Math.floor((width * height) / 35000));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1.5,
        color: Math.random() > 0.4 ? primaryColor : goldColor,
        symbol: FORMULA_SYMBOLS[i % FORMULA_SYMBOLS.length],
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let sparkTimer = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      sparkTimer += 0.02;

      // Update and draw connections
      ctx.lineWidth = 0.75;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        // Mouse gentle repel
        const dx = p1.x - mouseX;
        const dy = p1.y - mouseY;
        const distMouse = Math.sqrt(dx * dx + dy * dy);
        if (distMouse < 120 && distMouse > 0) {
          p1.x += (dx / distMouse) * 1.2;
          p1.y += (dy / distMouse) * 1.2;
        }

        // Draw connections between nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.22;
            ctx.strokeStyle = `${p1.color}${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            // Periodic electric spark travelling along circuit lines
            const sparkPos = (Math.sin(sparkTimer + i * 0.7) + 1) / 2;
            if (sparkPos > 0.85) {
              const sx = p1.x + (p2.x - p1.x) * (sparkPos - 0.85) / 0.15;
              const sy = p1.y + (p2.y - p1.y) * (sparkPos - 0.85) / 0.15;
              ctx.fillStyle = goldColor + '0.7)';
              ctx.beginPath();
              ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // Draw particle nodes and floating symbols
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.pulsePhase += 0.03;
        const pulse = 1 + Math.sin(p.pulsePhase) * 0.35;

        // Node dot
        ctx.fillStyle = `${p.color}0.75)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Node glow aura
        ctx.fillStyle = `${p.color}0.15)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3.5 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Floating engineering symbol
        if (i % 2 === 0) {
          ctx.font = '10px monospace';
          ctx.fillStyle = isDark ? 'rgba(246, 243, 238, 0.25)' : 'rgba(20, 46, 34, 0.28)';
          ctx.fillText(p.symbol, p.x + 8, p.y - 8);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-60"
      aria-hidden="true"
    />
  );
};
