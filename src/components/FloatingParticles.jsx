import { useEffect, useRef, useMemo } from 'react';

const PARTICLE_SETS = {
  hearts: ['💕', '💗', '💖', '💝', '♥', '🤍', '💜'],
  stars: ['⭐', '✨', '🌟', '💫', '⚡', '🌙'],
  flowers: ['🌸', '🌺', '🌷', '🌼', '🌻', '💐', '🌹'],
  mixed: ['💕', '⭐', '🌸', '✨', '💖', '🌟', '🌷', '💫', '🌺', '🤍'],
  rain: ['💧'],
  celebration: ['🎉', '🎊', '🏆', '⭐', '🌟', '🥳', '🎖️'],
  dreamy: ['☁️', '🌙', '⭐', '✨', '🦋', '🌈']
};

export default function FloatingParticles({ type = 'mixed', count = 18, speed = 'normal' }) {
  const containerRef = useRef(null);
  
  const particles = useMemo(() => {
    const set = PARTICLE_SETS[type] || PARTICLE_SETS.mixed;
    return Array.from({ length: count }, (_, i) => {
      const duration = speed === 'slow' ? 18 + Math.random() * 14 : 10 + Math.random() * 10;
      return {
        key: i,
        emoji: set[i % set.length],
        left: Math.random() * 100,
        delay: Math.random() * duration,
        duration,
        size: 0.8 + Math.random() * 1.2
      };
    });
  }, [type, count, speed]);

  return (
    <div className="particles-container" ref={containerRef}>
      {particles.map(p => (
        <span
          key={p.key}
          className="particle"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}rem`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

export function RainEffect({ intensity = 30 }) {
  const drops = useMemo(() => {
    return Array.from({ length: intensity }, (_, i) => ({
      key: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 1 + Math.random() * 2,
      height: 15 + Math.random() * 20
    }));
  }, [intensity]);

  return (
    <div className="rain-container">
      {drops.map(d => (
        <div
          key={d.key}
          className="raindrop"
          style={{
            left: `${d.left}%`,
            height: `${d.height}px`,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`
          }}
        />
      ))}
    </div>
  );
}
