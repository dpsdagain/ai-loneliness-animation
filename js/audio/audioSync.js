/**
 * AUDIO SYNC — Web Audio API Timeline Synchronization
 * Handles music/SFX loading and sync with animation timeline
 */

export class AudioSync {
  constructor() {
    this.context = null;
    this.tracks = {};
    this.isReady = false;
    this.masterVolume = 0.7;
  }

  /** Initialize audio context (must be called from user gesture) */
  async init() {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = this.masterVolume;
    this.masterGain.connect(this.context.destination);
    this.isReady = true;
  }

  /** Load an audio track from URL */
  async loadTrack(name, url) {
    if (!this.context) await this.init();
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      this.tracks[name] = { buffer: audioBuffer, source: null, gain: null };
    } catch (e) {
      console.warn(`AudioSync: Failed to load track "${name}" from ${url}`, e);
    }
  }

  /** Play a loaded track */
  play(name, options = {}) {
    const track = this.tracks[name];
    if (!track || !this.context) return;

    const source = this.context.createBufferSource();
    source.buffer = track.buffer;
    source.loop = options.loop || false;

    const gainNode = this.context.createGain();
    gainNode.gain.value = options.volume || 1;
    source.connect(gainNode);
    gainNode.connect(this.masterGain);

    source.start(0, options.offset || 0);
    track.source = source;
    track.gain = gainNode;
  }

  /** Fade volume of a track over duration */
  fadeVolume(name, targetVolume, duration = 1) {
    const track = this.tracks[name];
    if (!track || !track.gain) return;
    track.gain.gain.linearRampToValueAtTime(
      targetVolume,
      this.context.currentTime + duration
    );
  }

  /** Stop a track */
  stop(name) {
    const track = this.tracks[name];
    if (track && track.source) {
      try { track.source.stop(); } catch (e) {}
    }
  }

  /** Get current audio time */
  getCurrentTime() {
    return this.context ? this.context.currentTime : 0;
  }

  /** Set master volume */
  setMasterVolume(value) {
    this.masterVolume = value;
    if (this.masterGain) this.masterGain.gain.value = value;
  }

  /** Suspend context (for pause) */
  suspend() { if (this.context) this.context.suspend(); }
  resume() { if (this.context) this.context.resume(); }
}
