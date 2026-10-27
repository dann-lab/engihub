/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Personality & Campus Greeting Utilities
 * Authentic, human, supportive tone for Nigerian university engineering students.
 * Hard bans: No emoji decoration, no robot/sparkle icons, no hype buzzwords.
 */

import React from 'react';

/**
 * Returns a warm time-of-day greeting with the student's first name.
 * Example: "Good evening, Danni."
 */
export function getTimeGreeting(fullNameOrEmail?: string): string {
  const hour = new Date().getHours();
  let timeOfDay = 'morning';
  if (hour >= 12 && hour < 17) {
    timeOfDay = 'afternoon';
  } else if (hour >= 17 || hour < 5) {
    timeOfDay = 'evening';
  }

  let firstName = 'Student';
  if (fullNameOrEmail) {
    const clean = fullNameOrEmail.trim();
    if (clean.includes('@')) {
      const username = clean.split('@')[0];
      firstName = username.charAt(0).toUpperCase() + username.slice(1).replace(/[._\d].*$/, '');
    } else {
      firstName = clean.split(' ')[0];
    }
  }

  return `Good ${timeOfDay}, ${firstName}.`;
}

/**
 * Grounded encouraging lines that sound human and genuine.
 */
export const ENCOURAGING_LINES = [
  'Ready for workshop practice today?',
  'One derivation at a time.',
  'Calculations are clearer after a focused pause.',
  'Keep your momentum going.',
  'Steady work builds a dependable engineer.',
  'Reviewing past errors is where mastery happens.',
  'Take your time with the boundary conditions.'
];

export function getRandomEncouragingLine(seed?: number): string {
  const index = seed !== undefined ? Math.abs(seed) % ENCOURAGING_LINES.length : Math.floor(Math.random() * ENCOURAGING_LINES.length);
  return ENCOURAGING_LINES[index];
}

/**
 * Simple, clean vector Flame icon for study streak (No emojis).
 */
export const FlameIcon: React.FC<{ className?: string; size?: number }> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-hidden="true"
  >
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

/**
 * Quiet Confetti Burst: A small, gentle shower of muted gold and forest green specks.
 * Subtly celebrates completing a CBT or milestone without flashing or jarring effects.
 */
export const QuietConfetti: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const particles = React.useMemo(() => {
    return Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      x: 10 + Math.random() * 80, // % from left
      delay: Math.random() * 0.4, // seconds
      duration: 1.2 + Math.random() * 0.8,
      size: 4 + Math.random() * 4,
      color: i % 2 === 0 ? '#C67D0A' : '#1B4332',
      rotation: Math.random() * 360,
    }));
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-xs opacity-90 animate-quiet-confetti"
          style={{
            left: `${p.x}%`,
            top: '15%',
            width: `${p.size}px`,
            height: `${p.size * 1.4}px`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
};
