/**
 * ═══════════════════════════════════════════════════════════════
 * FOG.JS — Volumetric Fog Layer
 * ═══════════════════════════════════════════════════════════════
 * 
 * Multi-layered fog simulation using overlapping gradient
 * circles that drift slowly. Creates atmospheric depth.
 * 
 * Rendering: Uses globalCompositeOperation for blending
 * with existing scene content.
 */

import { randomRange, noise2D } from '../utils/math.js';
import { CONFIG } from '../config.js';

export class FogEffect {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    // Create fog cloud particles (large, slow-moving radial gradients)
    this.clouds = [];
    for (let i = 0; i < 12; i++) {
      this.clouds.push({
        x: randomRange(0, width),
        y: randomRange(height * 0.4, height),  // Fog sits in bottom half
        radius: randomRange(200, 500),
        opacity: randomRange(0.02, 0.06),
        speedX: randomRange(-0.15, 0.15),
        speedY: randomRange(-0.05, 0.05),
        phase: randomRange(0, Math.PI * 2),
      });
    }

    this.intensity = 1;
  }

  update(dt, time) {
    for (const cloud of this.clouds) {
      // Slow organic drift using noise-influenced movement
      cloud.x += cloud.speedX * 60 * dt + Math.sin(time * 0.2 + cloud.phase) * 0.5;
      cloud.y += cloud.speedY * 60 * dt + Math.cos(time * 0.15 + cloud.phase) * 0.3;

      // Wrap around edges
      if (cloud.x < -cloud.radius) cloud.x = this.width + cloud.radius;
      if (cloud.x > this.width + cloud.radius) cloud.x = -cloud.radius;
      if (cloud.y < -cloud.radius) cloud.y = this.height + cloud.radius;
      if (cloud.y > this.height + cloud.radius) cloud.y = this.height * 0.5;
    }
  }

  /**
   * Render fog layers
   * Uses 'screen' blending for ethereal glow effect
   */
  render(ctx, globalAlpha = 1) {
    if (this.intensity < 0.01) return;

    ctx.save();

    for (const cloud of this.clouds) {
      const gradient = ctx.createRadialGradient(
        cloud.x, cloud.y, 0,
        cloud.x, cloud.y, cloud.radius
      );

      const alpha = cloud.opacity * this.intensity * globalAlpha;
      gradient.addColorStop(0, `rgba(120, 140, 180, ${alpha})`);
      gradient.addColorStop(0.5, `rgba(80, 100, 140, ${alpha * 0.5})`);
      gradient.addColorStop(1, `rgba(40, 50, 70, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(
        cloud.x - cloud.radius,
        cloud.y - cloud.radius,
        cloud.radius * 2,
        cloud.radius * 2
      );
    }

    // Bottom fog gradient — ground-level atmospheric haze
    const bottomFog = ctx.createLinearGradient(0, this.height * 0.7, 0, this.height);
    bottomFog.addColorStop(0, 'rgba(10, 15, 25, 0)');
    bottomFog.addColorStop(1, `rgba(10, 15, 25, ${0.4 * this.intensity * globalAlpha})`);
    ctx.fillStyle = bottomFog;
    ctx.fillRect(0, this.height * 0.7, this.width, this.height * 0.3);

    ctx.restore();
  }

  setIntensity(value) {
    this.intensity = value;
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
  }
}
