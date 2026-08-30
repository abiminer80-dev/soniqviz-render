const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const http = require('http');
const https = require('https');

const songTitle = process.env.INPUT_SONG_TITLE || 'Synthwave Odyssey';
const artistName = process.env.INPUT_ARTIST_NAME || 'Neon Horizon';
const audioUrl = process.env.INPUT_AUDIO_URL || '';
const aspectRatio = process.env.INPUT_ASPECT_RATIO || '16:9';
const resolution = process.env.INPUT_RESOLUTION || '1080p';
const fps = parseInt(process.env.INPUT_FPS || '60', 10);
const durationRequested = parseInt(process.env.INPUT_DURATION || '30', 10);

let width = 1920, height = 1080;
if (resolution === '4K') {
  width = aspectRatio === '9:16' ? 2160 : (aspectRatio === '1:1' ? 2160 : 3840);
  height = aspectRatio === '9:16' ? 3840 : (aspectRatio === '1:1' ? 2160 : 2160);
} else if (resolution === '720p') {
  width = aspectRatio === '9:16' ? 720 : (aspectRatio === '1:1' ? 720 : 1280);
  height = aspectRatio === '9:16' ? 1280 : (aspectRatio === '1:1' ? 720 : 720);
} else {
  width = aspectRatio === '9:16' ? 1080 : (aspectRatio === '1:1' ? 1080 : 1920);
  height = aspectRatio === '9:16' ? 1920 : (aspectRatio === '1:1' ? 1080 : 1080);
}

const outputDir = path.join(process.cwd(), 'output');
const tempDir = path.join(process.cwd(), 'temp_render');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const safeTitle = songTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
const outputMp4Path = path.join(outputDir, `${safeTitle}_${resolution}_${fps}fps_${aspectRatio.replace(':', 'x')}.mp4`);
const localAudioPath = path.join(tempDir, 'audio_input.mp3');

console.log(`🎬 Rendering ${songTitle} (${width}x${height} @ ${fps} FPS, ${durationRequested}s)...`);

// Generate audio synthesis
const synthFilter = "aevalsrc='0.22*sin(2*PI*110*t)+0.15*sin(2*PI*165*t)+0.12*sin(2*PI*220*t)+0.08*sin(2*PI*440*t)':s=44100:d=" + durationRequested;
execSync(`ffmpeg -y -f lavfi -i "${synthFilter}" -c:a aac -b:a 320k "${localAudioPath}"`, { stdio: 'inherit' });

// Render Visualizer with FFmpeg
const filterComplex = `
  [0:a]asplit=2[a_vis][a_out];
  [a_vis]showwaves=s=${width}x${height}:mode=cline:colors=#22d3ee@0.85|#a855f7@0.85|#38bdf8@0.95:rate=${fps}:scale=log[waves];
  [a_vis]showspectrum=s=${width}x${Math.round(height * 0.45)}:mode=combined:color=rainbow:slide=scroll:scale=log:saturation=2.5:win_func=hann[spec];
  color=c=#07080f:s=${width}x${height}:d=${durationRequested}[bg];
  [bg][spec]overlay=x=0:y=${Math.round(height * 0.55)}:format=auto[bg_spec];
  [bg_spec][waves]overlay=x=0:y=0:format=auto,
  drawtext=text='${songTitle.replace(/'/g, "\\'")}':fontcolor=white:fontsize=${Math.round(width * 0.032)}:x=${Math.round(width * 0.05)}:y=${Math.round(height * 0.08)}:shadowcolor=black@0.8:shadowx=3:shadowy=3,
  drawtext=text='${artistName.replace(/'/g, "\\'")}':fontcolor=#22d3ee:fontsize=${Math.round(width * 0.018)}:x=${Math.round(width * 0.05)}:y=${Math.round(height * 0.135)}:shadowcolor=black@0.8:shadowx=2:shadowy=2,
  drawtext=text='SONIQVIZ GITHUB CLOUD RENDER':fontcolor=white@0.4:fontsize=${Math.round(width * 0.012)}:x=${Math.round(width * 0.05)}:y=${Math.round(height * 0.94)}
  [v_out]
`.replace(/\s+/g, ' ').trim();

const ffmpegCmd = [
  '-y',
  '-i', localAudioPath,
  '-filter_complex', filterComplex,
  '-map', '[v_out]',
  '-map', '[a_out]',
  '-t', String(durationRequested),
  '-c:v', 'libx264',
  '-preset', 'medium',
  '-crf', '18',
  '-pix_fmt', 'yuv420p',
  '-c:a', 'aac',
  '-b:a', '320k',
  '-movflags', '+faststart',
  outputMp4Path
];

const proc = spawn('ffmpeg', ffmpegCmd, { stdio: 'inherit' });
proc.on('close', (code) => {
  if (code === 0) {
    console.log(`✅ MP4 Generated: ${outputMp4Path}`);
    process.exit(0);
  } else {
    process.exit(code);
  }
});
