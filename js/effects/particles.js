/**
 * ═══════════════════════════════════════════════════════════════
 * PARTICLES.JS — Ambient Particle System
 * ═══════════════════════════════════════════════════════════════
 * 
 * Object-pooled particle system for floating dust, data streams,
 * and ambient atmosphere. Supports multiple particle "profiles"
 * with different behaviors.
 * 
 * Performance: Uses pre-allocated arrays, avoids GC pressure.
 */

import { randomRange, lerp, pulse } from '../utils/math.js';
import { CONFIG } from '../config.js';

export class ParticleSystem {
  /**
   * @param {string} type - Particle profile key from CONFIG.particles
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  constructor(type, width, height) {
    const profile = CONFIG.particles[type] || CONFIG.particles.ambient;
    this.width = width;
    this.height = height;
    this.type = type;

    // Pre-allocate particle pool (avoids runtime allocation)
    this.pool = [];
    for (let i = 0; i < profile.count; i++) {
      this.pool.push(this._createParticle(profile, true));
    }
  }

  /**
   * Create a single particle with randomized properties
   * @param {object} profile - Particle profile from config
   * @param {boolean} randomY - If true, spawn at random Y; if false, spawn at top
   */
  _createParticle(profile, randomY = false) {
    return {
      x: randomRange(0, this.width),
      y: randomY ? randomRange(0, this.height) : -10,
      vx: randomRange(-0.5, 0.5) * profile.speed,
      vy: randomRange(0.2, 1) * profile.speed,
      size: randomRange(profile.size[0], profile.size[1]),
      opacity: randomRange(profile.opacity[0], profile.opacity[1]),
      life: randomRange(0, 1),          // Current life phase
      maxLife: randomRange(3, 8),        // Total lifetime in seconds
      phase: randomRange(0, Math.PI * 2), // For sine-wave drift
      active: true,
    };
  }

  /**
   * Update all particles by delta time
   * @param {number} dt - Delta time in seconds
   * @param {number} time - Total elapsed time
   */
  update(dt, time) {
    const profile = CONFIG.particles[this.type] || CONFIG.particles.ambient;

    for (let i = 0; i < this.pool.length; i++) {
      const p = this.pool[i];
      if (!p.active) continue;

      // Sine-wave horizontal drift for organic movement
      p.x += p.vx + Math.sin(time + p.phase) * 0.3;
      p.y += p.vy;

      // Age the particle
      p.life += dt / p.maxLife;

      // Recycle particle when it exits or expires
      if (p.y > this.height + 10 || p.x < -10 || p.x > this.width + 10 || p.life >= 1) {
        // Reset to top with new random properties
        Object.assign(p, this._createParticle(profile, false));
        p.y = -10;
        p.life = 0;
      }
    }
  }

  /**
   * Render all particles to canvas context
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} color - Base color (hex)
   * @param {number} globalAlpha - Master opacity multiplier (0-1)
   */
  render(ctx, color = CONFIG.colors.neonCyan, globalAlpha = 1) {
    ctx.save();
    
    for (let i = 0; i < this.pool.length; i++) {
      const p = this.pool[i];
      if (!p.active) continue;

      // Fade in/out based on life phase for smooth appearance/disappearance
      let alpha = p.opacity * globalAlpha;
      if (p.life < 0.1) alpha *= p.life / 0.1;          // Fade in
      if (p.life > 0.9) alpha *= (1 - p.life) / 0.1;    // Fade out

      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      
      // Draw particle as small circle with glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Optional glow layer for larger particles
      if (p.size > 2) {
        ctx.globalAlpha = alpha * 0.3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  /**
   * Resize handler — update bounds
   */
  resize(width, height) {
    this.width = width;
    this.height = height;
  }
}
