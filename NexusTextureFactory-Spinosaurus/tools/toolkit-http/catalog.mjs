export const TOOLKIT_CATALOG = [
  {
    id: 'session',
    label: 'Session',
    tools: [
      { id: 'start', execution_mode: 'server_local', description: 'Mark a local toolkit session as requested.', args: {} },
      { id: 'stop', execution_mode: 'server_local', description: 'Stop the local toolkit session marker.', args: {} },
      { id: 'status', execution_mode: 'server_local', description: 'Return the current local toolkit session state.', args: {} }
    ]
  },
  {
    id: 'app',
    label: 'App',
    tools: [
      { id: 'open_local', execution_mode: 'server_local', description: 'Set the preferred local app URL for operator runs.', args: { url: 'string?' } },
      { id: 'reload', execution_mode: 'external_operator', description: 'Reload the app in the external browser operator.', args: {} },
      { id: 'status', execution_mode: 'server_local', description: 'Return the current app target state.', args: {} }
    ]
  },
  {
    id: 'capture',
    label: 'Capture',
    tools: [
      { id: 'full_app', execution_mode: 'external_operator', description: 'Capture the full app surface in Browser View.', args: { label: 'string?', full_page: 'boolean?' } },
      { id: 'viewport', execution_mode: 'external_operator', description: 'Capture the current viewport in Browser View.', args: { label: 'string?' } },
      { id: 'element', execution_mode: 'external_operator', description: 'Capture a specific element in Browser View.', args: { selector: 'string', label: 'string?' } },
      { id: 'latest', execution_mode: 'server_local', description: 'Return the latest recorded toolkit run payload.', args: {} }
    ]
  },
  {
    id: 'inspect',
    label: 'Inspect',
    tools: [
      { id: 'console', execution_mode: 'external_operator', description: 'Inspect browser console messages.', args: {} },
      { id: 'network', execution_mode: 'external_operator', description: 'Inspect browser network requests.', args: {} },
      { id: 'dom_snapshot', execution_mode: 'external_operator', description: 'Inspect a visible-state snapshot from Browser View.', args: {} }
    ]
  },
  {
    id: 'input',
    label: 'Input',
    tools: [
      { id: 'navigate', execution_mode: 'external_operator', description: 'Navigate to a tab or route in Browser View.', args: { tab: 'string?' } },
      { id: 'click', execution_mode: 'external_operator', description: 'Click a target selector in Browser View.', args: { selector: 'string' } },
      { id: 'type', execution_mode: 'external_operator', description: 'Type text into a target selector in Browser View.', args: { selector: 'string', text: 'string' } },
      { id: 'select', execution_mode: 'external_operator', description: 'Select an option in Browser View.', args: { selector: 'string', value: 'string' } },
      { id: 'press', execution_mode: 'external_operator', description: 'Press a key in Browser View.', args: { key: 'string' } }
    ]
  },
  {
    id: 'preview',
    label: 'Preview',
    tools: [
      { id: 'open', execution_mode: 'external_operator', description: 'Open the PREVIEW tab and verify the layout.', args: {} },
      { id: 'select_source', execution_mode: 'external_operator', description: 'Select a source texture in PREVIEW.', args: { source_id: 'string?', source_name: 'string?' } },
      { id: 'select_preset', execution_mode: 'external_operator', description: 'Select a preset in PREVIEW.', args: { preset_name: 'string' } },
      { id: 'apply_control_set', execution_mode: 'external_operator', description: 'Apply a grouped control patch in PREVIEW.', args: { patch: 'object' } },
      { id: 'run_validation_pass', execution_mode: 'hybrid', description: 'Record a validation pass and provide Browser View instructions.', args: { pass_name: 'string?' } }
    ]
  },
  {
    id: 'loop',
    label: 'Loop',
    tools: [
      { id: 'run', execution_mode: 'hybrid', description: 'Start a manual operator validation loop.', args: { loop_name: 'string?', max_iterations: 'number?' } },
      { id: 'status', execution_mode: 'server_local', description: 'Return the current loop state.', args: {} },
      { id: 'stop', execution_mode: 'server_local', description: 'Stop the current loop state.', args: {} }
    ]
  }
];

export function getToolkitTool(categoryId, toolId) {
  const category = TOOLKIT_CATALOG.find((item) => item.id === categoryId);
  if (!category) return null;
  const tool = category.tools.find((item) => item.id === toolId);
  if (!tool) return null;
  return { category, tool };
}
