import { useEffect, useState } from 'react';

const CONFETTI_COLORS = [
  '#f94144', // red
  '#f3722c', // orange
  '#f8961e', // yellow-orange
  '#f9c74f', // yellow
  '#90be6d', // green
  '#43aa8b', // teal
  '#577590', // blue-gray
  '#277da1', // blue
  '#9b5de5', // purple
  '#f72585', // pink
];

const PARTICLE_COUNT = 80;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function createParticle(index) {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const left = randomBetween(0, 100);
  const delay = randomBetween(0, 0.8);
  const duration = randomBetween(2, 3.5);
  const size = randomBetween(6, 12);
  const rotation = randomBetween(0, 360);
  const rotationSpeed = randomBetween(-180, 180);
  const drift = randomBetween(-30, 30);
  const shape = Math.random() > 0.5 ? 'square' : 'rect';

  return {
    id: index,
    color,
    left,
    delay,
    duration,
    size,
    rotation,
    rotationSpeed,
    drift,
    shape,
  };
}

export default function ConfettiCelebration({ show = false }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (show) {
      setParticles(Array.from({ length: PARTICLE_COUNT }, (_, i) => createParticle(i)));
    } else {
      setParticles([]);
    }
  }, [show]);

  if (!show || particles.length === 0) {
    return null;
  }

  return (
    <div
      data-testid="confetti-celebration"
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${particle.left}%`,
            top: '-20px',
            width: particle.shape === 'rect' ? `${particle.size * 0.6}px` : `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            borderRadius: particle.shape === 'rect' ? '1px' : '2px',
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            transform: `rotate(${particle.rotation}deg)`,
            '--confetti-drift': `${particle.drift}px`,
            '--confetti-rotation': `${particle.rotationSpeed}deg`,
          }}
        />
      ))}
    </div>
  );
}
