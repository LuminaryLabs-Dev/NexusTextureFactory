import Fastify from 'fastify';
import cors from '@fastify/cors';
import { z } from 'zod';
import { TOOLKIT_CATALOG } from './catalog.mjs';
import { runToolkitTool } from './dispatch.mjs';
import { createToolkitState } from './state.mjs';

const state = createToolkitState();
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
  started_at: state.startedAt
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

const port = Number(process.env.TOOLKIT_HTTP_PORT || 41777);
await app.listen({ host: '127.0.0.1', port });
console.log(`toolkit-http listening on http://127.0.0.1:${port}`);
