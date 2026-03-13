from __future__ import annotations

import json
from pathlib import Path


def add_json_flag(parser) -> None:
    parser.add_argument("--json", action="store_true", help="Emit machine-readable JSON.")


def parse_key_values(values: list[str] | None) -> dict:
    result = {}
    for value in values or []:
        key, raw = value.split("=", 1)
        if raw.lower() in {"true", "false"}:
            result[key] = raw.lower() == "true"
        else:
            try:
                result[key] = int(raw)
            except ValueError:
                try:
                    result[key] = float(raw)
                except ValueError:
                    result[key] = raw
    return result


def emit(payload: dict | list, as_json: bool) -> int:
    if as_json:
        print(json.dumps(payload, indent=2, sort_keys=True))
    else:
        print(json.dumps(payload, indent=2, sort_keys=True))
    return 0


def as_path(value: str | None) -> Path | None:
    return Path(value).expanduser() if value else None

