/**
 * NEURAL.JS — Neural Network Visualization
 * Animated interconnected nodes simulating brain/AI neural pathways
 */

import { randomRange, dist, pulse } from '../utils/math.js';
import { CONFIG } from '../config.js';

export class NeuralEffect {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.nodes = [];
    this.connections = [];
    this.intensity = 0;
    this.pulseNodes = [];  // Nodes currently "firing"
    this._initNetwork();
  }

  _initNetwork() {
    const count = CONFIG.particles.neural.count;
    this.nodes = [];
    for (let i = 0; i < count; i++) {
      this.nodes.push({
        x: randomRange(this.width * 0.1, this.width * 0.9),
        y: randomRange(this.height * 0.1, this.height * 0.9),
        baseX: 0, baseY: 0,
        radius: randomRange(2, 5),
        energy: 0,
        phase: randomRange(0, Math.PI * 2),
      });
      this.nodes[i].baseX = this.nodes[i].x;
      this.nodes[i].baseY = this.nodes[i].y;
    }

    // Create connections between nearby nodes
    this.connections = [];
    const maxDist = 250;
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const d = dist(this.nodes[i].x, this.nodes[i].y, this.nodes[j].x, this.nodes[j].y);
        if (d < maxDist) {
          this.connections.push({ from: i, to: j, dist: d, energy: 0 });
        }
      }
    }
  }

  update(dt, time) {
    // Oscillate nodes gently
    for (const node of this.nodes) {
      node.x = node.baseX + Math.sin(time * 0.3 + node.phase) * 8;
      node.y = node.baseY + Math.cos(time * 0.2 + node.phase) * 6;
      node.energy *= 0.95; // Decay energy
    }

    // Periodically fire a random node
    if (Math.random() < 0.05 * this.intensity) {
      const idx = Math.floor(Math.random() * this.nodes.length);
      this.nodes[idx].energy = 1;
      // Propagate to connected nodes
      for (const conn of this.connections) {
        if (conn.from === idx || conn.to === idx) {
          const other = conn.from === idx ? conn.to : conn.from;
          this.nodes[other].energy = Math.max(this.nodes[other].energy, 0.6);
          conn.energy = 1;
        }
      }
    }

    // Decay connection energy
    for (const conn of this.connections) {
      conn.energy *= 0.92;
    }
  }

  render(ctx, globalAlpha = 1) {
    if (this.intensity < 0.01) return;
    ctx.save();

    // Draw connections
    for (const conn of this.connections) {
      const a = this.nodes[conn.from];
      const b = this.nodes[conn.to];
      const alpha = (0.05 + conn.energy * 0.4) * this.intensity * globalAlpha;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = conn.energy > 0.1 ? CONFIG.colors.neonCyan : CONFIG.colors.mutedSteel;
      ctx.lineWidth = 0.5 + conn.energy;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    // Draw nodes
    for (const node of this.nodes) {
      const alpha = (0.2 + node.energy * 0.8) * this.intensity * globalAlpha;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = node.energy > 0.3 ? CONFIG.colors.neonCyan : CONFIG.colors.hologramBlue;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + node.energy * 3, 0, Math.PI * 2);
      ctx.fill();

      // Glow
      if (node.energy > 0.2) {
        ctx.globalAlpha = alpha * 0.3;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 4 + node.energy * 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  setIntensity(value) { this.intensity = value; }
  resize(width, height) {
    this.width = width;
    this.height = height;
    this._initNetwork();
  }
}
