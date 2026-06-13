import { useState } from 'react';
import FloatingParticles from './FloatingParticles';

const doodles = [
  { emoji: '⭐', top: '10%', left: '8%', delay: 0 },
  { emoji: '💕', top: '15%', right: '12%', delay: 1 },
  { emoji: '🌸', top: '70%', left: '5%', delay: 2 },
  { emoji: '✏️', top: '80%', right: '8%', delay: 0.5 },
  { emoji: '📎', top: '25%', left: '15%', delay: 1.5 },
  { emoji: '🌙', top: '60%', right: '15%', delay: 3 },
  { emoji: '☁️', top: '40%', left: '3%', delay: 2.5 },
  { emoji: '🦋', top: '50%', right: '5%', delay: 1.8 },
  { emoji: '🌷', bottom: '15%', left: '12%', delay: 0.8 },
  { emoji: '💫', top: '35%', right: '20%', delay: 2.2 },
];

export default function LandingPage({ onOpen }) {
  const [unlocking, setUnlocking] = useState(false);

  const handleOpen = () => {
    setUnlocking(true);
    setTimeout(() => onOpen(), 800);
  };

  return (
    <div className="landing">
      <FloatingParticles type="mixed" count={20} speed="slow" />

      {/* Background doodles */}
      <div className="landing__doodles">
        {doodles.map((d, i) => (
          <span
            key={i}
            className="landing__doodle"
            style={{
              top: d.top,
              bottom: d.bottom,
              left: d.left,
              right: d.right,
              animationDelay: `${d.delay}s`,
              fontSize: `${1.2 + Math.random() * 1.2}rem`
            }}
          >
            {d.emoji}
          </span>
        ))}
      </div>

      {/* Diary Cover */}
      <div className="landing__diary-cover" style={unlocking ? { animation: 'pageTurn 0.8s ease-in forwards' } : {}}>
        <div className="landing__spine" />

        <div
          className="landing__lock"
          onClick={handleOpen}
          style={unlocking ? { animation: 'unlockOpen 0.5s ease-in forwards' } : {}}
        >
          {unlocking ? '🔓' : '🔒'}
        </div>

        <h1 className="landing__title">Dear Me</h1>
        <p className="landing__subtitle">my little world of memories ✨</p>
        <div className="landing__deco-line" />

        <button className="landing__open-btn" onClick={handleOpen}>
          ✨ Open My Memories
        </button>
      </div>

      {/* Decorative corner elements */}
      <svg className="landing__corner-deco landing__corner-deco--tl" viewBox="0 0 100 100">
        <path d="M10,50 Q10,10 50,10" stroke="currentColor" fill="none" strokeWidth="2" opacity="0.3" />
        <circle cx="20" cy="20" r="3" fill="currentColor" opacity="0.2" />
        <circle cx="40" cy="15" r="2" fill="currentColor" opacity="0.15" />
      </svg>
      <svg className="landing__corner-deco landing__corner-deco--br" viewBox="0 0 100 100">
        <path d="M10,50 Q10,10 50,10" stroke="currentColor" fill="none" strokeWidth="2" opacity="0.3" />
        <circle cx="20" cy="20" r="3" fill="currentColor" opacity="0.2" />
      </svg>
    </div>
  );
}
