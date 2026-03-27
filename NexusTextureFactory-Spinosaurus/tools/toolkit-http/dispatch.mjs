import { getToolkitTool } from './catalog.mjs';
import { buildExternalInstructions } from './adapters/browserExternal.mjs';
import { pushToolkitLog, setLastRun } from './state.mjs';
import { cancelCaptureVideoJob, cancelPreviewVideoJob, getCaptureVideoStatus, getPreviewVideoStatus, reviewCaptureVideo } from './videoJobs.mjs';

function buildRunPayload({ category, tool, executionMode, status, result = null, instructions = '', args = {} }) {
  return {
    ok: true,
    category,
    tool,
    execution_mode: executionMode,
    status,
    result,
    instructions,
    args
  };
}

export async function runToolkitTool(state, { category, tool, args = {} }) {
  const match = getToolkitTool(category, tool);
  if (!match) {
    throw new Error(`Unknown toolkit tool: ${category}.${tool}`);
  }

  const { tool: toolDef } = match;
  let payload = null;

  if (category === 'session' && tool === 'start') {
    state.session.requested = true;
    state.session.status = 'requested';
    payload = buildRunPayload({ category, tool, executionMode: 'server_local', status: 'completed', result: { session: state.session }, args });
  } else if (category === 'session' && tool === 'stop') {
    state.session.requested = false;
    state.session.status = 'idle';
    payload = buildRunPayload({ category, tool, executionMode: 'server_local', status: 'completed', result: { session: state.session }, args });
  } else if (category === 'session' && tool === 'status') {
    payload = buildRunPayload({ category, tool, executionMode: 'server_local', status: 'completed', result: { session: state.session }, args });
  } else if (category === 'app' && tool === 'open_local') {
    const nextUrl = typeof args.url === 'string' && args.url.trim() ? args.url.trim() : state.app.localUrl;
    state.app.selectedUrl = nextUrl;
    state.app.status = 'ready';
    payload = buildRunPayload({ category, tool, executionMode: 'server_local', status: 'completed', result: { app: state.app }, args });
  } else if (category === 'app' && tool === 'status') {
    payload = buildRunPayload({ category, tool, executionMode: 'server_local', status: 'completed', result: { app: state.app }, args });
  } else if (category === 'capture' && tool === 'latest') {
    payload = buildRunPayload({ category, tool, executionMode: 'server_local', status: 'completed', result: state.lastRun, args });
  } else if (category === 'capture' && tool === 'video_status') {
    const result = getCaptureVideoStatus(state, args.job_id);
    payload = buildRunPayload({ category, tool, executionMode: 'server_local', status: result.status, result, args });
  } else if (category === 'capture' && tool === 'review_saved_video') {
    const result = await reviewCaptureVideo(state, {
      outputPath: args.output_path,
      frameCount: args.frame_count,
      metadata: args.metadata
    });
    payload = buildRunPayload({ category, tool, executionMode: 'server_local', status: result.status, result, args });
  } else if (category === 'capture' && tool === 'cancel_video') {
    const result = await cancelCaptureVideoJob(state, args.job_id);
    payload = buildRunPayload({ category, tool, executionMode: 'server_local', status: result.status, result, args });
  } else if (category === 'capture' && tool === 'render_set_video') {
    payload = buildRunPayload({
      category,
      tool,
      executionMode: 'hybrid',
      status: 'queued_manual',
      result: {
        set_name: args.set_name || '',
        preset_name: args.preset_name || '',
        output_name: args.output_name || ''
      },
      instructions: buildExternalInstructions(category, tool, args, state),
      args
    });
  } else if (category === 'loop' && tool === 'status') {
    payload = buildRunPayload({ category, tool, executionMode: 'server_local', status: 'completed', result: { loop: state.loop }, args });
  } else if (category === 'loop' && tool === 'stop') {
    state.loop.running = false;
    state.loop.status = 'stopped';
    payload = buildRunPayload({ category, tool, executionMode: 'server_local', status: 'completed', result: { loop: state.loop }, args });
  } else if (category === 'loop' && tool === 'run') {
    state.loop.running = true;
    state.loop.loopName = String(args.loop_name || 'manual_validation');
    state.loop.iteration = 0;
    state.loop.status = 'queued_manual';
    payload = buildRunPayload({
      category,
      tool,
      executionMode: 'hybrid',
      status: 'queued_manual',
      result: { loop: state.loop },
      instructions: buildExternalInstructions(category, tool, args, state),
      args
    });
  } else if (category === 'preview' && tool === 'run_validation_pass') {
    payload = buildRunPayload({
      category,
      tool,
      executionMode: 'hybrid',
      status: 'queued_manual',
      result: { pass_name: args.pass_name || 'preview_visibility' },
      instructions: buildExternalInstructions(category, tool, args, state),
      args
    });
  } else if (category === 'preview' && tool === 'video_status') {
    const result = getPreviewVideoStatus(state, args.job_id);
    payload = buildRunPayload({ category, tool, executionMode: 'server_local', status: result.status, result, args });
  } else if (category === 'preview' && tool === 'cancel_video') {
    const result = await cancelPreviewVideoJob(state, args.job_id);
    payload = buildRunPayload({ category, tool, executionMode: 'server_local', status: result.status, result, args });
  } else if (category === 'preview' && tool === 'render_video') {
    payload = buildRunPayload({
      category,
      tool,
      executionMode: 'hybrid',
      status: 'queued_manual',
      result: {
        preset_name: args.preset_name || '',
        output_name: args.output_name || ''
      },
      instructions: buildExternalInstructions(category, tool, args, state),
      args
    });
  } else {
    payload = buildRunPayload({
      category,
      tool,
      executionMode: toolDef.execution_mode,
      status: 'queued_manual',
      result: null,
      instructions: buildExternalInstructions(category, tool, args, state),
      args
    });
  }

  setLastRun(state, payload);
  pushToolkitLog(state, {
    type: 'tool_run',
    category,
    tool,
    execution_mode: payload.execution_mode,
    status: payload.status
  });
  return payload;
}
