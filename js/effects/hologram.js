/**
 * HOLOGRAM.JS — Holographic UI Elements
 * Floating transparent panels, data readouts, and HUD elements
 */

import { randomRange, pulse, lerp } from '../utils/math.js';
import { CONFIG } from '../config.js';

export class HologramEffect {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.panels = [];
    this.intensity = 0;
  }

  /** Create a floating holographic panel */
  addPanel(x, y, w, h, content = '') {
    this.panels.push({
      x, y, w, h, content,
      opacity: 0,
      targetOpacity: 0.6,
      scanLine: 0,
      flickerPhase: randomRange(0, Math.PI * 2),
      driftX: randomRange(-0.3, 0.3),
      driftY: randomRange(-0.2, 0.2),
    });
  }

  update(dt, time) {
    for (const p of this.panels) {
      p.opacity = lerp(p.opacity, p.targetOpacity * this.intensity, dt * 3);
      p.scanLine = (p.scanLine + dt * 80) % p.h;
      p.x += p.driftX * dt * 20;
      p.y += p.driftY * dt * 20 + Math.sin(time * 0.5 + p.flickerPhase) * 0.2;
    }
  }

  render(ctx, globalAlpha = 1) {
    if (this.intensity < 0.01) return;
    ctx.save();

    for (const p of this.panels) {
      const alpha = p.opacity * globalAlpha;
      if (alpha < 0.01) continue;

      // Panel background
      ctx.globalAlpha = alpha * 0.15;
      ctx.fillStyle = CONFIG.colors.neonCyan;
      ctx.fillRect(p.x, p.y, p.w, p.h);

      // Panel border
      ctx.globalAlpha = alpha * 0.6;
      ctx.strokeStyle = CONFIG.colors.neonCyan;
      ctx.lineWidth = 1;
      ctx.strokeRect(p.x, p.y, p.w, p.h);

      // Corner accents
      const cornerSize = 8;
      ctx.lineWidth = 2;
      ctx.globalAlpha = alpha * 0.8;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + cornerSize); ctx.lineTo(p.x, p.y); ctx.lineTo(p.x + cornerSize, p.y);
      ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(p.x + p.w - cornerSize, p.y); ctx.lineTo(p.x + p.w, p.y); ctx.lineTo(p.x + p.w, p.y + cornerSize);
      ctx.stroke();
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + p.h - cornerSize); ctx.lineTo(p.x, p.y + p.h); ctx.lineTo(p.x + cornerSize, p.y + p.h);
      ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(p.x + p.w - cornerSize, p.y + p.h); ctx.lineTo(p.x + p.w, p.y + p.h); ctx.lineTo(p.x + p.w, p.y + p.h - cornerSize);
      ctx.stroke();

      // Scan line
      ctx.globalAlpha = alpha * 0.2;
      const grad = ctx.createLinearGradient(p.x, p.y + p.scanLine - 10, p.x, p.y + p.scanLine + 10);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.5, CONFIG.colors.neonCyan);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(p.x, p.y + p.scanLine - 10, p.w, 20);

      // Content text
      if (p.content) {
        ctx.globalAlpha = alpha * 0.7;
        ctx.fillStyle = CONFIG.colors.neonCyan;
        ctx.font = `${CONFIG.fonts.code.size}px "${CONFIG.fonts.code.family}"`;
        ctx.fillText(p.content, p.x + 10, p.y + 25);
      }
    }
    ctx.restore();
  }

  clearPanels() { this.panels = []; }
  setIntensity(value) { this.intensity = value; }
  resize(width, height) { this.width = width; this.height = height; }
}
