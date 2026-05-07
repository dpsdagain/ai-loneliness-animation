/**
 * SCENE 05 — EMPTY CITY
 * AI wanders through rain-soaked neon streets at night
 * Visuals: Cyberpunk cityscape, rain, reflections, neon signs, fog
 */

import { CONFIG } from '../config.js';
import { ParticleSystem } from '../effects/particles.js';
import { RainEffect } from '../effects/rain.js';
import { FogEffect } from '../effects/fog.js';
import { LightingEffect } from '../effects/lightning.js';
import { TextAnimator } from '../typography/textAnimator.js';
import { smoothstep, pulse, randomRange, lerp } from '../utils/math.js';

export class Scene05_EmptyCity {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    this.particles = new ParticleSystem('ambient', width, height);
    this.rain = new RainEffect(width, height);
    this.fog = new FogEffect(width, height);
    this.lighting = new LightingEffect(width, height);
    this.textAnim = new TextAnimator(width, height);

    // Buildings — simple geometric city silhouette
    this.buildings = [];
    this._initCity();

    // Parallax camera
    this.cameraX = 0;

    // Neon signs
    this.neonSigns = [
      { x: width * 0.15, y: height * 0.28, text: 'NEXUS', color: CONFIG.colors.neonMagenta, flicker: 3 },
      { x: width * 0.55, y: height * 0.22, text: 'データ', color: CONFIG.colors.neonCyan, flicker: 5 },
      { x: width * 0.85, y: height * 0.35, text: 'VOID', color: CONFIG.colors.electricPurple, flicker: 2 },
    ];

    // Neon light sources
    this.lighting.addLight(width * 0.15, height * 0.4, 200, 'rgb(255,0,170)', 3);
    this.lighting.addLight(width * 0.5, height * 0.35, 250, 'rgb(0,240,255)', 5);
    this.lighting.addLight(width * 0.85, height * 0.45, 180, 'rgb(123,47,255)', 2);

    // Narration
    const narr = CONFIG.narration[4];
    for (const line of narr.lines) {
      this.textAnim.addText(line.text, width / 2, height * 0.88, {
        startTime: line.time, duration: line.duration,
        style: 'fadeUp', glow: true, font: CONFIG.fonts.narration,
      });
    }
  }

  _initCity() {
    const count = 25;
    for (let i = 0; i < count; i++) {
      const x = (i / count) * this.width * 1.2 - this.width * 0.1;
      const bw = randomRange(40, 120);
      const bh = randomRange(200, 550);
      const windows = [];

      // Window grid
      const cols = Math.floor(bw / 15);
      const rows = Math.floor(bh / 20);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() > 0.4) {
            windows.push({
              x: c * 15 + 5,
              y: r * 20 + 10,
              w: 8, h: 12,
              lit: Math.random() > 0.6,
              color: Math.random() > 0.5 ? 'rgba(255,200,80,0.3)' : 'rgba(100,200,255,0.2)',
            });
          }
        }
      }

      this.buildings.push({ x, width: bw, height: bh, windows, depth: randomRange(0.5, 1) });
    }
    // Sort by depth for parallax
    this.buildings.sort((a, b) => a.depth - b.depth);
  }

  update(dt, sceneTime) {
    // Slow camera pan
    this.cameraX = Math.sin(sceneTime * 0.08) * 50;

    this.rain.setIntensity(smoothstep(1, 4, sceneTime));
    this.fog.setIntensity(smoothstep(2, 5, sceneTime) * 0.8);

    this.rain.update(dt);
    this.fog.update(dt, sceneTime);
    this.lighting.update(dt, sceneTime);
    this.particles.update(dt, sceneTime);
    this.textAnim.update(dt, sceneTime);
  }

  render(ctx) {
    const w = this.width, h = this.height;

    // Night sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    skyGrad.addColorStop(0, '#030508');
    skyGrad.addColorStop(0.5, '#0a0f18');
    skyGrad.addColorStop(1, '#0d1520');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Ground
    ctx.fillStyle = '#08080c';
    ctx.fillRect(0, h * 0.72, w, h * 0.28);

    // Wet ground reflection
    const reflGrad = ctx.createLinearGradient(0, h * 0.72, 0, h);
    reflGrad.addColorStop(0, 'rgba(0,240,255,0.03)');
    reflGrad.addColorStop(0.5, 'rgba(255,0,170,0.02)');
    reflGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = reflGrad;
    ctx.fillRect(0, h * 0.72, w, h * 0.28);

    // Buildings with parallax
    for (const b of this.buildings) {
      const px = b.x + this.cameraX * b.depth;
      const by = h * 0.72 - b.height;

      // Building body
      ctx.fillStyle = `rgba(8,10,18,${0.7 + b.depth * 0.3})`;
      ctx.fillRect(px, by, b.width, b.height);

      // Building edge highlight
      ctx.strokeStyle = `rgba(30,40,60,${0.3 * b.depth})`;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(px, by, b.width, b.height);

      // Windows
      for (const win of b.windows) {
        if (win.lit) {
          ctx.globalAlpha = 0.6 * b.depth;
          ctx.fillStyle = win.color;
          ctx.fillRect(px + win.x, by + win.y, win.w, win.h);
        }
      }
    }
    ctx.globalAlpha = 1;

    // Neon signs
    for (const sign of this.neonSigns) {
      const flicker = Math.sin(Date.now() * 0.001 * sign.flicker) > -0.1 ? 1 : 0.2;
      ctx.globalAlpha = 0.8 * flicker;
      ctx.fillStyle = sign.color;
      ctx.font = `bold 28px "${CONFIG.fonts.title.family}"`;
      ctx.textAlign = 'center';
      ctx.shadowColor = sign.color;
      ctx.shadowBlur = 20 * flicker;
      ctx.fillText(sign.text, sign.x + this.cameraX * 0.8, sign.y);
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'start';

    // Effects layers
    this.lighting.render(ctx, 0.7);
    this.fog.render(ctx, 0.6);
    this.rain.render(ctx, 0.8);
    this.particles.render(ctx, CONFIG.colors.neonCyan, 0.2);
    this.textAnim.render(ctx, 1);
  }

  cleanup() { this.textAnim.cleanup(); }
  resize(w, h) {
    this.width = w; this.height = h;
    this.rain.resize(w, h); this.fog.resize(w, h);
    this.lighting.resize(w, h); this.particles.resize(w, h);
    this.textAnim.resize(w, h);
  }
}
