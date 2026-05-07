/**
 * ═══════════════════════════════════════════════════════════════
 * RAIN.JS — Cinematic Rain Effect
 * ═══════════════════════════════════════════════════════════════
 * 
 * Rain streaks with ground splash effects and reflective puddle
 * simulation. Inspired by Blade Runner 2049 rain aesthetics.
 * 
 * Architecture:
 * - Pre-allocated raindrop pool (400 drops)
 * - Splash particles spawned on ground impact
 * - Slight wind drift for realism
 * - Adjustable intensity for scene transitions
 */

import { randomRange, clamp } from '../utils/math.js';
import { CONFIG } from '../config.js';

export class RainEffect {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.intensity = 1;  // 0-1, controlled externally for fade in/out

    // Rain drop pool
    this.drops = [];
    for (let i = 0; i < CONFIG.particles.rain.count; i++) {
      this.drops.push(this._createDrop(true));
    }

    // Splash pool (recycled)
    this.splashes = [];
    this.maxSplashes = 50;

    // Wind — slight horizontal drift
    this.wind = 1.5;
  }

  _createDrop(randomY = false) {
    return {
      x: randomRange(-50, this.width + 50),
      y: randomY ? randomRange(-this.height, this.height) : randomRange(-100, -10),
      speed: randomRange(6, 12) * CONFIG.particles.rain.speed / 8,
      length: randomRange(15, 35),  // Streak length in pixels
      opacity: randomRange(0.15, 0.45),
      thickness: randomRange(0.5, 1.5),
    };
  }

  _createSplash(x, y) {
    return {
      x, y,
      radius: 0,
      maxRadius: randomRange(3, 8),
      opacity: 0.5,
      life: 0,
      speed: randomRange(0.02, 0.05),
    };
  }

  /**
   * Update rain drops and splashes
   * @param {number} dt - Delta time in seconds
   */
  update(dt) {
    // Update drops
    for (let i = 0; i < this.drops.length; i++) {
      const d = this.drops[i];
      d.y += d.speed * this.intensity * 60 * dt;
      d.x += this.wind * dt * 60;

      // Ground hit — spawn splash and recycle
      if (d.y > this.height) {
        // Spawn splash if pool has room
        if (this.splashes.length < this.maxSplashes && this.intensity > 0.3) {
          this.splashes.push(this._createSplash(d.x, this.height - randomRange(0, 5)));
        }
        Object.assign(d, this._createDrop(false));
      }
    }

    // Update splashes
    for (let i = this.splashes.length - 1; i >= 0; i--) {
      const s = this.splashes[i];
      s.life += s.speed * 60 * dt;
      s.radius = s.maxRadius * s.life;
      s.opacity = 0.5 * (1 - s.life);

      if (s.life >= 1) {
        this.splashes.splice(i, 1);
      }
    }
  }

  /**
   * Render rain streaks and splashes
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} globalAlpha - Scene-level opacity
   */
  render(ctx, globalAlpha = 1) {
    if (this.intensity < 0.01) return;

    ctx.save();

    // ─── Rain Streaks ───────────────────────────────
    ctx.strokeStyle = CONFIG.colors.rainDrop;
    ctx.lineCap = 'round';

    for (let i = 0; i < this.drops.length; i++) {
      const d = this.drops[i];
      ctx.globalAlpha = d.opacity * this.intensity * globalAlpha;
      ctx.lineWidth = d.thickness;

      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      // Streak direction follows wind angle
      ctx.lineTo(
        d.x - this.wind * d.length * 0.1,
        d.y - d.length
      );
      ctx.stroke();
    }

    // ─── Ground Splashes ────────────────────────────
    ctx.strokeStyle = 'rgba(150, 200, 255, 0.3)';
    ctx.lineWidth = 0.5;

    for (let i = 0; i < this.splashes.length; i++) {
      const s = this.splashes[i];
      ctx.globalAlpha = s.opacity * globalAlpha;
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, s.radius, s.radius * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Set rain intensity (0-1)
   * Used for scene transitions — fade rain in/out smoothly
   */
  setIntensity(value) {
    this.intensity = clamp(value, 0, 1);
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
  }
}
