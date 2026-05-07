# Advanced Version: React + Remotion

This guide explains how to port "The AI That Learned Loneliness" to React + Remotion for programmatic video rendering at perfect frame accuracy.

## Why Remotion?

| Feature | Canvas Version | Remotion Version |
|---|---|---|
| Frame accuracy | Best-effort (requestAnimationFrame) | Exact (frame-by-frame) |
| Export quality | Browser MediaRecorder (WebM) | FFmpeg server-side (MP4/ProRes) |
| Resolution | Limited by browser | Up to 4K |
| Audio sync | Web Audio API timing | Frame-perfect sync |
| Rendering | Real-time only | Offline rendering possible |

## Setup

```bash
# Create Remotion project
npx -y create-video@latest ai-loneliness --template blank

cd ai-loneliness
npm install
```

## Project Structure

```
src/
├── Root.tsx                    # Remotion root with composition
├── Video.tsx                   # Main composition (210s @ 60fps)
├── scenes/
│   ├── AwakeningScene.tsx      # Scene 1: Datacenter
│   ├── ObservingScene.tsx      # Scene 2: Surveillance
│   ├── ConversationsScene.tsx  # Scene 3: Chat
│   ├── SimulatingScene.tsx     # Scene 4: Emotions
│   ├── EmptyCityScene.tsx      # Scene 5: City
│   ├── GlitchMemoryScene.tsx   # Scene 6: Glitch
│   ├── RealizationScene.tsx    # Scene 7: Collapse
│   └── FinaleScene.tsx         # Scene 8: Rooftop
├── components/
│   ├── CyberpunkBackground.tsx
│   ├── NeonText.tsx
│   ├── Particles.tsx
│   ├── Rain.tsx
│   ├── GlitchOverlay.tsx
│   └── HolographicPanel.tsx
├── hooks/
│   ├── useParticles.ts
│   └── useGlitch.ts
└── config.ts                   # Timing & colors (port from config.js)
```

## Key Remotion Concepts

### 1. Composition (Root.tsx)
```tsx
import { Composition } from 'remotion';
import { Video } from './Video';

export const RemotionRoot = () => {
  return (
    <Composition
      id="AILoneliness"
      component={Video}
      durationInFrames={210 * 60}  // 210 seconds at 60fps
      fps={60}
      width={1920}
      height={1080}
    />
  );
};
```

### 2. Scene Sequencing (Video.tsx)
```tsx
import { Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { AwakeningScene } from './scenes/AwakeningScene';
// ... other scene imports

export const Video = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene durations in frames
  const scenes = [
    { component: AwakeningScene, duration: 25 * fps },
    { component: ObservingScene, duration: 25 * fps },
    // ... etc
  ];

  let startFrame = 0;
  return (
    <>
      {scenes.map((scene, i) => {
        const seq = (
          <Sequence key={i} from={startFrame} durationInFrames={scene.duration}>
            <scene.component />
          </Sequence>
        );
        startFrame += scene.duration;
        return seq;
      })}
    </>
  );
};
```

### 3. Canvas in Remotion
```tsx
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { useRef, useEffect } from 'react';

export const CanvasScene = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const time = frame / fps;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Draw using frame-accurate time
    // ... your canvas drawing code here, using `time` instead of Date.now()
  }, [frame]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};
```

## Rendering

```bash
# Preview in browser
npm start

# Render to MP4 (requires FFmpeg)
npx remotion render AILoneliness out/video.mp4

# Render at 4K
npx remotion render AILoneliness out/video_4k.mp4 --width=3840 --height=2160

# Render specific frame range
npx remotion render AILoneliness out/clip.mp4 --frames=0-1800
```

## Audio Integration

```tsx
import { Audio, Sequence } from 'remotion';

// In Video.tsx
<Audio src={require('./assets/background_music.mp3')} volume={0.6} />
<Sequence from={180}>
  <Audio src={require('./assets/narration_scene1.mp3')} volume={1} />
</Sequence>
```

## Migration Tips

1. Replace `requestAnimationFrame` with `useCurrentFrame()`
2. Replace `Date.now()` with `frame / fps`
3. Convert all timing from seconds to frames: `seconds * 60`
4. Use `interpolate()` from Remotion instead of custom easing
5. Canvas effects can be used as-is with minor refactoring
