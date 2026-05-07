/**
 * ═══════════════════════════════════════════════════════════════
 * MATH UTILITIES
 * ═══════════════════════════════════════════════════════════════
 * 
 * Vector math, noise functions, interpolation, and random
 * utilities used throughout the animation system.
 */

/**
 * Linear interpolation between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Progress (0-1)
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Clamp a value between min and max
 */
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Map a value from one range to another
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
  return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
}

/**
 * Smooth step (Hermite interpolation)
 * Creates smooth S-curve transition between 0 and 1
 */
export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Smoother step (Ken Perlin's improved version)
 * Even smoother S-curve with zero 1st and 2nd derivatives at edges
 */
export function smootherstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Random float between min and max
 */
export function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Random integer between min and max (inclusive)
 */
export function randomInt(min, max) {
  return Math.floor(randomRange(min, max + 1));
}

/**
 * 2D Simplex-like noise (fast approximation)
 * Good enough for visual effects without importing a full noise library
 */
const NOISE_SEED = Math.random() * 65536;
export function noise2D(x, y) {
  // Hash-based pseudo-random noise
  const n = Math.sin(x * 12.9898 + y * 78.233 + NOISE_SEED) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1; // Returns -1 to 1
}

/**
 * Fractal Brownian Motion — layered noise for organic textures
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} octaves - Number of noise layers (4-6 typical)
 */
export function fbm(x, y, octaves = 4) {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise2D(x * frequency, y * frequency);
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value;
}

/**
 * Convert hex color to rgba components
 */
export function hexToRgba(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b, a: alpha, str: `rgba(${r},${g},${b},${alpha})` };
}

/**
 * Pulse function — oscillates between 0 and 1
 * @param {number} t - Time in seconds
 * @param {number} freq - Frequency in Hz
 */
export function pulse(t, freq = 1) {
  return (Math.sin(t * freq * Math.PI * 2) + 1) * 0.5;
}

/**
 * Distance between two 2D points
 */
export function dist(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Ease functions for canvas-based animations (not CSS)
 */
export const Ease = {
  // Quadratic
  quadIn:    t => t * t,
  quadOut:   t => t * (2 - t),
  quadInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

  // Cubic
  cubicIn:    t => t * t * t,
  cubicOut:   t => (--t) * t * t + 1,
  cubicInOut: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  // Exponential
  expoOut: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  expoIn:  t => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),

  // Sine
  sineInOut: t => -(Math.cos(Math.PI * t) - 1) / 2,

  // Back (overshoot)
  backOut: t => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },

  // Elastic
  elasticOut: t => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1;
  },
};
