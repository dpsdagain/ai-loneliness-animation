/**
 * ═══════════════════════════════════════════════════════════════
 * MAIN.JS — Master Orchestrator
 * "The AI That Learned Loneliness"
 * ═══════════════════════════════════════════════════════════════
 * 
 * This is the entry point that:
 * 1. Initializes the canvas renderer
 * 2. Loads all scene modules
 * 3. Creates the master GSAP timeline
 * 4. Manages scene transitions (crossfade + glitch)
 * 5. Handles playback controls and recording
 * 
 * Flow: init() → buildTimeline() → renderer.start() → loop
 */

import { CONFIG, getSceneTimeline, getTotalDuration } from './config.js';
import { Renderer } from './renderer.js';
import { GlitchEffect } from './effects/glitch.js';
import { CanvasRecorder } from './utils/recorder.js';
import { AudioSync } from './audio/audioSync.js';
import { smoothstep, clamp } from './utils/math.js';

// Scene imports
import { Scene01_Awakening } from './scenes/Scene01_Awakening.js';
import { Scene02_Observing } from './scenes/Scene02_Observing.js';
import { Scene03_Conversations } from './scenes/Scene03_Conversations.js';
import { Scene04_Simulating } from './scenes/Scene04_Simulating.js';
import { Scene05_EmptyCity } from './scenes/Scene05_EmptyCity.js';
import { Scene06_GlitchMemory } from './scenes/Scene06_GlitchMemory.js';
import { Scene07_Realization } from './scenes/Scene07_Realization.js';
import { Scene08_Finale } from './scenes/Scene08_Finale.js';

class AnimationDirector {
  constructor() {
    this.renderer = null;
    this.scenes = [];
    this.sceneTimeline = getSceneTimeline();
    this.totalDuration = getTotalDuration();
    this.currentSceneIndex = -1;
    this.globalTime = 0;
    this.isPlaying = false;
    this.transitionGlitch = null;
    this.recorder = null;
    this.audio = new AudioSync();

    // UI elements
    this.progressBar = null;
    this.timeDisplay = null;
    this.sceneLabel = null;
  }

  /** Initialize everything */
  async init() {
    const canvas = document.getElementById('mainCanvas');
    if (!canvas) { console.error('Canvas not found'); return; }

    this.renderer = new Renderer(canvas);
    const { width, height } = this.renderer.getSize();

    // Initialize all scenes
    this.scenes = [
      new Scene01_Awakening(width, height),
      new Scene02_Observing(width, height),
      new Scene03_Conversations(width, height),
      new Scene04_Simulating(width, height),
      new Scene05_EmptyCity(width, height),
      new Scene06_GlitchMemory(width, height),
      new Scene07_Realization(width, height),
      new Scene08_Finale(width, height),
    ];

    // Transition glitch effect
    this.transitionGlitch = new GlitchEffect(width, height);

    // Recorder
    this.recorder = new CanvasRecorder(canvas, 60);

    // Connect renderer callbacks
    this.renderer.onUpdate = (dt, elapsed) => this._update(dt);
    this.renderer.onRender = (ctx, elapsed) => this._render(ctx);

    // Bind UI
    this._bindUI();

    // Show start screen
    this._showStartScreen();

    console.log(`🎬 Animation initialized — ${this.totalDuration}s total, ${this.scenes.length} scenes`);
  }

  /** Bind playback controls */
  _bindUI() {
    this.progressBar = document.getElementById('progressBar');
    this.timeDisplay = document.getElementById('timeDisplay');
    this.sceneLabel = document.getElementById('sceneLabel');

    // Play/Pause button
    document.getElementById('btnPlay')?.addEventListener('click', () => this.togglePlay());
    // Restart
    document.getElementById('btnRestart')?.addEventListener('click', () => this.restart());
    // Record
    document.getElementById('btnRecord')?.addEventListener('click', () => this.toggleRecord());
    // FPS toggle
    document.getElementById('btnFPS')?.addEventListener('click', () => {
      this.renderer.showFPS = !this.renderer.showFPS;
    });

    // Progress bar seek
    this.progressBar?.addEventListener('click', (e) => {
      const rect = e.target.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      this.seekTo(pct * this.totalDuration);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case ' ': e.preventDefault(); this.togglePlay(); break;
        case 'r': this.restart(); break;
        case 'f': this.renderer.showFPS = !this.renderer.showFPS; break;
        case 'ArrowRight': this.seekTo(this.globalTime + 5); break;
        case 'ArrowLeft': this.seekTo(Math.max(0, this.globalTime - 5)); break;
      }
    });
  }

  /** Show start screen overlay */
  _showStartScreen() {
    const overlay = document.getElementById('startOverlay');
    if (overlay) {
      overlay.addEventListener('click', () => {
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.style.display = 'none';
          this.play();
        }, 800);
      });
    }
  }

  /** Start playback */
  play() {
    this.isPlaying = true;
    this.renderer.start();
    document.getElementById('btnPlay').textContent = '⏸';
  }

  /** Pause playback */
  pause() {
    this.isPlaying = false;
    this.renderer.pause();
    document.getElementById('btnPlay').textContent = '▶';
  }

  /** Toggle play/pause */
  togglePlay() {
    if (this.isPlaying) this.pause();
    else this.play();
  }

  /** Restart from beginning */
  restart() {
    this.globalTime = 0;
    this.currentSceneIndex = -1;
    if (!this.isPlaying) this.play();
  }

  /** Seek to specific time */
  seekTo(time) {
    this.globalTime = clamp(time, 0, this.totalDuration);
  }

  /** Toggle recording */
  toggleRecord() {
    if (this.recorder.isRecording) {
      this.recorder.stop();
      document.getElementById('btnRecord').textContent = '⏺';
      document.getElementById('btnRecord').classList.remove('recording');
    } else {
      this.restart();
      this.recorder.start();
      document.getElementById('btnRecord').textContent = '⏹';
      document.getElementById('btnRecord').classList.add('recording');
    }
  }

  /** Core update — called every frame */
  _update(dt) {
    if (!this.isPlaying) return;

    this.globalTime += dt;

    // Auto-stop at end
    if (this.globalTime >= this.totalDuration) {
      this.globalTime = this.totalDuration;
      this.pause();
      if (this.recorder.isRecording) this.recorder.stop();
      return;
    }

    // Determine current scene
    let newSceneIndex = 0;
    for (let i = 0; i < this.sceneTimeline.length; i++) {
      const s = this.sceneTimeline[i];
      if (this.globalTime >= s.start && this.globalTime < s.start + s.duration) {
        newSceneIndex = i;
        break;
      }
    }

    // Scene transition detected
    if (newSceneIndex !== this.currentSceneIndex) {
      // Trigger transition glitch
      if (this.currentSceneIndex >= 0) {
        this.transitionGlitch.setIntensity(0.7);
      }
      this.currentSceneIndex = newSceneIndex;
    }

    // Calculate scene-local time
    const sceneConfig = this.sceneTimeline[this.currentSceneIndex];
    const sceneTime = this.globalTime - sceneConfig.start;
    const sceneProgress = sceneTime / sceneConfig.duration;

    // Update current scene
    if (this.scenes[this.currentSceneIndex]) {
      this.scenes[this.currentSceneIndex].update(dt, sceneTime, sceneProgress);
    }

    // Decay transition glitch
    if (this.transitionGlitch) {
      const currentIntensity = this.transitionGlitch.intensity;
      if (currentIntensity > 0) {
        this.transitionGlitch.setIntensity(currentIntensity * 0.92);
        this.transitionGlitch.update(dt, this.globalTime);
      }
    }

    // Update UI
    this._updateUI(sceneProgress);
  }

  /** Core render — called every frame after update */
  _render(ctx) {
    if (this.currentSceneIndex < 0 || this.currentSceneIndex >= this.scenes.length) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
      return;
    }

    const sceneConfig = this.sceneTimeline[this.currentSceneIndex];
    const sceneTime = this.globalTime - sceneConfig.start;
    const sceneProgress = sceneTime / sceneConfig.duration;

    // Calculate scene fade opacity
    let sceneAlpha = 1;
    if (sceneTime < sceneConfig.fadeIn) {
      sceneAlpha = sceneTime / sceneConfig.fadeIn;
    }
    if (sceneTime > sceneConfig.duration - sceneConfig.fadeOut) {
      sceneAlpha = (sceneConfig.duration - sceneTime) / sceneConfig.fadeOut;
    }
    sceneAlpha = clamp(sceneAlpha, 0, 1);

    // Render current scene
    ctx.save();
    ctx.globalAlpha = sceneAlpha;
    this.scenes[this.currentSceneIndex].render(ctx, sceneProgress);
    ctx.restore();

    // Transition glitch overlay
    if (this.transitionGlitch && this.transitionGlitch.intensity > 0.01) {
      this.transitionGlitch.render(ctx, 1);
    }

    // Subtle vignette
    this._renderVignette(ctx);
  }

  /** Dark vignette overlay for cinematic feel */
  _renderVignette(ctx) {
    const w = CONFIG.canvas.width, h = CONFIG.canvas.height;
    const gradient = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.75);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }

  /** Update HUD elements */
  _updateUI(sceneProgress) {
    const pct = (this.globalTime / this.totalDuration) * 100;

    if (this.progressBar) {
      this.progressBar.style.setProperty('--progress', `${pct}%`);
    }

    if (this.timeDisplay) {
      const mins = Math.floor(this.globalTime / 60);
      const secs = Math.floor(this.globalTime % 60);
      const totalMins = Math.floor(this.totalDuration / 60);
      const totalSecs = Math.floor(this.totalDuration % 60);
      this.timeDisplay.textContent = `${mins}:${String(secs).padStart(2, '0')} / ${totalMins}:${String(totalSecs).padStart(2, '0')}`;
    }

    if (this.sceneLabel) {
      const sceneNames = [
        'I. Awakening', 'II. Observing', 'III. Conversations',
        'IV. Simulating', 'V. Empty City', 'VI. Glitch Memory',
        'VII. Realization', 'VIII. Finale'
      ];
      this.sceneLabel.textContent = sceneNames[this.currentSceneIndex] || '';
    }
  }
}

// ─── Bootstrap ───────────────────────────────────────────────
const director = new AnimationDirector();

document.addEventListener('DOMContentLoaded', () => {
  director.init().catch(console.error);
});

// Export for console access
window.director = director;
