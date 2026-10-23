#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROFILE="$ROOT/Auditor/validation.json"
case "${1:-}" in
  doctor)
    nexus-auditor doctor --target "$ROOT" --profile "$PROFILE"
    ;;
  dry-run)
    nexus-auditor validate-local --target "$ROOT" --profile "$PROFILE" --dry-run
    ;;
  full)
    echo "BLOCKED: full playthrough capabilities (storage assertions, dialogs, fixture seeding, crash/quota injection) are not yet in NexusAuditor." >&2
    echo "See Auditor/playthroughs/acceptance.json. No full-playthrough PASS is being claimed." >&2
    exit 2
    ;;
  *)
    echo "Usage: bash Auditor/run.sh {doctor|dry-run|full}" >&2
    exit 2
    ;;
esac
