/**
 * RECORDER.JS — MediaRecorder API for MP4/WebM Export
 * Captures canvas stream and saves as downloadable video
 */

export class CanvasRecorder {
  constructor(canvas, fps = 60) {
    this.canvas = canvas;
    this.fps = fps;
    this.recorder = null;
    this.chunks = [];
    this.isRecording = false;
  }

  /** Start recording the canvas */
  start() {
    this.chunks = [];
    const stream = this.canvas.captureStream(this.fps);

    // Prefer WebM VP9 for quality, fallback to VP8
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm;codecs=vp8';

    this.recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 15000000, // 15 Mbps for high quality
    });

    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };

    this.recorder.onstop = () => this._save();

    this.recorder.start(1000); // Collect data every 1 second
    this.isRecording = true;
    console.log('🎬 Recording started');
  }

  /** Stop recording and trigger download */
  stop() {
    if (this.recorder && this.isRecording) {
      this.recorder.stop();
      this.isRecording = false;
      console.log('🎬 Recording stopped');
    }
  }

  /** Save recorded chunks as downloadable file */
  _save() {
    const blob = new Blob(this.chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai_loneliness_${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
    console.log('💾 Video saved');
  }
}
