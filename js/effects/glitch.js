/**
 * GLITCH.JS — Digital Glitch & Distortion Effects
 * RGB splitting, slice displacement, scanlines, block corruption
 */

import { randomRange, randomInt, clamp } from '../utils/math.js';
import { CONFIG } from '../config.js';

export class GlitchEffect {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.intensity = 0;
    this.slices = [];
    this.lastUpdate = 0;
    this.updateInterval = 0.05;
    this.rgbOffset = { x: 0, y: 0 };
  }

  update(dt, time) {
    if (this.intensity < 0.01) return;
    this.lastUpdate += dt;
    if (this.lastUpdate < this.updateInterval) return;
    this.lastUpdate = 0;

    this.slices = [];
    const numSlices = Math.floor(this.intensity * 8) + 1;
    for (let i = 0; i < numSlices; i++) {
      if (Math.random() < this.intensity * 0.6) {
        this.slices.push({
          y: randomRange(0, this.height),
          height: randomRange(2, 40 * this.intensity),
          offset: randomRange(-30, 30) * this.intensity,
        });
      }
    }
    this.rgbOffset.x = (Math.random() - 0.5) * 10 * this.intensity;
    this.rgbOffset.y = (Math.random() - 0.5) * 4 * this.intensity;
  }

  render(ctx, globalAlpha = 1) {
    if (this.intensity < 0.01) return;
    ctx.save();

    // Horizontal slice displacement
    for (const slice of this.slices) {
      try {
        const sy = Math.max(0, Math.floor(slice.y));
        const sh = Math.max(1, Math.min(Math.floor(slice.height), this.height - sy));
        if (sh > 0 && sy + sh <= this.height) {
          const imgData = ctx.getImageData(0, sy, this.width, sh);
          ctx.putImageData(imgData, Math.floor(slice.offset), sy);
        }
      } catch (e) { /* tainted canvas */ }
    }

    // RGB split overlay
    if (Math.abs(this.rgbOffset.x) > 0.5) {
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.08 * this.intensity * globalAlpha;
      ctx.fillStyle = `rgba(255,0,0,${0.05*this.intensity})`;
      ctx.fillRect(this.rgbOffset.x * 2, 0, this.width, this.height);
      ctx.fillStyle = `rgba(0,255,255,${0.05*this.intensity})`;
      ctx.fillRect(-this.rgbOffset.x * 2, 0, this.width, this.height);
      ctx.globalCompositeOperation = 'source-over';
    }

    // Scanlines
    ctx.globalAlpha = 0.03 * this.intensity * globalAlpha;
    ctx.fillStyle = '#000';
    for (let y = 0; y < this.height; y += 4) {
      ctx.fillRect(0, y, this.width, 1);
    }

    // Random block corruption
    if (this.intensity > 0.5 && Math.random() < this.intensity * 0.3) {
      for (let i = 0; i < randomInt(1, 4); i++) {
        ctx.globalAlpha = randomRange(0.1, 0.3) * globalAlpha;
        ctx.fillStyle = Math.random() > 0.5 ? CONFIG.colors.neonCyan : CONFIG.colors.neonMagenta;
        ctx.fillRect(randomRange(0, this.width*0.8), randomRange(0, this.height), randomRange(20, 150), randomRange(5, 20));
      }
    }
    ctx.restore();
  }

  setIntensity(value) { this.intensity = clamp(value, 0, 1); }
  resize(width, height) { this.width = width; this.height = height; }
}
