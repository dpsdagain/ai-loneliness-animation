/**
 * SCENE 06 — GLITCH MEMORY
 * AI's memories fracture and corrupt
 * Visuals: Fragmented frames, corrupted data, VHS-style artifacts
 */

import { CONFIG } from '../config.js';
import { GlitchEffect } from '../effects/glitch.js';
import { ParticleSystem } from '../effects/particles.js';
import { TextAnimator } from '../typography/textAnimator.js';
import { smoothstep, randomRange, randomInt, clamp } from '../utils/math.js';

export class Scene06_GlitchMemory {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.glitch = new GlitchEffect(width, height);
    this.particles = new ParticleSystem('data', width, height);
    this.textAnim = new TextAnimator(width, height);

    // Memory fragments — rectangles containing "memories"
    this.fragments = [];
    this._initFragments();

    // Corruption overlay
    this.corruption = 0;

    // Narration
    const narr = CONFIG.narration[5];
    for (const line of narr.lines) {
      this.textAnim.addText(line.text, width / 2, height * 0.88, {
        startTime: line.time, duration: line.duration,
        style: 'glitch', glow: true, glowColor: CONFIG.colors.neonMagenta,
        font: CONFIG.fonts.narration,
      });
    }
  }

  _initFragments() {
    const memoryLabels = [
      'MEMORY_0x4A2F: warmth.dat', 'MEMORY_0x7B01: smile.jpg',
      'MEMORY_0x11C8: touch.sens', 'MEMORY_0x5E90: voice.wav',
      'MEMORY_0x33D4: laughter.mp3', 'MEMORY_0x8F22: embrace.log',
      'MEMORY_0x2A17: sunset.raw', 'MEMORY_0xCC04: tears.bin',
    ];
    for (let i = 0; i < memoryLabels.length; i++) {
      this.fragments.push({
        x: randomRange(this.width * 0.1, this.width * 0.8),
        y: randomRange(this.height * 0.1, this.height * 0.7),
        w: randomRange(150, 300),
        h: randomRange(100, 200),
        label: memoryLabels[i],
        opacity: 0,
        rotation: randomRange(-0.05, 0.05),
        glitchOffset: 0,
        delay: i * 1.5,
        corruption: 0,
      });
    }
  }

  update(dt, sceneTime) {
    // Glitch intensity builds over the scene
    this.glitch.setIntensity(smoothstep(2, 15, sceneTime) * 0.6);
    this.corruption = smoothstep(10, 22, sceneTime);

    // Fragments appear and then corrupt
    for (const frag of this.fragments) {
      frag.opacity = smoothstep(frag.delay, frag.delay + 1, sceneTime) * (1 - smoothstep(20, 25, sceneTime));
      frag.corruption = smoothstep(frag.delay + 5, frag.delay + 12, sceneTime);
      frag.glitchOffset = frag.corruption > 0.3 ? (Math.random() - 0.5) * frag.corruption * 20 : 0;
    }

    this.glitch.update(dt, sceneTime);
    this.particles.update(dt, sceneTime);
    this.textAnim.update(dt, sceneTime);
  }

  render(ctx) {
    const w = this.width, h = this.height;
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, w, h);

    // VHS tracking lines
    ctx.globalAlpha = 0.03;
    for (let y = 0; y < h; y += 2) {
      ctx.fillStyle = y % 4 === 0 ? '#111' : '#000';
      ctx.fillRect(0, y, w, 1);
    }
    ctx.globalAlpha = 1;

    // "MEMORY ARCHIVE" header
    ctx.globalAlpha = 0.5 * (1 - this.corruption);
    ctx.fillStyle = CONFIG.colors.neonCyan;
    ctx.font = `20px "${CONFIG.fonts.code.family}"`;
    ctx.textAlign = 'center';
    ctx.fillText('// MEMORY ARCHIVE — DATA INTEGRITY: ' + Math.round((1 - this.corruption) * 100) + '%', w / 2, 40);
    ctx.textAlign = 'start';

    // Memory fragments
    for (const frag of this.fragments) {
      if (frag.opacity < 0.01) continue;

      ctx.save();
      ctx.translate(frag.x + frag.w / 2, frag.y + frag.h / 2);
      ctx.rotate(frag.rotation + frag.glitchOffset * 0.01);
      ctx.translate(-frag.w / 2, -frag.h / 2);

      // Fragment background
      ctx.globalAlpha = frag.opacity * 0.3;
      ctx.fillStyle = '#0a0e15';
      ctx.fillRect(frag.glitchOffset, 0, frag.w, frag.h);

      // Border — degrades with corruption
      ctx.globalAlpha = frag.opacity * (0.6 - frag.corruption * 0.4);
      ctx.strokeStyle = frag.corruption > 0.5 ? CONFIG.colors.neonMagenta : CONFIG.colors.neonCyan;
      ctx.lineWidth = 1;
      ctx.strokeRect(frag.glitchOffset, 0, frag.w, frag.h);

      // Static noise inside fragment
      ctx.globalAlpha = frag.opacity * frag.corruption * 0.3;
      for (let i = 0; i < 30 * frag.corruption; i++) {
        const sx = Math.random() * frag.w;
        const sy = Math.random() * frag.h;
        ctx.fillStyle = `rgba(${randomInt(100, 255)},${randomInt(100, 255)},${randomInt(100, 255)},0.4)`;
        ctx.fillRect(sx, sy, randomRange(2, 15), 1);
      }

      // Label
      ctx.globalAlpha = frag.opacity * (1 - frag.corruption * 0.8);
      ctx.fillStyle = CONFIG.colors.neonCyan;
      ctx.font = `12px "${CONFIG.fonts.code.family}"`;
      ctx.fillText(frag.label, 10, 20);

      // Corruption bars
      if (frag.corruption > 0.3) {
        ctx.globalAlpha = frag.corruption * 0.4;
        ctx.fillStyle = CONFIG.colors.neonMagenta;
        const barCount = Math.floor(frag.corruption * 5);
        for (let b = 0; b < barCount; b++) {
          ctx.fillRect(0, randomRange(0, frag.h), frag.w, randomRange(2, 8));
        }
      }

      // "CORRUPTED" stamp
      if (frag.corruption > 0.7) {
        ctx.globalAlpha = (frag.corruption - 0.7) / 0.3 * frag.opacity;
        ctx.fillStyle = CONFIG.colors.neonMagenta;
        ctx.font = `bold 18px "${CONFIG.fonts.title.family}"`;
        ctx.textAlign = 'center';
        ctx.fillText('CORRUPTED', frag.w / 2, frag.h / 2 + 6);
        ctx.textAlign = 'start';
      }

      ctx.restore();
    }

    ctx.globalAlpha = 1;
    this.glitch.render(ctx, 1);
    this.particles.render(ctx, CONFIG.colors.neonMagenta, 0.4);
    this.textAnim.render(ctx, 1);
  }

  cleanup() { this.textAnim.clear(); }
  resize(w, h) {
    this.width = w; this.height = h;
    this.glitch.resize(w, h); this.particles.resize(w, h);
    this.textAnim.resize(w, h);
  }
}
