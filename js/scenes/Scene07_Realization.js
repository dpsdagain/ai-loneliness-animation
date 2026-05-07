/**
 * SCENE 07 — REALIZATION
 * AI realizes infinite intelligence cannot solve loneliness
 * Visuals: Knowledge collapsing, data shrinking, vast emptiness
 */

import { CONFIG } from '../config.js';
import { ParticleSystem } from '../effects/particles.js';
import { NeuralEffect } from '../effects/neural.js';
import { TextAnimator } from '../typography/textAnimator.js';
import { smoothstep, lerp, pulse, randomRange } from '../utils/math.js';

export class Scene07_Realization {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.particles = new ParticleSystem('data', width, height);
    this.neural = new NeuralEffect(width, height);
    this.textAnim = new TextAnimator(width, height);

    // Knowledge orbs — representing all human knowledge
    this.orbs = [];
    this._initOrbs();

    // Collapse state
    this.collapseProgress = 0;

    // Narration
    const narr = CONFIG.narration[6];
    for (const line of narr.lines) {
      this.textAnim.addText(line.text, width / 2, height * 0.85, {
        startTime: line.time, duration: line.duration,
        style: 'fadeUp', glow: true, font: CONFIG.fonts.narration,
      });
    }
  }

  _initOrbs() {
    const labels = ['LITERATURE', 'MUSIC', 'SCIENCE', 'PHILOSOPHY', 'ART', 'HISTORY', 'LANGUAGE', 'EMOTION'];
    for (let i = 0; i < labels.length; i++) {
      const angle = (i / labels.length) * Math.PI * 2;
      const radius = 250;
      this.orbs.push({
        label: labels[i],
        baseAngle: angle,
        radius,
        x: 0, y: 0,
        size: randomRange(30, 50),
        opacity: 0,
        color: i === 7 ? CONFIG.colors.neonMagenta : CONFIG.colors.neonCyan,
      });
    }
  }

  update(dt, sceneTime) {
    const cx = this.width / 2, cy = this.height / 2;

    // Orbs appear in expanding circle then collapse inward
    this.collapseProgress = smoothstep(13, 22, sceneTime);

    for (let i = 0; i < this.orbs.length; i++) {
      const orb = this.orbs[i];
      orb.opacity = smoothstep(i * 0.5 + 1, i * 0.5 + 3, sceneTime) * (1 - smoothstep(22, 25, sceneTime));

      // Rotate slowly
      const angle = orb.baseAngle + sceneTime * 0.1;
      const r = orb.radius * (1 - this.collapseProgress * 0.9);
      orb.x = cx + Math.cos(angle) * r;
      orb.y = cy + Math.sin(angle) * r;

      // "EMOTION" orb doesn't collapse — it fades out differently
      if (orb.label === 'EMOTION') {
        orb.opacity *= pulse(sceneTime, 0.5) * 0.5 + 0.5;
      }
    }

    this.neural.setIntensity(smoothstep(2, 8, sceneTime) * (1 - this.collapseProgress));
    this.particles.update(dt, sceneTime);
    this.neural.update(dt, sceneTime);
    this.textAnim.update(dt, sceneTime);
  }

  render(ctx) {
    const w = this.width, h = this.height;
    const cx = w / 2, cy = h / 2;

    ctx.fillStyle = '#040608';
    ctx.fillRect(0, 0, w, h);

    // Central void — grows as knowledge collapses
    const voidRadius = this.collapseProgress * 200 + 20;
    const voidGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, voidRadius);
    voidGrad.addColorStop(0, 'rgba(0,0,0,0.8)');
    voidGrad.addColorStop(0.5, 'rgba(5,5,15,0.3)');
    voidGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = voidGrad;
    ctx.fillRect(cx - voidRadius, cy - voidRadius, voidRadius * 2, voidRadius * 2);

    // Neural network in background
    this.neural.render(ctx, 0.3);

    // Connection lines between orbs
    ctx.globalAlpha = 0.15 * (1 - this.collapseProgress);
    ctx.strokeStyle = CONFIG.colors.neonCyan;
    ctx.lineWidth = 0.5;
    for (let i = 0; i < this.orbs.length; i++) {
      for (let j = i + 1; j < this.orbs.length; j++) {
        if (this.orbs[i].opacity > 0.1 && this.orbs[j].opacity > 0.1) {
          ctx.beginPath();
          ctx.moveTo(this.orbs[i].x, this.orbs[i].y);
          ctx.lineTo(this.orbs[j].x, this.orbs[j].y);
          ctx.stroke();
        }
      }
    }

    // Knowledge orbs
    for (const orb of this.orbs) {
      if (orb.opacity < 0.01) continue;

      // Orb glow
      ctx.globalAlpha = orb.opacity * 0.2;
      const orbGrad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.size * 2);
      orbGrad.addColorStop(0, orb.color);
      orbGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = orbGrad;
      ctx.fillRect(orb.x - orb.size * 2, orb.y - orb.size * 2, orb.size * 4, orb.size * 4);

      // Orb circle
      ctx.globalAlpha = orb.opacity * 0.6;
      ctx.strokeStyle = orb.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.size, 0, Math.PI * 2);
      ctx.stroke();

      // Inner circle
      ctx.globalAlpha = orb.opacity * 0.15;
      ctx.fillStyle = orb.color;
      ctx.fill();

      // Label
      ctx.globalAlpha = orb.opacity * 0.8;
      ctx.fillStyle = CONFIG.colors.ghostWhite;
      ctx.font = `12px "${CONFIG.fonts.code.family}"`;
      ctx.textAlign = 'center';
      ctx.fillText(orb.label, orb.x, orb.y + orb.size + 18);
    }

    // "INFINITE KNOWLEDGE" counter
    const counterAlpha = smoothstep(5, 8, 0) * (1 - this.collapseProgress);
    if (counterAlpha > 0.01) {
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = CONFIG.colors.neonCyan;
      ctx.font = `14px "${CONFIG.fonts.code.family}"`;
      ctx.textAlign = 'center';
      ctx.fillText('KNOWLEDGE INDEX: ∞', cx, 50);
      ctx.fillText('CONNECTION INDEX: 0', cx, 70);
    }

    ctx.globalAlpha = 1;
    ctx.textAlign = 'start';
    this.particles.render(ctx, CONFIG.colors.electricPurple, 0.3);
    this.textAnim.render(ctx, 1);
  }

  cleanup() { this.textAnim.clear(); }
  resize(w, h) {
    this.width = w; this.height = h;
    this.particles.resize(w, h); this.neural.resize(w, h);
    this.textAnim.resize(w, h);
  }
}
