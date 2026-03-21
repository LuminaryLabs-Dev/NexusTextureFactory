import Fastify from 'fastify';
import cors from '@fastify/cors';
import { z } from 'zod';
import { createState } from './state.mjs';
import { captureElement, captureFullApp, captureViewport } from './capture.mjs';
import {
  applyPreviewControlSet,
  clickAction,
  domSnapshot,
  getAppStatus,
  navigateAction,
  openApp,
  openPreviewTab,
  pressAction,
  reloadApp,
  selectAction,
  selectPreviewPreset,
  selectPreviewSource,
  startSession,
  stopSession,
  typeAction
} from './browserSession.mjs';
import { runLoop, runValidationPass, stopLoop } from './loopRunner.mjs';

const state = createState();
const app = Fastify({ logger: false });

await app.register(cors, {
  origin: true,
  credentials: false
});

function wrap(handler) {
  return async (request, reply) => {
    try {
      return await handler(request, reply);
    } catch (error) {
      state.latestError = error.message;
      reply.code(400);
      return { ok: false, error: error.message };
    }
  };
}

app.get('/health', wrap(async () => ({
  status: state.latestError ? 'degraded' : 'ok',
  server_ready: true,
  browser_ready: !!state.page,
  app_ready: !!state.appUrl,
  active_url: state.page?.url?.() || state.appUrl || '',
  last_error: state.latestError || ''
})));

app.post('/session/start', wrap(async (request) => {
  const payload = z.object({
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    headless: z.boolean().optional()
  }).parse(request.body || {});
  return await startSession(state, payload);
}));

app.post('/session/stop', wrap(async () => await stopSession(state)));
app.post('/app/open', wrap(async (request) => {
  const payload = z.object({ url: z.string().url() }).parse(request.body || {});
  return await openApp(state, payload);
}));
app.post('/app/reload', wrap(async () => await reloadApp(state)));
app.get('/app/status', wrap(async () => await getAppStatus(state)));
app.post('/capture/full_app', wrap(async (request) => {
  const payload = z.object({
    label: z.string().optional(),
    full_page: z.boolean().optional()
  }).parse(request.body || {});
  return await captureFullApp(state, { label: payload.label, fullPage: payload.full_page });
}));
app.post('/capture/viewport', wrap(async (request) => {
  const payload = z.object({ label: z.string().optional() }).parse(request.body || {});
  return await captureViewport(state, payload);
}));
app.post('/capture/element', wrap(async (request) => {
  const payload = z.object({
    selector: z.string().min(1),
    label: z.string().optional()
  }).parse(request.body || {});
  return await captureElement(state, payload);
}));
app.get('/capture/latest', wrap(async () => state.latestCapture || { ok: true, file_path: '', captured_at: '' }));
app.get('/inspect/console', wrap(async () => ({ ok: true, entries: state.consoleLogs })));
app.get('/inspect/network', wrap(async () => ({ ok: true, entries: state.networkLogs })));
app.post('/inspect/dom_snapshot', wrap(async () => await domSnapshot(state)));
app.post('/action/navigate', wrap(async (request) => {
  const payload = z.object({
    tab: z.string().optional(),
    url: z.string().url().optional()
  }).parse(request.body || {});
  return await navigateAction(state, payload);
}));
app.post('/action/click', wrap(async (request) => {
  const payload = z.object({ selector: z.string().min(1) }).parse(request.body || {});
  return await clickAction(state, payload);
}));
app.post('/action/type', wrap(async (request) => {
  const payload = z.object({ selector: z.string().min(1), text: z.string() }).parse(request.body || {});
  return await typeAction(state, payload);
}));
app.post('/action/select', wrap(async (request) => {
  const payload = z.object({ selector: z.string().min(1), value: z.string() }).parse(request.body || {});
  return await selectAction(state, payload);
}));
app.post('/action/press', wrap(async (request) => {
  const payload = z.object({ key: z.string().min(1) }).parse(request.body || {});
  return await pressAction(state, payload);
}));
app.post('/particle/open_preview', wrap(async () => await openPreviewTab(state)));
app.post('/particle/select_source', wrap(async (request) => {
  const payload = z.object({
    source_name: z.string().optional(),
    source_id: z.string().optional()
  }).parse(request.body || {});
  return await selectPreviewSource(state, payload);
}));
app.post('/particle/select_preset', wrap(async (request) => {
  const payload = z.object({ preset_name: z.string() }).parse(request.body || {});
  return await selectPreviewPreset(state, payload);
}));
app.post('/particle/apply_control_set', wrap(async (request) => await applyPreviewControlSet(state, request.body || {})));
app.post('/particle/run_validation_pass', wrap(async (request) => {
  const payload = z.object({ pass_name: z.string().optional() }).parse(request.body || {});
  return await runValidationPass(state, payload);
}));
app.post('/loop/run', wrap(async (request) => {
  const payload = z.object({
    loop_name: z.string().optional(),
    target_url: z.string().url().optional().default(''),
    max_iterations: z.number().int().positive().optional()
  }).parse(request.body || {});
  return await runLoop(state, payload);
}));
app.get('/loop/status', wrap(async () => ({
  running: state.loop.running,
  iteration: state.loop.iteration,
  last_verdict: state.loop.lastVerdict,
  latest_capture_paths: state.loop.latestCapturePaths,
  loop_name: state.loop.loopName,
  target_url: state.loop.targetUrl
})));
app.post('/loop/stop', wrap(async () => await stopLoop(state)));

const port = Number(process.env.HUMAN_VIEW_HTTP_PORT || 41777);
await app.listen({ host: '127.0.0.1', port });
console.log(`human-view-http listening on http://127.0.0.1:${port}`);
