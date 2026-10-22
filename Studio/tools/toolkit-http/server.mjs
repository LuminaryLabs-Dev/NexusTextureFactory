import Fastify from 'fastify';
import cors from '@fastify/cors';
import { z } from 'zod';
import { TOOLKIT_CATALOG } from './catalog.mjs';
import { runToolkitTool } from './dispatch.mjs';
import { createToolkitState } from './state.mjs';
import {
  appendCaptureVideoFrame,
  appendPreviewVideoFrame,
  cancelCaptureVideoJob,
  cancelPreviewVideoJob,
  finalizeCaptureVideoJob,
  finalizePreviewVideoJob,
  getCaptureVideoStatus,
  getFfmpegInfo,
  getPreviewVideoStatus,
  reviewCaptureVideo,
  startCaptureVideoJob,
  startPreviewVideoJob
} from './videoJobs.mjs';

const state = createToolkitState();
const app = Fastify({ logger: false });

await app.register(cors, {
  origin: true,
  credentials: false
});

app.addContentTypeParser(['image/jpeg', 'application/octet-stream'], { parseAs: 'buffer' }, (request, body, done) => {
  done(null, body);
});

function wrap(handler) {
  return async (request, reply) => {
    try {
      return await handler(request, reply);
    } catch (error) {
      state.lastError = error.message;
      reply.code(400);
      return { ok: false, error: error.message };
    }
  };
}

app.get('/toolkit/health', wrap(async () => ({
  ok: true,
  status: state.lastError ? 'degraded' : 'ok',
  server_ready: true,
  toolkit_ready: true,
  last_error: state.lastError || '',
  started_at: state.startedAt,
  ffmpeg_available: getFfmpegInfo().available,
  ffmpeg_path: getFfmpegInfo().path,
  ffmpeg_version: getFfmpegInfo().version,
  ffmpeg_error: getFfmpegInfo().error
})));

app.get('/toolkit/catalog', wrap(async () => ({
  ok: true,
  categories: TOOLKIT_CATALOG
})));

app.post('/toolkit/run', wrap(async (request) => {
  const payload = z.object({
    category: z.string().min(1),
    tool: z.string().min(1),
    args: z.record(z.string(), z.any()).optional().default({})
  }).parse(request.body || {});
  return runToolkitTool(state, payload);
}));

app.get('/toolkit/runs/latest', wrap(async () => state.lastRun || { ok: true, status: 'idle', result: null }));
app.get('/toolkit/logs', wrap(async () => ({ ok: true, entries: state.logs })));

app.post('/toolkit/preview/video/start', wrap(async (request) => {
  const payload = z.object({
    outputName: z.string().min(1),
    durationSeconds: z.number().positive(),
    fps: z.number().positive(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    expectedFrames: z.number().int().positive().optional()
  }).parse(request.body || {});
  return await startPreviewVideoJob(state, payload);
}));

app.post('/toolkit/preview/video/frame', wrap(async (request) => {
  const query = z.object({
    jobId: z.string().min(1),
    frameIndex: z.coerce.number().int().nonnegative()
  }).parse(request.query || {});
  if (!Buffer.isBuffer(request.body)) {
    throw new Error('Frame upload expects an image/jpeg or application/octet-stream body.');
  }
  return await appendPreviewVideoFrame(state, query.jobId, query.frameIndex, request.body);
}));

app.post('/toolkit/preview/video/finalize', wrap(async (request) => {
  const payload = z.object({
    jobId: z.string().min(1)
  }).parse(request.body || {});
  return await finalizePreviewVideoJob(state, payload.jobId);
}));

app.get('/toolkit/preview/video/status/:jobId', wrap(async (request) => {
  const params = z.object({
    jobId: z.string().min(1)
  }).parse(request.params || {});
  return getPreviewVideoStatus(state, params.jobId);
}));

app.post('/toolkit/preview/video/cancel', wrap(async (request) => {
  const payload = z.object({
    jobId: z.string().min(1)
  }).parse(request.body || {});
  return await cancelPreviewVideoJob(state, payload.jobId);
}));

app.post('/toolkit/capture/video/start', wrap(async (request) => {
  const payload = z.object({
    outputName: z.string().min(1),
    durationSeconds: z.number().positive(),
    fps: z.number().positive(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    expectedFrames: z.number().int().positive().optional(),
    metadata: z.record(z.string(), z.any()).optional()
  }).parse(request.body || {});
  return await startCaptureVideoJob(state, payload);
}));

app.post('/toolkit/capture/video/frame', wrap(async (request) => {
  const query = z.object({
    jobId: z.string().min(1),
    frameIndex: z.coerce.number().int().nonnegative()
  }).parse(request.query || {});
  if (!Buffer.isBuffer(request.body)) {
    throw new Error('Frame upload expects an image/jpeg or application/octet-stream body.');
  }
  return await appendCaptureVideoFrame(state, query.jobId, query.frameIndex, request.body);
}));

app.post('/toolkit/capture/video/finalize', wrap(async (request) => {
  const payload = z.object({
    jobId: z.string().min(1)
  }).parse(request.body || {});
  return await finalizeCaptureVideoJob(state, payload.jobId);
}));

app.get('/toolkit/capture/video/status/:jobId', wrap(async (request) => {
  const params = z.object({
    jobId: z.string().min(1)
  }).parse(request.params || {});
  return getCaptureVideoStatus(state, params.jobId);
}));

app.post('/toolkit/capture/video/cancel', wrap(async (request) => {
  const payload = z.object({
    jobId: z.string().min(1)
  }).parse(request.body || {});
  return await cancelCaptureVideoJob(state, payload.jobId);
}));

app.post('/toolkit/capture/video/review', wrap(async (request) => {
  const payload = z.object({
    outputPath: z.string().min(1),
    frameCount: z.number().int().positive().max(12).optional(),
    metadata: z.record(z.string(), z.any()).optional()
  }).parse(request.body || {});
  return await reviewCaptureVideo(state, payload);
}));

const port = Number(process.env.TOOLKIT_HTTP_PORT || 41777);
await app.listen({ host: '127.0.0.1', port });
console.log(`toolkit-http listening on http://127.0.0.1:${port}`);
