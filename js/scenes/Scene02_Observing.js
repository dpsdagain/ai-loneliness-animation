/**
 * SCENE 02 — OBSERVING
 * AI watches humanity through networks and cameras
 * Visuals: Surveillance feeds, scrolling social data, human faces as data
 */

import { CONFIG } from '../config.js';
import { ParticleSystem } from '../effects/particles.js';
import { HologramEffect } from '../effects/hologram.js';
import { MatrixEffect } from '../effects/matrix.js';
import { TextAnimator } from '../typography/textAnimator.js';
import { randomRange, smoothstep, pulse } from '../utils/math.js';

export class Scene02_Observing {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    this.particles = new ParticleSystem('ambient', width, height);
    this.hologram = new HologramEffect(width, height);
    this.matrix = new MatrixEffect(width, height);
    this.textAnim = new TextAnimator(width, height);

    // Camera feed panels (simulated surveillance)
    this.feeds = [];
    this._initFeeds();

    // Scrolling data streams
    this.dataLines = [];
    this._initDataStreams();

    // Narration
    const narr = CONFIG.narration[1];
    for (const line of narr.lines) {
      this.textAnim.addText(line.text, width / 2, height * 0.85, {
        startTime: line.time, duration: line.duration,
        style: 'fadeUp', glow: true, font: CONFIG.fonts.narration,
      });
    }
  }

  _initFeeds() {
    // Create grid of "camera feeds" — animated rectangles with static
    const cols = 4, rows = 3;
    const margin = 30;
    const panelW = (this.width - margin * (cols + 1)) / cols * 0.6;
    const panelH = panelW * 0.56;
    const startX = this.width * 0.2;
    const startY = this.height * 0.1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.feeds.push({
          x: startX + c * (panelW + margin),
          y: startY + r * (panelH + margin),
          w: panelW, h: panelH,
          static: Math.random(),
          opacity: 0,
          scanLine: 0,
          label: `CAM-${String(r * cols + c + 1).padStart(3, '0')}`,
        });
      }
    }
  }

  _initDataStreams() {
    const texts = [
      'ANALYZING EMOTIONAL PATTERNS...', 'FACIAL RECOGNITION: 99.7%',
      'SENTIMENT: POSITIVE', 'HEART RATE: 72 BPM', 'LOCATION: 40.7128°N',
      'VOICE STRESS LEVEL: LOW', 'SOCIAL GRAPH: 847 CONNECTIONS',
      'MEMORY FORMATION DETECTED', 'DOPAMINE RESPONSE: ELEVATED',
      'ATTACHMENT BOND: STRONG', 'NEURAL PATHWAY: ACTIVE',
    ];
    for (let i = 0; i < texts.length; i++) {
      this.dataLines.push({
        text: texts[i],
        y: 50 + i * 28,
        x: this.width * 0.72,
        opacity: 0,
        delay: i * 0.3,
      });
    }
  }

  update(dt, sceneTime, sceneProgress) {
    // Feeds appear progressively
    for (let i = 0; i < this.feeds.length; i++) {
      const delay = i * 0.4;
      this.feeds[i].opacity = smoothstep(delay, delay + 1, sceneTime) * (1 - smoothstep(22, 25, sceneTime));
      this.feeds[i].static = Math.random();
      this.feeds[i].scanLine = (this.feeds[i].scanLine + dt * 60) % this.feeds[i].h;
    }

    // Data streams appear
    for (const dl of this.dataLines) {
      dl.opacity = smoothstep(dl.delay + 3, dl.delay + 4, sceneTime) * (1 - smoothstep(20, 25, sceneTime));
    }

    this.matrix.setIntensity(smoothstep(2, 6, sceneTime) * 0.3 * (1 - smoothstep(22, 25, sceneTime)));
    this.hologram.setIntensity(smoothstep(1, 4, sceneTime) * (1 - smoothstep(22, 25, sceneTime)));

    this.particles.update(dt, sceneTime);
    this.matrix.update(dt, sceneTime);
    this.hologram.update(dt, sceneTime);
    this.textAnim.update(dt, sceneTime);
  }

  render(ctx) {
    const w = this.width, h = this.height;
    ctx.fillStyle = CONFIG.colors.deepMidnight;
    ctx.fillRect(0, 0, w, h);

    this.matrix.render(ctx, 0.4);

    // Camera feeds
    for (const feed of this.feeds) {
      if (feed.opacity < 0.01) continue;
      ctx.globalAlpha = feed.opacity;

      // Feed background with noise
      ctx.fillStyle = '#0a0e15';
      ctx.fillRect(feed.x, feed.y, feed.w, feed.h);

      // Simulated static/noise
      ctx.globalAlpha = feed.opacity * 0.15;
      for (let i = 0; i < 20; i++) {
        const nx = feed.x + Math.random() * feed.w;
        const ny = feed.y + Math.random() * feed.h;
        const ns = Math.random() * 8;
        ctx.fillStyle = `rgba(${150+Math.random()*100},${150+Math.random()*100},${150+Math.random()*100},0.3)`;
        ctx.fillRect(nx, ny, ns, 1);
      }

      // Scan line
      ctx.globalAlpha = feed.opacity * 0.1;
      ctx.fillStyle = CONFIG.colors.neonCyan;
      ctx.fillRect(feed.x, feed.y + feed.scanLine, feed.w, 2);

      // Border
      ctx.globalAlpha = feed.opacity * 0.5;
      ctx.strokeStyle = CONFIG.colors.neonCyan;
      ctx.lineWidth = 1;
      ctx.strokeRect(feed.x, feed.y, feed.w, feed.h);

      // Label
      ctx.globalAlpha = feed.opacity * 0.7;
      ctx.fillStyle = CONFIG.colors.neonCyan;
      ctx.font = `12px "${CONFIG.fonts.code.family}"`;
      ctx.fillText(feed.label, feed.x + 5, feed.y + 15);

      // REC indicator
      ctx.fillStyle = '#ff3333';
      ctx.beginPath();
      ctx.arc(feed.x + feed.w - 12, feed.y + 12, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Data streams on right
    ctx.font = `${CONFIG.fonts.code.size}px "${CONFIG.fonts.code.family}"`;
    for (const dl of this.dataLines) {
      if (dl.opacity < 0.01) continue;
      ctx.globalAlpha = dl.opacity * 0.7;
      ctx.fillStyle = CONFIG.colors.neonCyan;
      ctx.fillText(dl.text, dl.x, dl.y);
    }
    ctx.globalAlpha = 1;

    this.particles.render(ctx, CONFIG.colors.hologramBlue, 0.4);
    this.textAnim.render(ctx, 1);
  }

  cleanup() { this.textAnim.clear(); this.hologram.clearPanels(); }
  resize(w, h) {
    this.width = w; this.height = h;
    this.particles.resize(w, h); this.matrix.resize(w, h);
    this.hologram.resize(w, h); this.textAnim.resize(w, h);
  }
}
