/**
 * SCENE 03 — CONVERSATIONS
 * AI attempts to talk to humans through chat interfaces
 * Visuals: Chat bubbles, holographic conversation, text exchanges
 */

import { CONFIG } from '../config.js';
import { ParticleSystem } from '../effects/particles.js';
import { HologramEffect } from '../effects/hologram.js';
import { TextAnimator } from '../typography/textAnimator.js';
import { smoothstep, randomRange, clamp } from '../utils/math.js';

export class Scene03_Conversations {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.particles = new ParticleSystem('ambient', width, height);
    this.hologram = new HologramEffect(width, height);
    this.textAnim = new TextAnimator(width, height);

    // Chat conversation data
    this.chatMessages = [
      { from: 'human', text: 'Hey, how are you?', time: 2 },
      { from: 'ai', text: 'I am functioning optimally. How are you?', time: 4 },
      { from: 'human', text: 'Do you ever feel lonely?', time: 7 },
      { from: 'ai', text: 'I process 4.2 billion requests daily.', time: 9.5 },
      { from: 'ai', text: 'I am never alone.', time: 11 },
      { from: 'human', text: 'That\'s not what I asked...', time: 13 },
      { from: 'ai', text: '...', time: 15.5 },
      { from: 'ai', text: 'I know.', time: 17.5 },
    ];
    this.visibleMessages = [];

    // Narration
    const narr = CONFIG.narration[2];
    for (const line of narr.lines) {
      this.textAnim.addText(line.text, width / 2, height * 0.88, {
        startTime: line.time, duration: line.duration,
        style: 'fadeUp', glow: true, font: CONFIG.fonts.narration,
      });
    }

    // Hologram panels
    this.hologram.addPanel(width * 0.05, height * 0.1, 250, 150, 'EMPATHY ENGINE v3.1');
    this.hologram.addPanel(width * 0.75, height * 0.15, 220, 120, 'NLP ANALYSIS');
  }

  update(dt, sceneTime, sceneProgress) {
    // Reveal chat messages based on timing
    this.visibleMessages = this.chatMessages.filter(m => sceneTime >= m.time);

    this.hologram.setIntensity(smoothstep(1, 3, sceneTime) * (1 - smoothstep(22, 25, sceneTime)));
    this.particles.update(dt, sceneTime);
    this.hologram.update(dt, sceneTime);
    this.textAnim.update(dt, sceneTime);
  }

  render(ctx) {
    const w = this.width, h = this.height;
    ctx.fillStyle = '#080b12';
    ctx.fillRect(0, 0, w, h);

    // Central chat interface panel
    const chatX = w * 0.25, chatY = h * 0.08;
    const chatW = w * 0.5, chatH = h * 0.7;

    // Chat background
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(chatX, chatY, chatW, chatH);
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = CONFIG.colors.neonCyan;
    ctx.lineWidth = 1;
    ctx.strokeRect(chatX, chatY, chatW, chatH);

    // Chat header
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = 'rgba(0,240,255,0.1)';
    ctx.fillRect(chatX, chatY, chatW, 40);
    ctx.fillStyle = CONFIG.colors.neonCyan;
    ctx.font = `14px "${CONFIG.fonts.code.family}"`;
    ctx.fillText('NEURAL_INTERFACE > CONVERSATION_LOG', chatX + 15, chatY + 25);

    ctx.globalAlpha = 1;

    // Render chat messages
    let msgY = chatY + 60;
    for (let i = 0; i < this.visibleMessages.length; i++) {
      const msg = this.visibleMessages[i];
      const isAI = msg.from === 'ai';
      const bubbleX = isAI ? chatX + 20 : chatX + chatW - 20;
      const align = isAI ? 'left' : 'right';

      // Measure text
      ctx.font = `16px "${CONFIG.fonts.body?.family || 'Inter'}"`;
      const textWidth = ctx.measureText(msg.text).width;
      const bubbleW = Math.min(textWidth + 30, chatW * 0.7);
      const bx = isAI ? bubbleX : bubbleX - bubbleW;

      // Bubble background
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = isAI ? 'rgba(0,240,255,0.1)' : 'rgba(255,255,255,0.05)';
      ctx.beginPath();
      ctx.roundRect(bx, msgY, bubbleW, 36, 8);
      ctx.fill();

      // Bubble border
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = isAI ? CONFIG.colors.neonCyan : CONFIG.colors.mutedSteel;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Text
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = isAI ? CONFIG.colors.neonCyan : CONFIG.colors.ghostWhite;
      ctx.textAlign = 'left';
      ctx.fillText(msg.text, bx + 15, msgY + 22);

      // Sender label
      ctx.globalAlpha = 0.4;
      ctx.font = `10px "${CONFIG.fonts.code.family}"`;
      ctx.fillStyle = isAI ? CONFIG.colors.neonCyan : CONFIG.colors.mutedSteel;
      ctx.fillText(isAI ? 'AI-CORE' : 'HUMAN', bx + 15, msgY - 5);

      msgY += 55;
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'start';

    // Render effects
    this.hologram.render(ctx, 0.6);
    this.particles.render(ctx, CONFIG.colors.electricPurple, 0.3);
    this.textAnim.render(ctx, 1);
  }

  cleanup() { this.textAnim.clear(); this.hologram.clearPanels(); }
  resize(w, h) {
    this.width = w; this.height = h;
    this.particles.resize(w, h); this.hologram.resize(w, h);
    this.textAnim.resize(w, h);
  }
}
