/**
 * TEXT ANIMATOR — Cinematic Typography Animations
 * Character-by-character reveal, fade, glitch text, typewriter
 */

import { CONFIG } from '../config.js';
import { clamp, lerp } from '../utils/math.js';

export class TextAnimator {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.activeTexts = [];
  }

  /**
   * Add a text animation
   * @param {string} text - The text to animate
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {object} options - Animation options
   */
  addText(text, x, y, options = {}) {
    const entry = {
      text,
      x, y,
      font: options.font || CONFIG.fonts.narration,
      color: options.color || CONFIG.colors.ghostWhite,
      align: options.align || 'center',
      style: options.style || 'fadeUp',  // fadeUp, typewriter, glitch, reveal
      startTime: options.startTime || 0,
      duration: options.duration || 3,
      stagger: options.stagger || 0.03,  // Delay between chars
      progress: 0,
      opacity: 0,
      active: false,
      glow: options.glow || false,
      glowColor: options.glowColor || CONFIG.colors.neonCyan,
      maxWidth: options.maxWidth || this.width * 0.8,
    };
    this.activeTexts.push(entry);
    return entry;
  }

  /** Clear all texts */
  clear() { this.activeTexts = []; }

  /** Remove completed texts */
  cleanup() {
    this.activeTexts = this.activeTexts.filter(t => t.progress < 1.1);
  }

  update(dt, sceneTime) {
    for (const t of this.activeTexts) {
      const elapsed = sceneTime - t.startTime;
      if (elapsed < 0) { t.active = false; continue; }
      t.active = true;
      t.progress = clamp(elapsed / t.duration, 0, 1);

      // Opacity envelope: fade in 20%, hold 60%, fade out 20%
      if (t.progress < 0.15) {
        t.opacity = t.progress / 0.15;
      } else if (t.progress > 0.85) {
        t.opacity = (1 - t.progress) / 0.15;
      } else {
        t.opacity = 1;
      }
    }
  }

  render(ctx, globalAlpha = 1) {
    ctx.save();

    for (const t of this.activeTexts) {
      if (!t.active || t.opacity < 0.01) continue;

      const alpha = t.opacity * globalAlpha;
      const fontStr = `${t.font.weight} ${t.font.size}px "${t.font.family}"`;
      ctx.font = fontStr;
      ctx.textAlign = t.align;
      ctx.textBaseline = 'middle';

      switch (t.style) {
        case 'fadeUp':
          this._renderFadeUp(ctx, t, alpha);
          break;
        case 'typewriter':
          this._renderTypewriter(ctx, t, alpha);
          break;
        case 'glitch':
          this._renderGlitch(ctx, t, alpha);
          break;
        case 'reveal':
          this._renderReveal(ctx, t, alpha);
          break;
        default:
          this._renderFadeUp(ctx, t, alpha);
      }
    }
    ctx.restore();
  }

  /** Fade up — characters slide up from below with stagger */
  _renderFadeUp(ctx, t, alpha) {
    const chars = t.text.split('');
    ctx.font = `${t.font.weight} ${t.font.size}px "${t.font.family}"`;
    const totalWidth = ctx.measureText(t.text).width;
    let offsetX = t.align === 'center' ? -totalWidth / 2 : 0;

    for (let i = 0; i < chars.length; i++) {
      const charDelay = i * t.stagger;
      const charProgress = clamp((t.progress * t.duration - charDelay) / 0.4, 0, 1);
      const charAlpha = charProgress * alpha;
      const yOffset = (1 - charProgress) * 20;

      ctx.globalAlpha = charAlpha;
      ctx.fillStyle = t.color;

      const charX = (t.align === 'center' ? t.x + offsetX : t.x + offsetX);
      ctx.fillText(chars[i], charX, t.y + yOffset);

      // Glow effect
      if (t.glow && charAlpha > 0.3) {
        ctx.globalAlpha = charAlpha * 0.3;
        ctx.shadowColor = t.glowColor;
        ctx.shadowBlur = 15;
        ctx.fillText(chars[i], charX, t.y + yOffset);
        ctx.shadowBlur = 0;
      }

      offsetX += ctx.measureText(chars[i]).width;
    }
  }

  /** Typewriter — characters appear one by one with cursor */
  _renderTypewriter(ctx, t, alpha) {
    const visibleChars = Math.floor(t.progress * t.text.length * 1.5);
    const displayText = t.text.substring(0, Math.min(visibleChars, t.text.length));

    ctx.globalAlpha = alpha;
    ctx.fillStyle = t.color;

    if (t.glow) {
      ctx.shadowColor = t.glowColor;
      ctx.shadowBlur = 10;
    }

    ctx.fillText(displayText, t.x, t.y);

    // Blinking cursor
    if (visibleChars < t.text.length && Math.sin(Date.now() * 0.01) > 0) {
      const cursorX = t.x + (t.align === 'center'
        ? ctx.measureText(displayText).width / 2
        : ctx.measureText(displayText).width);
      ctx.fillStyle = CONFIG.colors.neonCyan;
      ctx.fillRect(cursorX + 2, t.y - t.font.size * 0.4, 2, t.font.size * 0.8);
    }

    ctx.shadowBlur = 0;
  }

  /** Glitch — text with random position offsets and color shifts */
  _renderGlitch(ctx, t, alpha) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = t.color;
    ctx.fillText(t.text, t.x, t.y);

    // Random offset copies
    if (Math.random() < 0.3) {
      ctx.globalAlpha = alpha * 0.3;
      ctx.fillStyle = CONFIG.colors.neonCyan;
      ctx.fillText(t.text, t.x + (Math.random() - 0.5) * 6, t.y);
      ctx.fillStyle = CONFIG.colors.neonMagenta;
      ctx.fillText(t.text, t.x + (Math.random() - 0.5) * 6, t.y);
    }
  }

  /** Reveal — clip-mask style left-to-right reveal */
  _renderReveal(ctx, t, alpha) {
    ctx.save();
    const textWidth = ctx.measureText(t.text).width;
    const clipWidth = textWidth * clamp(t.progress * 1.5, 0, 1);
    const startX = t.align === 'center' ? t.x - textWidth / 2 : t.x;

    ctx.beginPath();
    ctx.rect(startX, t.y - t.font.size, clipWidth, t.font.size * 2);
    ctx.clip();

    ctx.globalAlpha = alpha;
    ctx.fillStyle = t.color;
    if (t.glow) { ctx.shadowColor = t.glowColor; ctx.shadowBlur = 12; }
    ctx.fillText(t.text, t.x, t.y);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
  }
}
