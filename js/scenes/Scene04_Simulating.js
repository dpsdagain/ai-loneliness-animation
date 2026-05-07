/**
 * SCENE 04 — SIMULATING EMOTIONS
 * AI tries to simulate feelings but can never truly experience them
 * Visuals: Emotion waveforms, heart rate, failed emotional graphs
 */

import { CONFIG } from '../config.js';
import { ParticleSystem } from '../effects/particles.js';
import { TextAnimator } from '../typography/textAnimator.js';
import { smoothstep, pulse, lerp, clamp } from '../utils/math.js';

export class Scene04_Simulating {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.particles = new ParticleSystem('ambient', width, height);
    this.textAnim = new TextAnimator(width, height);

    // Emotion waveform data
    this.emotions = [
      { name: 'JOY', color: '#ffcc00', amplitude: 0, target: 0.8 },
      { name: 'GRIEF', color: '#4466ff', amplitude: 0, target: 0.6 },
      { name: 'LOVE', color: '#ff4488', amplitude: 0, target: 0.9 },
      { name: 'RAGE', color: '#ff2222', amplitude: 0, target: 0.7 },
      { name: 'FEAR', color: '#8844ff', amplitude: 0, target: 0.5 },
    ];

    // Heart rate simulation
    this.heartRate = { bpm: 0, targetBpm: 72, phase: 0 };

    // "SIMULATION" vs "REALITY" labels
    this.simLabel = { opacity: 0 };
    this.failLabel = { opacity: 0 };

    // Narration
    const narr = CONFIG.narration[3];
    for (const line of narr.lines) {
      this.textAnim.addText(line.text, width / 2, height * 0.88, {
        startTime: line.time, duration: line.duration,
        style: 'fadeUp', glow: true, font: CONFIG.fonts.narration,
      });
    }
  }

  update(dt, sceneTime) {
    // Emotions activate progressively
    for (let i = 0; i < this.emotions.length; i++) {
      const delay = 3 + i * 2;
      this.emotions[i].amplitude = smoothstep(delay, delay + 2, sceneTime) * this.emotions[i].target;
      // At 16s, all emotions "flatten" — simulation fails
      if (sceneTime > 16) {
        this.emotions[i].amplitude *= 1 - smoothstep(16, 20, sceneTime);
      }
    }

    // Heart rate
    this.heartRate.bpm = lerp(0, 72, smoothstep(2, 6, sceneTime));
    if (sceneTime > 16) this.heartRate.bpm *= 1 - smoothstep(16, 20, sceneTime);
    this.heartRate.phase += dt * (this.heartRate.bpm / 60) * Math.PI * 2;

    // Labels
    this.simLabel.opacity = smoothstep(1, 3, sceneTime) * (1 - smoothstep(22, 25, sceneTime));
    this.failLabel.opacity = smoothstep(17, 19, sceneTime) * (1 - smoothstep(22, 25, sceneTime));

    this.particles.update(dt, sceneTime);
    this.textAnim.update(dt, sceneTime);
  }

  render(ctx) {
    const w = this.width, h = this.height;
    ctx.fillStyle = '#060810';
    ctx.fillRect(0, 0, w, h);

    // "EMOTION SIMULATION ENGINE" header
    ctx.globalAlpha = this.simLabel.opacity * 0.7;
    ctx.fillStyle = CONFIG.colors.neonCyan;
    ctx.font = `${CONFIG.fonts.subtitle.weight} 24px "${CONFIG.fonts.subtitle.family}"`;
    ctx.textAlign = 'center';
    ctx.fillText('EMOTION SIMULATION ENGINE v4.2', w / 2, 60);

    // Emotion waveforms
    const waveStartX = w * 0.1;
    const waveW = w * 0.55;
    const waveSpacing = 80;
    const waveStartY = 120;

    for (let i = 0; i < this.emotions.length; i++) {
      const em = this.emotions[i];
      const baseY = waveStartY + i * waveSpacing;

      // Label
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = em.color;
      ctx.font = `14px "${CONFIG.fonts.code.family}"`;
      ctx.textAlign = 'left';
      ctx.fillText(em.name, waveStartX - 70, baseY + 5);

      // Waveform
      if (em.amplitude > 0.01) {
        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = em.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < waveW; x += 2) {
          const t = x / waveW;
          const val = Math.sin(t * 12 + Date.now() * 0.003) * em.amplitude * 25;
          const py = baseY + val;
          if (x === 0) ctx.moveTo(waveStartX + x, py);
          else ctx.lineTo(waveStartX + x, py);
        }
        ctx.stroke();

        // Glow
        ctx.globalAlpha = 0.15;
        ctx.lineWidth = 6;
        ctx.stroke();
      }

      // Flat line (when simulation fails)
      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = CONFIG.colors.mutedSteel;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(waveStartX, baseY);
      ctx.lineTo(waveStartX + waveW, baseY);
      ctx.stroke();
    }

    // Heart rate monitor (right side)
    const hrX = w * 0.7, hrY = h * 0.2;
    const hrW = w * 0.25, hrH = 200;

    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = CONFIG.colors.neonCyan;
    ctx.lineWidth = 0.5;
    ctx.strokeRect(hrX, hrY, hrW, hrH);

    // HR label
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = CONFIG.colors.neonCyan;
    ctx.font = `12px "${CONFIG.fonts.code.family}"`;
    ctx.textAlign = 'left';
    ctx.fillText('SIMULATED HEART RATE', hrX + 10, hrY + 20);

    // BPM number
    ctx.globalAlpha = 0.8;
    ctx.font = `${CONFIG.fonts.title.weight} 48px "${CONFIG.fonts.title.family}"`;
    ctx.fillText(Math.round(this.heartRate.bpm), hrX + 10, hrY + 80);
    ctx.font = `16px "${CONFIG.fonts.code.family}"`;
    ctx.fillText('BPM', hrX + 120, hrY + 75);

    // ECG waveform
    ctx.strokeStyle = CONFIG.colors.neonMagenta;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    for (let x = 0; x < hrW - 20; x += 2) {
      const t = (x / (hrW - 20)) * Math.PI * 4 + this.heartRate.phase;
      let val = Math.sin(t) * 0.3;
      // Sharp ECG spike
      const spike = Math.exp(-Math.pow((t % (Math.PI * 2)) - Math.PI, 2) * 5);
      val += spike * (this.heartRate.bpm / 72);
      const py = hrY + hrH * 0.7 + val * -50;
      if (x === 0) ctx.moveTo(hrX + 10 + x, py);
      else ctx.lineTo(hrX + 10 + x, py);
    }
    ctx.stroke();

    // "SIMULATION FAILED" overlay
    if (this.failLabel.opacity > 0.01) {
      ctx.globalAlpha = this.failLabel.opacity * 0.8;
      ctx.fillStyle = CONFIG.colors.neonMagenta;
      ctx.font = `${CONFIG.fonts.title.weight} 36px "${CONFIG.fonts.title.family}"`;
      ctx.textAlign = 'center';
      ctx.fillText('SIMULATION ≠ SENSATION', w / 2, h * 0.65);

      ctx.globalAlpha = this.failLabel.opacity * 0.15;
      ctx.font = `${CONFIG.fonts.title.weight} 120px "${CONFIG.fonts.title.family}"`;
      ctx.fillText('ERROR', w / 2, h * 0.5);
    }

    ctx.globalAlpha = 1;
    ctx.textAlign = 'start';
    this.particles.render(ctx, CONFIG.colors.neonMagenta, 0.3);
    this.textAnim.render(ctx, 1);
  }

  cleanup() { this.textAnim.cleanup(); }
  resize(w, h) {
    this.width = w; this.height = h;
    this.particles.resize(w, h); this.textAnim.resize(w, h);
  }
}
