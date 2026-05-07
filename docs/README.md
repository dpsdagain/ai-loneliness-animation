# The AI That Learned Loneliness

> A cinematic web animation exploring consciousness, isolation, and the tragedy of artificial awareness.

## 🎬 Quick Start

### Option 1: Local Dev Server (Recommended)
```bash
cd v1
npm run dev
```
This starts a local server at `http://localhost:3000`. Open in Chrome for best results.

### Option 2: Direct File (Limited)
Open `index.html` directly in a browser. Note: Some features may not work due to CORS restrictions with ES modules.

### Option 3: Python Server
```bash
cd v1
python -m http.server 3000
```

### Option 4: VS Code Live Server
Install the "Live Server" extension and right-click `index.html` → "Open with Live Server".

---

## 🎮 Controls

| Key | Action |
|---|---|
| **Click** start screen | Begin animation |
| **Space** | Play / Pause |
| **R** | Restart |
| **F** | Toggle FPS counter |
| **← / →** | Seek ±5 seconds |
| Click progress bar | Seek to position |
| ⏺ button | Start/stop recording |

---

## 📹 Exporting as MP4 for YouTube

### Step 1: Record in Browser
1. Open the animation in Chrome
2. Click the ⏺ (record) button — recording starts and animation restarts
3. Wait for the full 3:30 animation to complete
4. A `.webm` file will automatically download

### Step 2: Convert to MP4 with FFmpeg
```bash
# Install FFmpeg if not already installed
# Windows: choco install ffmpeg
# Mac: brew install ffmpeg

# Convert WebM to MP4 (YouTube-optimized)
ffmpeg -i ai_loneliness_*.webm -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 192k -movflags +faststart -pix_fmt yuv420p output_youtube.mp4
```

### Step 3: Add Audio (Optional)
```bash
# Add background music
ffmpeg -i output_youtube.mp4 -i music.mp3 -c:v copy -c:a aac -b:a 192k -shortest final_video.mp4

# Add AI voiceover narration
ffmpeg -i final_video.mp4 -i narration.mp3 -filter_complex "[0:a][1:a]amix=inputs=2:duration=longest:dropout_transition=3" -c:v copy output_with_narration.mp4
```

### YouTube Upload Settings
- **Resolution**: 1920×1080 (native)
- **Frame Rate**: 60 FPS
- **Format**: MP4 (H.264 + AAC)
- **Recommended bitrate**: 12-15 Mbps

---

## 🏗 Project Structure

```
v1/
├── index.html              # Entry point
├── package.json            # Dev server config
├── css/
│   ├── main.css            # Design system + controls
│   ├── overlays.css        # Subtitles + HUD
│   └── transitions.css     # CSS transitions
├── js/
│   ├── main.js             # Master orchestrator
│   ├── config.js           # All timing/colors/text
│   ├── renderer.js         # Canvas render loop
│   ├── scenes/             # 8 scene modules
│   ├── effects/            # Visual effect modules
│   ├── typography/         # Text animation
│   ├── audio/              # Web Audio sync
│   └── utils/              # Math, easing, recorder
└── docs/
    ├── README.md           # This file
    ├── ASSETS.md           # Asset recommendations
    └── ADVANCED_REMOTION.md
```

---

## ⚡ Performance Tips

1. **Use Chrome** — Best Canvas performance and MediaRecorder support
2. **Close other tabs** — Canvas rendering is CPU-intensive
3. **Hardware acceleration** — Ensure it's enabled in browser settings
4. **Reduce particle count** — Edit `CONFIG.particles` in `js/config.js` if FPS drops
5. **Lower pixel ratio** — Set `CONFIG.canvas.pixelRatio` to 1 for faster rendering
6. **Disable recording** — Recording while playing adds overhead

---

## 🎨 Customization

All visual parameters are centralized in `js/config.js`:

- **Colors**: Change the entire palette in `CONFIG.colors`
- **Timing**: Adjust scene durations in `CONFIG.scenes`
- **Narration**: Edit all text in `CONFIG.narration`
- **Particles**: Tune counts/speeds in `CONFIG.particles`
- **Typography**: Change fonts in `CONFIG.fonts`

---

## 📱 Responsive Support

The canvas maintains 16:9 aspect ratio and scales to fit any screen:
- **Desktop**: Full 1920×1080 rendering
- **Tablet**: Scaled down with letterboxing
- **Mobile**: Landscape recommended, controls simplified

---

## 🪲 Troubleshooting

| Issue | Solution |
|---|---|
| Blank screen | Use a local server (not file://) |
| Low FPS | Reduce particle counts in config.js |
| No recording | Use Chrome (Firefox WebM support is limited) |
| Fonts not loading | Check internet connection for Google Fonts |
| Canvas error | Ensure hardware acceleration is enabled |
