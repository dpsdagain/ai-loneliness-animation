/**
 * MATRIX.JS — Floating Code / Data Streams
 * Cascading characters resembling digital rain / Matrix effect
 */

import { randomRange, randomInt } from '../utils/math.js';
import { CONFIG } from '../config.js';

export class MatrixEffect {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.columns = [];
    this.intensity = 0;
    this.chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    this._initColumns();
  }

  _initColumns() {
    const fontSize = 14;
    const cols = Math.floor(this.width / fontSize);
    this.columns = [];
    for (let i = 0; i < cols; i++) {
      this.columns.push({
        x: i * fontSize,
        y: randomRange(-this.height, 0),
        speed: randomRange(30, 120),
        chars: [],
        charCount: randomInt(8, 25),
        fontSize: fontSize,
        lastChar: 0,
        phase: randomRange(0, Math.PI * 2),
      });
      // Pre-generate characters
      for (let j = 0; j < this.columns[i].charCount; j++) {
        this.columns[i].chars.push(this.chars[randomInt(0, this.chars.length - 1)]);
      }
    }
  }

  update(dt, time) {
    for (const col of this.columns) {
      col.y += col.speed * dt * this.intensity;
      // Periodically change a random character
      if (Math.random() < 0.02) {
        const idx = randomInt(0, col.chars.length - 1);
        col.chars[idx] = this.chars[randomInt(0, this.chars.length - 1)];
      }
      // Reset when off screen
      if (col.y - col.charCount * col.fontSize > this.height) {
        col.y = -col.charCount * col.fontSize;
        col.speed = randomRange(30, 120);
      }
    }
  }

  render(ctx, globalAlpha = 1) {
    if (this.intensity < 0.01) return;
    ctx.save();
    ctx.font = `14px "${CONFIG.fonts.code.family}", monospace`;

    for (const col of this.columns) {
      for (let i = 0; i < col.chars.length; i++) {
        const cy = col.y + i * col.fontSize;
        if (cy < -20 || cy > this.height + 20) continue;

        // Head character is brightest
        const isHead = i === col.chars.length - 1;
        const fadeRatio = i / col.chars.length;

        if (isHead) {
          ctx.globalAlpha = 0.9 * this.intensity * globalAlpha;
          ctx.fillStyle = '#fff';
        } else {
          ctx.globalAlpha = fadeRatio * 0.4 * this.intensity * globalAlpha;
          ctx.fillStyle = CONFIG.colors.neonCyan;
        }

        ctx.fillText(col.chars[i], col.x, cy);
      }
    }
    ctx.restore();
  }

  setIntensity(value) { this.intensity = value; }
  resize(width, height) {
    this.width = width;
    this.height = height;
    this._initColumns();
  }
}
