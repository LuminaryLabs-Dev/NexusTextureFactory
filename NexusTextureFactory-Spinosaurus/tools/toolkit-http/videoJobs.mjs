import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { pushToolkitLog } from './state.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOLKIT_PREVIEW_OUTPUT_DIR = path.resolve(__dirname, '../../toolkit-output/preview-videos');
const TOOLKIT_CAPTURE_OUTPUT_DIR = path.join(os.homedir(), 'Downloads', 'NexusTextureFactory');
const TOOLKIT_CAPTURE_REVIEW_DIR = path.join(TOOLKIT_CAPTURE_OUTPUT_DIR, 'review-frames');
const TOOLKIT_VIDEO_TEMP_DIR = path.join(os.tmpdir(), 'nexus-texture-factory-video');
const JPEG_FRAME_PATTERN = 'frame_%06d.jpg';
let ffmpegInfoCache = null;
let ffprobeInfoCache = null;

function sanitizeOutputName(value = 'preview.mp4') {
  const trimmed = String(value || 'preview.mp4').trim() || 'preview.mp4';
  const normalized = trimmed.replace(/[<>:"/\\|?*\u0000-\u001F]+/g, '-').replace(/\s+/g, '-');
  return normalized.toLowerCase().endsWith('.mp4') ? normalized : `${normalized}.mp4`;
}

function sanitizeStem(value = 'capture-review') {
  const trimmed = String(value || 'capture-review').trim() || 'capture-review';
  const normalized = trimmed.replace(/[<>:"/\\|?*\u0000-\u001F]+/g, '-').replace(/\s+/g, '-');
  return normalized.replace(/\.mp4$/i, '') || 'capture-review';
}

function serializeJob(job) {
  if (!job) return null;
  return {
    jobId: job.jobId,
    scope: job.scope,
    status: job.status,
    expectedFrames: job.expectedFrames,
    receivedFrames: job.receivedFrames,
    encodedFrames: job.encodedFrames,
    fps: job.fps,
    width: job.width,
    height: job.height,
    durationSeconds: job.durationSeconds,
    outputName: job.outputName,
    outputPath: job.outputPath,
    frameDir: job.framesDir,
    tempDir: job.tempDir,
    framePattern: JPEG_FRAME_PATTERN,
    startedAt: job.startedAt,
    updatedAt: job.updatedAt,
    completedAt: job.completedAt || null,
    canceledAt: job.canceledAt || null,
    error: job.error || '',
    ffmpegPath: job.ffmpegPath || '',
    ffmpegCommand: job.ffmpegCommand || [],
    metadata: job.metadata || {}
  };
}

function ensureVideoState(state, scope) {
  const stateKey = scope === 'capture' ? 'captureVideo' : 'previewVideo';
  if (!state[stateKey]) {
    state[stateKey] = { jobs: new Map() };
  }
  if (!(state[stateKey].jobs instanceof Map)) {
    state[stateKey].jobs = new Map();
  }
  return state[stateKey];
}

export function getFfmpegInfo() {
  if (ffmpegInfoCache) return ffmpegInfoCache;
  const lookup = spawnSync('which', ['ffmpeg'], { encoding: 'utf8' });
  const ffmpegPath = lookup.status === 0 ? String(lookup.stdout || '').trim() : '';
  if (!ffmpegPath) {
    ffmpegInfoCache = {
      available: false,
      path: '',
      version: '',
      error: 'ffmpeg not found on PATH.'
    };
    return ffmpegInfoCache;
  }
  const versionProbe = spawnSync(ffmpegPath, ['-version'], { encoding: 'utf8' });
  const versionLine = String(versionProbe.stdout || '').split('\n').find((line) => line.toLowerCase().startsWith('ffmpeg version')) || '';
  ffmpegInfoCache = {
    available: versionProbe.status === 0,
    path: ffmpegPath,
    version: versionLine.trim(),
    error: versionProbe.status === 0 ? '' : (String(versionProbe.stderr || '').trim() || 'ffmpeg version probe failed.')
  };
  return ffmpegInfoCache;
}

function getFfprobeInfo() {
  if (ffprobeInfoCache) return ffprobeInfoCache;
  const lookup = spawnSync('which', ['ffprobe'], { encoding: 'utf8' });
  const ffprobePath = lookup.status === 0 ? String(lookup.stdout || '').trim() : '';
  if (!ffprobePath) {
    ffprobeInfoCache = {
      available: false,
      path: '',
      error: 'ffprobe not found on PATH.'
    };
    return ffprobeInfoCache;
  }
  ffprobeInfoCache = {
    available: true,
    path: ffprobePath,
    error: ''
  };
  return ffprobeInfoCache;
}

async function ensureDirs(scope = 'preview') {
  await fs.mkdir(TOOLKIT_VIDEO_TEMP_DIR, { recursive: true });
  if (scope === 'capture') {
    await fs.mkdir(TOOLKIT_CAPTURE_OUTPUT_DIR, { recursive: true });
    await fs.mkdir(TOOLKIT_CAPTURE_REVIEW_DIR, { recursive: true });
  } else {
    await fs.mkdir(TOOLKIT_PREVIEW_OUTPUT_DIR, { recursive: true });
  }
}

function getJob(state, scope, jobId) {
  const videoState = ensureVideoState(state, scope);
  const job = videoState.jobs.get(String(jobId || ''));
  if (!job) throw new Error(`Unknown ${scope} video job: ${jobId}`);
  return job;
}

function markJob(job, patch = {}) {
  Object.assign(job, patch, { updatedAt: new Date().toISOString() });
  return job;
}

async function cleanupDirectory(targetDir) {
  if (!targetDir) return;
  await fs.rm(targetDir, { recursive: true, force: true });
}

function getOutputRootForScope(scope) {
  return scope === 'capture' ? TOOLKIT_CAPTURE_OUTPUT_DIR : TOOLKIT_PREVIEW_OUTPUT_DIR;
}

async function startVideoJob(state, scope, payload = {}) {
  const ffmpeg = getFfmpegInfo();
  if (!ffmpeg.available) throw new Error(ffmpeg.error || 'ffmpeg is not available.');
  const expectedFrames = Math.max(1, Math.round(Number(payload.expectedFrames) || Number(payload.durationSeconds || 0) * Number(payload.fps || 0)));
  const fps = Math.max(1, Math.round(Number(payload.fps) || 30));
  const width = Math.max(64, Math.round(Number(payload.width) || 1280));
  const height = Math.max(64, Math.round(Number(payload.height) || 720));
  const durationSeconds = Math.max(0.1, Number(payload.durationSeconds) || (expectedFrames / fps));
  const jobId = randomUUID();
  const tempDir = path.join(TOOLKIT_VIDEO_TEMP_DIR, `${scope}-${jobId}`);
  const framesDir = path.join(tempDir, 'frames');
  const outputRoot = getOutputRootForScope(scope);
  await ensureDirs(scope);
  await fs.mkdir(framesDir, { recursive: true });
  const outputName = sanitizeOutputName(payload.outputName || `${scope}.mp4`);
  const outputPath = path.join(outputRoot, outputName);
  const job = {
    jobId,
    scope,
    status: 'receiving_frames',
    expectedFrames,
    receivedFrames: 0,
    encodedFrames: 0,
    fps,
    width,
    height,
    durationSeconds,
    outputName,
    outputPath,
    tempDir,
    framesDir,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
    canceledAt: null,
    error: '',
    ffmpegPath: ffmpeg.path,
    ffmpegCommand: [],
    process: null,
    metadata: payload.metadata && typeof payload.metadata === 'object' ? payload.metadata : {}
  };
  ensureVideoState(state, scope).jobs.set(jobId, job);
  pushToolkitLog(state, {
    type: `${scope}_video_start`,
    job_id: jobId,
    output_path: outputPath,
    expected_frames: expectedFrames
  });
  return {
    ok: true,
    status: job.status,
    job: serializeJob(job)
  };
}

async function appendVideoFrame(state, scope, jobId, frameIndex, buffer) {
  const job = getJob(state, scope, jobId);
  if (job.status !== 'receiving_frames') {
    throw new Error(`${scope} video job ${jobId} is not accepting frames.`);
  }
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error('Frame payload must be a non-empty JPEG buffer.');
  }
  const safeFrameIndex = Math.max(0, Math.round(Number(frameIndex) || 0));
  const filePath = path.join(job.framesDir, `frame_${String(safeFrameIndex).padStart(6, '0')}.jpg`);
  await fs.writeFile(filePath, buffer);
  if (safeFrameIndex + 1 > job.receivedFrames) {
    job.receivedFrames = safeFrameIndex + 1;
  }
  markJob(job);
  return {
    ok: true,
    status: job.status,
    job: serializeJob(job)
  };
}

async function finalizeVideoJob(state, scope, jobId) {
  const job = getJob(state, scope, jobId);
  if (job.status === 'completed' || job.status === 'encoding') {
    return { ok: true, status: job.status, job: serializeJob(job) };
  }
  if (job.status !== 'receiving_frames') {
    throw new Error(`${scope} video job ${jobId} cannot be finalized from status ${job.status}.`);
  }
  if (job.receivedFrames < job.expectedFrames) {
    throw new Error(`${scope} video job ${jobId} is incomplete: received ${job.receivedFrames}/${job.expectedFrames} frames.`);
  }

  const ffmpeg = getFfmpegInfo();
  if (!ffmpeg.available) throw new Error(ffmpeg.error || 'ffmpeg is not available.');
  const command = [
    '-y',
    '-framerate', String(job.fps),
    '-i', path.join(job.framesDir, JPEG_FRAME_PATTERN),
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'medium',
    '-crf', '18',
    '-movflags', '+faststart',
    job.outputPath
  ];
  markJob(job, {
    status: 'encoding',
    ffmpegCommand: [ffmpeg.path, ...command],
    error: ''
  });

  await new Promise((resolve) => {
    const child = spawn(ffmpeg.path, command, { stdio: ['ignore', 'pipe', 'pipe'] });
    job.process = child;
    let stderr = '';
    child.stdout.on('data', () => {});
    child.stderr.on('data', (chunk) => {
      stderr += String(chunk || '');
      const match = /frame=\s*(\d+)/.exec(stderr.slice(-400));
      if (match) {
        job.encodedFrames = Math.max(job.encodedFrames, Number(match[1]) || 0);
        job.updatedAt = new Date().toISOString();
      }
    });
    child.on('close', async (code) => {
      job.process = null;
      if (job.status === 'canceled') {
        await cleanupDirectory(job.tempDir);
        resolve();
        return;
      }
      if (code === 0) {
        markJob(job, {
          status: 'completed',
          encodedFrames: job.expectedFrames,
          completedAt: new Date().toISOString(),
          error: ''
        });
        await cleanupDirectory(job.tempDir);
      } else {
        markJob(job, {
          status: 'error',
          error: stderr.trim() || `ffmpeg exited with code ${code}.`
        });
      }
      pushToolkitLog(state, {
        type: `${scope}_video_finalize`,
        job_id: job.jobId,
        status: job.status,
        output_path: job.outputPath
      });
      resolve();
    });
    child.on('error', async (error) => {
      job.process = null;
      markJob(job, {
        status: 'error',
        error: error?.message || 'Failed to start ffmpeg.'
      });
      resolve();
    });
  });

  return {
    ok: true,
    status: job.status,
    job: serializeJob(job)
  };
}

function getVideoStatus(state, scope, jobId) {
  const job = getJob(state, scope, jobId);
  return {
    ok: true,
    status: job.status,
    job: serializeJob(job)
  };
}

async function cancelVideoJob(state, scope, jobId) {
  const job = getJob(state, scope, jobId);
  if (job.status === 'completed' || job.status === 'canceled') {
    return {
      ok: true,
      status: job.status,
      job: serializeJob(job)
    };
  }
  markJob(job, {
    status: 'canceled',
    canceledAt: new Date().toISOString(),
    error: ''
  });
  if (job.process) {
    job.process.kill('SIGTERM');
  } else {
    await cleanupDirectory(job.tempDir);
  }
  pushToolkitLog(state, {
    type: `${scope}_video_cancel`,
    job_id: job.jobId
  });
  return {
    ok: true,
    status: job.status,
    job: serializeJob(job)
  };
}

async function getMediaDurationSeconds(filePath) {
  const ffprobe = getFfprobeInfo();
  if (!ffprobe.available) return 0;
  const probe = spawnSync(ffprobe.path, [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    filePath
  ], { encoding: 'utf8' });
  if (probe.status !== 0) return 0;
  const value = Number.parseFloat(String(probe.stdout || '').trim());
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function detectBlackVideoFrames(outputPath) {
  const ffmpeg = getFfmpegInfo();
  if (!ffmpeg.available) return { available: false, blackFrames: [] };
  const result = spawnSync(ffmpeg.path, [
    '-hide_banner',
    '-i', outputPath,
    '-vf', 'blackframe=amount=98:threshold=32',
    '-an',
    '-f', 'null',
    '-'
  ], { encoding: 'utf8' });
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  const blackFrames = [];
  const linePattern = /frame:(\d+)\s+pblack:(\d+)\s+pts:[^\s]+\s+t:(\d+(?:\.\d+)?)/g;
  let match = null;
  while ((match = linePattern.exec(output))) {
    blackFrames.push({
      frame: Number.parseInt(match[1], 10),
      pblack: Number.parseInt(match[2], 10),
      timeSeconds: Number.parseFloat(match[3])
    });
  }
  return {
    available: true,
    blackFrames
  };
}

function summarizeCaptureReview({ outputPath, timestamps, metadata, issues }) {
  const filename = path.basename(outputPath);
  const setLabel = metadata?.setName ? ` for set "${metadata.setName}"` : '';
  const presetLabel = metadata?.presetName ? ` using preset "${metadata.presetName}"` : '';
  const frameLabel = timestamps.length ? `${timestamps.length} extracted review frame${timestamps.length === 1 ? '' : 's'}` : 'no extracted frames';
  const issueLabel = issues.length ? ` Issues flagged: ${issues.join(' ')}` : ' No obvious extraction failures were detected.';
  return `Capture review ready for ${filename}${setLabel}${presetLabel}. ${frameLabel} span the saved MP4 for manual visual inspection.${issueLabel}`;
}

export async function reviewCaptureVideo(state, payload = {}) {
  const ffmpeg = getFfmpegInfo();
  if (!ffmpeg.available) throw new Error(ffmpeg.error || 'ffmpeg is not available.');
  const outputPath = path.resolve(String(payload.outputPath || '').trim());
  if (!outputPath) throw new Error('Capture review requires an outputPath.');
  await fs.access(outputPath);
  await ensureDirs('capture');
  const stem = sanitizeStem(path.basename(outputPath));
  const frameDir = path.join(TOOLKIT_CAPTURE_REVIEW_DIR, stem);
  await cleanupDirectory(frameDir);
  await fs.mkdir(frameDir, { recursive: true });

  const durationSeconds = await getMediaDurationSeconds(outputPath);
  const requestedCount = Math.max(1, Math.min(12, Math.round(Number(payload.frameCount) || 5)));
  const timestamps = durationSeconds > 0
    ? Array.from({ length: requestedCount }, (_, index) => Number((((index + 1) / (requestedCount + 1)) * durationSeconds).toFixed(3)))
    : [0];
  const reviewFrames = [];
  const issues = [];

  for (let index = 0; index < timestamps.length; index++) {
    const timestampSeconds = timestamps[index];
    const filePath = path.join(frameDir, `review_${String(index + 1).padStart(2, '0')}.jpg`);
    const command = [
      '-y',
      '-ss', String(timestampSeconds),
      '-i', outputPath,
      '-frames:v', '1',
      '-q:v', '2',
      filePath
    ];
    const result = spawnSync(ffmpeg.path, command, { encoding: 'utf8' });
    if (result.status !== 0) {
      issues.push(`Frame extraction failed at ${timestampSeconds.toFixed(2)}s.`);
      continue;
    }
    try {
      await fs.access(filePath);
    } catch (error) {
      issues.push(`Frame extraction produced no file at ${timestampSeconds.toFixed(2)}s.`);
      continue;
    }
    reviewFrames.push({
      index,
      timestampSeconds,
      filePath
    });
  }

  if (!reviewFrames.length) {
    issues.push('No review frames were extracted from the saved MP4.');
  }
  if (reviewFrames.length < timestamps.length) {
    issues.push(`Only ${reviewFrames.length} of ${timestamps.length} requested review frames were extracted.`);
  }

  const blackframeResult = detectBlackVideoFrames(outputPath);
  if (blackframeResult.available && blackframeResult.blackFrames.length) {
    const blackCount = blackframeResult.blackFrames.length;
    const firstBlackTime = blackframeResult.blackFrames[0]?.timeSeconds;
    issues.push(`Video contains ${blackCount} mostly black frame${blackCount === 1 ? '' : 's'}${Number.isFinite(firstBlackTime) ? ` beginning around ${firstBlackTime.toFixed(2)}s` : ''}.`);
  }

  const reviewSummary = summarizeCaptureReview({
    outputPath,
    timestamps: reviewFrames.map((entry) => entry.timestampSeconds),
    metadata: payload.metadata || {},
    issues
  });

  pushToolkitLog(state, {
    type: 'capture_video_review',
    output_path: outputPath,
    frame_dir: frameDir,
    extracted_frames: reviewFrames.length
  });

  return {
    ok: true,
    status: reviewFrames.length ? 'completed' : 'error',
    outputPath,
    frameDir,
    reviewSummary,
    reviewFrames,
    timestamps: reviewFrames.map((entry) => entry.timestampSeconds),
    issues
  };
}

export async function startPreviewVideoJob(state, payload = {}) {
  return startVideoJob(state, 'preview', payload);
}

export async function appendPreviewVideoFrame(state, jobId, frameIndex, buffer) {
  return appendVideoFrame(state, 'preview', jobId, frameIndex, buffer);
}

export async function finalizePreviewVideoJob(state, jobId) {
  return finalizeVideoJob(state, 'preview', jobId);
}

export function getPreviewVideoStatus(state, jobId) {
  return getVideoStatus(state, 'preview', jobId);
}

export async function cancelPreviewVideoJob(state, jobId) {
  return cancelVideoJob(state, 'preview', jobId);
}

export async function startCaptureVideoJob(state, payload = {}) {
  return startVideoJob(state, 'capture', payload);
}

export async function appendCaptureVideoFrame(state, jobId, frameIndex, buffer) {
  return appendVideoFrame(state, 'capture', jobId, frameIndex, buffer);
}

export async function finalizeCaptureVideoJob(state, jobId) {
  return finalizeVideoJob(state, 'capture', jobId);
}

export function getCaptureVideoStatus(state, jobId) {
  return getVideoStatus(state, 'capture', jobId);
}

export async function cancelCaptureVideoJob(state, jobId) {
  return cancelVideoJob(state, 'capture', jobId);
}
