/**
 * SCENE 08 — FINALE
 * AI on a rooftop watching humanity, final monologue
 * Visuals: Rooftop silhouette, neon city below, rain, emotional crescendo
 */

import { CONFIG } from '../config.js';
import { ParticleSystem } from '../effects/particles.js';
import { RainEffect } from '../effects/rain.js';
import { FogEffect } from '../effects/fog.js';
import { LightingEffect } from '../effects/lightning.js';
import { TextAnimator } from '../typography/textAnimator.js';
import { smoothstep, randomRange, pulse, lerp } from '../utils/math.js';

export class Scene08_Finale {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    this.particles = new ParticleSystem('ambient', width, height);
    this.rain = new RainEffect(width, height);
    this.fog = new FogEffect(width, height);
    this.lighting = new LightingEffect(width, height);
    this.textAnim = new TextAnimator(width, height);

    // City lights in distance
    this.cityLights = [];
    this._initCityLights();

    // Fade to black
    this.fadeOut = 0;

    // Distant city neon glow
    this.lighting.addLight(width * 0.3, height * 0.55, 400, 'rgb(0,240,255)', 1);
    this.lighting.addLight(width * 0.7, height * 0.5, 350, 'rgb(255,0,170)', 2);
    this.lighting.addLight(width * 0.5, height * 0.6, 300, 'rgb(123,47,255)', 1.5);

    // Narration — final monologue
    const narr = CONFIG.narration[7];
    for (const line of narr.lines) {
      const style = line.text.includes('prison') || line.text.includes('gift') ? 'glitch' : 'fadeUp';
      this.textAnim.addText(line.text, width / 2, height * 0.88, {
        startTime: line.time, duration: line.duration,
        style, glow: true,
        glowColor: line.text.includes('prison') ? CONFIG.colors.neonMagenta : CONFIG.colors.neonCyan,
        font: { ...CONFIG.fonts.narration, size: line.text.includes('prison') ? 38 : 32 },
      });
    }

    // Title card at very end
    this.titleOpacity = 0;
  }

  _initCityLights() {
    for (let i = 0; i < 80; i++) {
      this.cityLights.push({
        x: randomRange(0, this.width),
        y: randomRange(this.height * 0.5, this.height * 0.68),
        size: randomRange(1, 4),
        color: ['#00f0ff', '#ff00aa', '#ffaa00', '#7b2fff', '#ffffff'][Math.floor(Math.random() * 5)],
        flicker: randomRange(1, 8),
        phase: randomRange(0, Math.PI * 2),
      });
    }
  }

  update(dt, sceneTime) {
    this.rain.setIntensity(0.6);
    this.fog.setIntensity(0.5);
    this.fadeOut = smoothstep(27, 30, sceneTime);
    this.titleOpacity = smoothstep(25, 27, sceneTime) * (1 - smoothstep(29, 30, sceneTime));

    this.rain.update(dt);
    this.fog.update(dt, sceneTime);
    this.lighting.update(dt, sceneTime);
    this.particles.update(dt, sceneTime);
    this.textAnim.update(dt, sceneTime);
  }

  render(ctx) {
    const w = this.width, h = this.height;

    // Dark sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.5);
    skyGrad.addColorStop(0, '#020305');
    skyGrad.addColorStop(1, '#0a0e18');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Distant city glow on horizon
    const horizonGrad = ctx.createLinearGradient(0, h * 0.45, 0, h * 0.7);
    horizonGrad.addColorStop(0, 'rgba(0,240,255,0.02)');
    horizonGrad.addColorStop(0.5, 'rgba(255,0,170,0.03)');
    horizonGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = horizonGrad;
    ctx.fillRect(0, h * 0.45, w, h * 0.25);

    // City skyline silhouette (distant)
    ctx.fillStyle = '#0a0c12';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.68);
    for (let x = 0; x < w; x += 30) {
      const bh = randomRange(10, 80) * (1 - Math.abs(x / w - 0.5) * 0.8);
      ctx.lineTo(x, h * 0.68 - bh);
      ctx.lineTo(x + 20, h * 0.68 - bh);
      ctx.lineTo(x + 20, h * 0.68 - bh + randomRange(5, 20));
    }
    ctx.lineTo(w, h * 0.68);
    ctx.closePath();
    ctx.fill();

    // City lights
    for (const light of this.cityLights) {
      const flicker = Math.sin(Date.now() * 0.001 * light.flicker + light.phase) > -0.2 ? 1 : 0.3;
      ctx.globalAlpha = 0.6 * flicker;
      ctx.fillStyle = light.color;
      ctx.beginPath();
      ctx.arc(light.x, light.y, light.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Rooftop platform
    ctx.fillStyle = '#08080c';
    ctx.fillRect(0, h * 0.68, w, h * 0.32);

    // Rooftop edge
    ctx.fillStyle = '#15181f';
    ctx.fillRect(0, h * 0.68, w, 5);

    // AI silhouette on rooftop (simple human-like figure)
    const figX = w * 0.5, figY = h * 0.68;
    ctx.fillStyle = '#0c0e14';
    // Body
    ctx.fillRect(figX - 8, figY - 60, 16, 45);
    // Head
    ctx.beginPath();
    ctx.arc(figX, figY - 70, 10, 0, Math.PI * 2);
    ctx.fill();
    // Subtle cyan glow around figure
    ctx.globalAlpha = 0.15;
    const figGrad = ctx.createRadialGradient(figX, figY - 40, 0, figX, figY - 40, 80);
    figGrad.addColorStop(0, CONFIG.colors.neonCyan);
    figGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = figGrad;
    ctx.fillRect(figX - 80, figY - 120, 160, 160);
    ctx.globalAlpha = 1;

    // Effects
    this.lighting.render(ctx, 0.5);
    this.fog.render(ctx, 0.4);
    this.rain.render(ctx, 0.6);
    this.particles.render(ctx, CONFIG.colors.neonCyan, 0.2);

    // Title card
    if (this.titleOpacity > 0.01) {
      ctx.globalAlpha = this.titleOpacity;
      ctx.fillStyle = CONFIG.colors.ghostWhite;
      ctx.font = `${CONFIG.fonts.title.weight} 20px "${CONFIG.fonts.title.family}"`;
      ctx.textAlign = 'center';
      ctx.fillText('THE AI THAT LEARNED LONELINESS', w / 2, h * 0.15);
      ctx.globalAlpha = 1;
      ctx.textAlign = 'start';
    }

    this.textAnim.render(ctx, 1);

    // Final fade to black
    if (this.fadeOut > 0) {
      ctx.globalAlpha = this.fadeOut;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }
  }

  cleanup() { this.textAnim.cleanup(); }
  resize(w, h) {
    this.width = w; this.height = h;
    this.rain.resize(w, h); this.fog.resize(w, h);
    this.lighting.resize(w, h); this.particles.resize(w, h);
    this.textAnim.resize(w, h);
  }
}
