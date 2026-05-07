/**
 * ═══════════════════════════════════════════════════════════════
 * EASING.JS — GSAP-Compatible Custom Easing
 * ═══════════════════════════════════════════════════════════════
 * 
 * Custom easing functions designed for cinematic motion.
 * These complement GSAP's built-in easings with film-specific curves.
 */

/**
 * Dramatic reveal — very slow start, explosive finish
 * Used for: Title reveals, scene entrances
 */
export function dramaticReveal(t) {
  return t < 0.5
    ? 16 * t * t * t * t * t
    : 1 - Math.pow(-2 * t + 2, 5) / 2;
}

/**
 * Breath — organic sine-based oscillation
 * Used for: Pulsing glows, ambient light breathing
 * @param {number} t - Time value (can exceed 1 for continuous breathing)
 * @param {number} speed - Breathing speed multiplier
 */
export function breathe(t, speed = 1) {
  return (Math.sin(t * speed * Math.PI * 2 - Math.PI / 2) + 1) / 2;
}

/**
 * Glitch step — randomly jumps between values
 * Used for: Glitch effects, digital interference
 * @param {number} t - Progress 0-1
 * @param {number} steps - Number of glitch steps
 */
export function glitchStep(t, steps = 8) {
  const stepT = Math.floor(t * steps) / steps;
  const noise = Math.sin(stepT * 12345.6789) * 0.5 + 0.5;
  return noise * t + (1 - noise) * stepT;
}

/**
 * Cinematic hold — eases in, holds, eases out
 * Used for: Text that needs to be read, important reveals
 * @param {number} t - Progress 0-1
 * @param {number} holdStart - When hold begins (0-1)
 * @param {number} holdEnd - When hold ends (0-1)
 */
export function cinematicHold(t, holdStart = 0.2, holdEnd = 0.8) {
  if (t < holdStart) {
    // Ease in phase
    const localT = t / holdStart;
    return localT * localT * (3 - 2 * localT); // smoothstep
  } else if (t < holdEnd) {
    // Hold phase — fully visible
    return 1;
  } else {
    // Ease out phase
    const localT = (t - holdEnd) / (1 - holdEnd);
    return 1 - localT * localT * (3 - 2 * localT); // inverse smoothstep
  }
}

/**
 * Typewriter — steps through characters with slight random variation
 * Used for: Character-by-character text reveal
 * @param {number} t - Progress 0-1
 * @param {number} charCount - Number of characters
 */
export function typewriter(t, charCount) {
  return Math.floor(t * charCount) / charCount;
}

/**
 * Stagger delay calculator
 * Returns an array of delay values for staggered animations
 * @param {number} count - Number of elements
 * @param {number} totalDuration - Total stagger duration
 * @param {string} direction - 'start' | 'center' | 'end' | 'random'
 */
export function staggerDelays(count, totalDuration, direction = 'start') {
  const delays = [];
  const step = totalDuration / (count - 1 || 1);

  for (let i = 0; i < count; i++) {
    switch (direction) {
      case 'start':
        delays.push(i * step);
        break;
      case 'end':
        delays.push((count - 1 - i) * step);
        break;
      case 'center': {
        const center = (count - 1) / 2;
        delays.push(Math.abs(i - center) * step);
        break;
      }
      case 'random':
        delays.push(Math.random() * totalDuration);
        break;
    }
  }
  return delays;
}
