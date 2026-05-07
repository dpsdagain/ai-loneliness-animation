/**
 * LIGHTNING.JS — Neon Glow & Lighting Effects
 * Ambient glow sources, neon light flickers, lens flares
 */

import { randomRange, pulse, lerp } from '../utils/math.js';
import { CONFIG } from '../config.js';

export class LightingEffect {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.lights = [];
    this.intensity = 1;
  }

  /** Add a neon light source */
  addLight(x, y, radius, color, flickerSpeed = 0) {
    this.lights.push({
      x, y, radius, color,
      flickerSpeed,
      flickerPhase: randomRange(0, Math.PI * 2),
      baseRadius: radius,
      currentAlpha: 0.5,
    });
  }

  /** Clear all lights for scene change */
  clearLights() { this.lights = []; }

  update(dt, time) {
    for (const light of this.lights) {
      if (light.flickerSpeed > 0) {
        // Neon flicker: sine wave + random noise
        const flicker = Math.sin(time * light.flickerSpeed + light.flickerPhase);
        const noise = Math.random() < 0.05 ? randomRange(0.3, 0.8) : 1;
        light.currentAlpha = (0.4 + flicker * 0.15) * noise;
        light.radius = light.baseRadius * (0.9 + flicker * 0.1);
      }
    }
  }

  render(ctx, globalAlpha = 1) {
    if (this.intensity < 0.01) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (const light of this.lights) {
      const alpha = light.currentAlpha * this.intensity * globalAlpha;
      const grad = ctx.createRadialGradient(
        light.x, light.y, 0,
        light.x, light.y, light.radius
      );
      grad.addColorStop(0, light.color.replace(')', `,${alpha * 0.6})`).replace('rgb(', 'rgba('));
      grad.addColorStop(0.3, light.color.replace(')', `,${alpha * 0.2})`).replace('rgb(', 'rgba('));
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = grad;
      ctx.fillRect(
        light.x - light.radius,
        light.y - light.radius,
        light.radius * 2,
        light.radius * 2
      );
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  setIntensity(value) { this.intensity = value; }
  resize(width, height) { this.width = width; this.height = height; }
}
