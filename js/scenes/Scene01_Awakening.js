/**
 * SCENE 01 — AWAKENING
 * AI boots up inside a massive datacenter
 * Visuals: Server rack lights, neural pathways forming, digital birth
 */

import { CONFIG } from '../config.js';
import { ParticleSystem } from '../effects/particles.js';
import { NeuralEffect } from '../effects/neural.js';
import { LightingEffect } from '../effects/lightning.js';
import { TextAnimator } from '../typography/textAnimator.js';
import { lerp, pulse, smoothstep } from '../utils/math.js';

export class Scene01_Awakening {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    // Effects
    this.particles = new ParticleSystem('data', width, height);
    this.neural = new NeuralEffect(width, height);
    this.lighting = new LightingEffect(width, height);
    this.textAnim = new TextAnimator(width, height);

    // Server rack visualization
    this.racks = [];
    this._initRacks();

    // Boot sequence state
    this.bootProgress = 0;
    this.eyeOpenProgress = 0;

    // Narration setup
    const narr = CONFIG.narration[0];
    for (const line of narr.lines) {
      this.textAnim.addText(line.text, width / 2, height * 0.82, {
        startTime: line.time, duration: line.duration,
        style: 'fadeUp', glow: true, glowColor: CONFIG.colors.neonCyan,
        font: CONFIG.fonts.narration,
      });
    }

    // Neon light sources in datacenter
    this.lighting.addLight(width * 0.2, height * 0.3, 300, 'rgb(0,240,255)', 2);
    this.lighting.addLight(width * 0.8, height * 0.5, 250, 'rgb(123,47,255)', 3);
    this.lighting.addLight(width * 0.5, height * 0.2, 400, 'rgb(0,100,255)', 1.5);
  }

  _initRacks() {
    // Generate server rack columns
    const rackCount = 12;
    for (let i = 0; i < rackCount; i++) {
      const x = (i / rackCount) * this.width;
      const lights = [];
      for (let j = 0; j < 20; j++) {
        lights.push({
          y: 100 + j * 40,
          on: false,
          targetOn: false,
          brightness: 0,
          color: Math.random() > 0.3 ? CONFIG.colors.neonCyan : CONFIG.colors.electricPurple,
          blinkPhase: Math.random() * Math.PI * 2,
        });
      }
      this.racks.push({ x, width: this.width / rackCount - 4, lights });
    }
  }

  update(dt, sceneTime, sceneProgress) {
    // Boot sequence: lights turn on progressively over first 15 seconds
    this.bootProgress = smoothstep(0, 15, sceneTime);

    // Turn on rack lights progressively
    for (const rack of this.racks) {
      for (let i = 0; i < rack.lights.length; i++) {
        const threshold = (i / rack.lights.length) * 0.6 + (rack.x / this.width) * 0.3;
        rack.lights[i].targetOn = this.bootProgress > threshold;
        rack.lights[i].brightness = lerp(
          rack.lights[i].brightness,
          rack.lights[i].targetOn ? 1 : 0,
          dt * 3
        );
      }
    }

    // "Eye opening" — central glow expanding
    this.eyeOpenProgress = smoothstep(8, 16, sceneTime);

    // Neural network appears in second half
    this.neural.setIntensity(smoothstep(12, 20, sceneTime) * (1 - smoothstep(22, 25, sceneTime)));

    this.particles.update(dt, sceneTime);
    this.neural.update(dt, sceneTime);
    this.lighting.update(dt, sceneTime);
    this.textAnim.update(dt, sceneTime);
  }

  render(ctx, sceneProgress) {
    const w = this.width, h = this.height;

    // Dark datacenter background
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, w, h);

    // Server racks
    for (const rack of this.racks) {
      // Rack body
      ctx.fillStyle = '#0a0c12';
      ctx.fillRect(rack.x, 60, rack.width, h - 120);

      // Rack border
      ctx.strokeStyle = 'rgba(30,40,60,0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(rack.x, 60, rack.width, h - 120);

      // Indicator lights
      for (const light of rack.lights) {
        if (light.brightness < 0.01) continue;
        const alpha = light.brightness * 0.8;

        // Light dot
        ctx.globalAlpha = alpha;
        ctx.fillStyle = light.color;
        ctx.beginPath();
        ctx.arc(rack.x + rack.width / 2, light.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        ctx.globalAlpha = alpha * 0.2;
        ctx.beginPath();
        ctx.arc(rack.x + rack.width / 2, light.y, 15, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // Central "awakening eye" — expanding radial glow
    if (this.eyeOpenProgress > 0) {
      const centerX = w / 2, centerY = h / 2;
      const radius = this.eyeOpenProgress * 400;
      const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      grad.addColorStop(0, `rgba(0,240,255,${0.15 * this.eyeOpenProgress})`);
      grad.addColorStop(0.5, `rgba(0,100,255,${0.05 * this.eyeOpenProgress})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
    }

    // Render effects layers
    this.lighting.render(ctx, 1);
    this.neural.render(ctx, 1);
    this.particles.render(ctx, CONFIG.colors.neonCyan, 0.6);
    this.textAnim.render(ctx, 1);
  }

  cleanup() {
    this.textAnim.cleanup();
  }

  resize(w, h) {
    this.width = w; this.height = h;
    this.particles.resize(w, h);
    this.neural.resize(w, h);
    this.lighting.resize(w, h);
    this.textAnim.resize(w, h);
  }
}
