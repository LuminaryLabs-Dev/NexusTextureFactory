export function createToolkitState() {
  return {
    startedAt: new Date().toISOString(),
    lastError: '',
    lastRun: null,
    logs: [],
    previewVideo: {
      jobs: new Map()
    },
    captureVideo: {
      jobs: new Map()
    },
    session: {
      requested: false,
      status: 'idle'
    },
    app: {
      localUrl: 'http://127.0.0.1:3014/',
      selectedUrl: '',
      status: 'idle'
    },
    loop: {
      running: false,
      loopName: '',
      iteration: 0,
      status: 'idle'
    }
  };
}

export function pushToolkitLog(state, entry) {
  state.logs.push({
    at: new Date().toISOString(),
    ...entry
  });
  if (state.logs.length > 200) {
    state.logs.splice(0, state.logs.length - 200);
  }
}

export function setLastRun(state, payload) {
  state.lastRun = {
    at: new Date().toISOString(),
    ...payload
  };
  return state.lastRun;
}
