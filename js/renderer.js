/**
 * RENDERER.JS — Canvas Rendering Pipeline
 * 
 * Manages the render loop, delta-time calculation, FPS monitoring,
 * and layer compositing for the animation.
 * 
 * Architecture:
 *   requestAnimationFrame loop → delta time calculation → scene update → scene render
 *   All rendering goes through a single canvas at 1920x1080 native resolution.
 */

import { CONFIG } from './config.js';

export class Renderer {
  /**
   * @param {HTMLCanvasElement} canvas - The main rendering canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false }); // No alpha for perf

    // Timing
    this.lastTime = 0;
    this.deltaTime = 0;
    this.elapsedTime = 0;
    this.isRunning = false;
    this.animFrameId = null;

    // FPS monitoring
    this.fps = 60;
    this.fpsFrames = 0;
    this.fpsTime = 0;
    this.showFPS = false;

    // Callbacks
    this.onUpdate = null;  // (dt, elapsed) => void
    this.onRender = null;  // (ctx, elapsed) => void

    // Set canvas to target resolution
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  /** Set canvas size maintaining 16:9 aspect ratio */
  _resize() {
    const dpr = CONFIG.canvas.pixelRatio;
    const targetW = CONFIG.canvas.width;
    const targetH = CONFIG.canvas.height;

    // CSS size = viewport fit
    const windowRatio = window.innerWidth / window.innerHeight;
    const targetRatio = targetW / targetH;

    if (windowRatio > targetRatio) {
      // Window is wider — fit to height
      this.canvas.style.height = '100vh';
      this.canvas.style.width = `${window.innerHeight * targetRatio}px`;
    } else {
      // Window is taller — fit to width
      this.canvas.style.width = '100vw';
      this.canvas.style.height = `${window.innerWidth / targetRatio}px`;
    }

    // Internal resolution
    this.canvas.width = targetW * dpr;
    this.canvas.height = targetH * dpr;
    this.ctx.scale(dpr, dpr);

    // Store logical dimensions
    this.width = targetW;
    this.height = targetH;
  }

  /** Start the render loop */
  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this._loop(this.lastTime);
  }

  /** Stop the render loop */
  stop() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  /** Pause (stop updating but keep frame) */
  pause() { this.isRunning = false; }

  /** Resume from pause */
  resume() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this._loop(this.lastTime);
    }
  }

  /** Core render loop */
  _loop(timestamp) {
    if (!this.isRunning) return;

    // Delta time in seconds, capped to prevent spiral of death
    this.deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;
    this.elapsedTime += this.deltaTime;

    // FPS calculation
    this.fpsFrames++;
    this.fpsTime += this.deltaTime;
    if (this.fpsTime >= 1) {
      this.fps = Math.round(this.fpsFrames / this.fpsTime);
      this.fpsFrames = 0;
      this.fpsTime = 0;
    }

    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Update callback
    if (this.onUpdate) {
      this.onUpdate(this.deltaTime, this.elapsedTime);
    }

    // Render callback
    if (this.onRender) {
      this.onRender(this.ctx, this.elapsedTime);
    }

    // FPS overlay (debug)
    if (this.showFPS) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.7;
      this.ctx.fillStyle = '#000';
      this.ctx.fillRect(10, 10, 80, 28);
      this.ctx.fillStyle = this.fps >= 55 ? '#0f0' : this.fps >= 30 ? '#ff0' : '#f00';
      this.ctx.font = '16px monospace';
      this.ctx.fillText(`${this.fps} FPS`, 18, 30);
      this.ctx.restore();
    }

    // Next frame
    this.animFrameId = requestAnimationFrame((t) => this._loop(t));
  }

  /** Get canvas dimensions */
  getSize() {
    return { width: this.width, height: this.height };
  }
}
