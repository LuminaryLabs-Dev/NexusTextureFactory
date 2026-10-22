function prettyArgs(args = {}) {
  const entries = Object.entries(args || {}).filter(([, value]) => value !== undefined && value !== null && value !== '');
  if (!entries.length) return 'No additional arguments.';
  return entries.map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`).join('\n');
}

export function buildExternalInstructions(category, tool, args = {}, state) {
  const base = [
    'Use Codex Browser View with the local Playwright MCP tools.',
    `Run category: ${category}`,
    `Run tool: ${tool}`,
    prettyArgs(args)
  ];

  if (category === 'app' && tool === 'reload') {
    base.push(`Open or reload the local app URL: ${state.app.selectedUrl || state.app.localUrl}`);
  } else if (category === 'preview' && tool === 'open') {
    base.push('Open the PREVIEW tab and confirm the viewport, layer list, and inspector are visible.');
  } else if (category === 'preview' && tool === 'select_source') {
    base.push('Use Browser View selection tools to choose the requested source texture from the first preview dropdown.');
  } else if (category === 'preview' && tool === 'select_preset') {
    base.push('Use Browser View selection tools to choose the requested preset from the preset dropdown.');
  } else if (category === 'capture') {
    base.push('Use Browser View screenshot tools to capture the requested target.');
  } else if (category === 'inspect') {
    base.push('Use Browser View console, network, or snapshot tools to collect inspection output.');
  } else if (category === 'input') {
    base.push('Use Browser View input tools to perform the requested interaction.');
  } else if (category === 'preview' && tool === 'apply_control_set') {
    base.push('Open the PREVIEW controls and apply the requested patch manually through Browser View inputs.');
  } else if (category === 'preview' && tool === 'run_validation_pass') {
    base.push('Run the preview flow manually, capture before/after screenshots, and compare the visible result.');
  } else if (category === 'preview' && tool === 'render_video') {
    base.push('Open the PREVIEW tab, open the Record drawer, verify the requested export settings, and start the offline MP4 render.');
  } else if (category === 'capture' && tool === 'render_set_video') {
    base.push('Open the CAPTURE tab, choose the requested set, verify the lineup and export settings, and start the Download Video render.');
  } else if (category === 'loop' && tool === 'run') {
    base.push('Repeat the requested validation loop manually in Browser View until the visible result is proven.');
  }

  return base.join('\n');
}
