from __future__ import annotations

import json
import os
from copy import deepcopy
from pathlib import Path

from .catalog import default_state


class TezutStorage:
    def __init__(self, root: Path | None = None) -> None:
        env_root = os.environ.get("NEXUS_TEZUT_HOME")
        resolved = Path(env_root).expanduser() if env_root else (root or Path.cwd() / ".nexus-tezut")
        self.root = resolved
        self.artifacts = self.root / "artifacts"
        self.session_path = self.root / "session.json"
        self.library_path = self.root / "library.json"
        self.config_path = self.root / "config.json"
        self.custom_ops_path = self.root / "custom_ops.json"

    def ensure(self) -> None:
        self.root.mkdir(parents=True, exist_ok=True)
        self.artifacts.mkdir(parents=True, exist_ok=True)

    def _read_json(self, path: Path, default: object) -> object:
        if not path.exists():
            return deepcopy(default)
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return deepcopy(default)

    def _write_json(self, path: Path, value: object) -> None:
        path.write_text(json.dumps(value, indent=2, sort_keys=True), encoding="utf-8")

    def load_state(self) -> dict:
        self.ensure()
        defaults = default_state()
        session = self._read_json(
            self.session_path,
            {"profileName": defaults["profileName"], "selectedRes": defaults["selectedRes"], "stack": defaults["stack"], "deleteHistory": []},
        )
        library = self._read_json(self.library_path, [])
        config = self._read_json(
            self.config_path,
            {
                "filterModules": defaults["filterModules"],
                "qualityFilters": defaults["qualityFilters"],
                "packConfig": defaults["packConfig"],
                "flipbookConfig": defaults["flipbookConfig"],
                "dreamParams": defaults["dreamParams"],
                "uiPrefs": defaults["uiPrefs"],
                "lastDreamResults": [],
            },
        )
        custom_ops = self._read_json(self.custom_ops_path, [])
        return {
            "profileName": session.get("profileName", defaults["profileName"]),
            "selectedRes": session.get("selectedRes", defaults["selectedRes"]),
            "stack": session.get("stack", defaults["stack"]),
            "deleteHistory": session.get("deleteHistory", []),
            "library": library if isinstance(library, list) else [],
            "customOps": custom_ops if isinstance(custom_ops, list) else [],
            "filterModules": config.get("filterModules", defaults["filterModules"]),
            "qualityFilters": config.get("qualityFilters", defaults["qualityFilters"]),
            "packConfig": config.get("packConfig", defaults["packConfig"]),
            "flipbookConfig": config.get("flipbookConfig", defaults["flipbookConfig"]),
            "dreamParams": config.get("dreamParams", defaults["dreamParams"]),
            "uiPrefs": config.get("uiPrefs", defaults["uiPrefs"]),
            "lastDreamResults": config.get("lastDreamResults", []),
        }

    def save_state(self, state: dict) -> None:
        self.ensure()
        self._write_json(
            self.session_path,
            {
                "profileName": state["profileName"],
                "selectedRes": state["selectedRes"],
                "stack": state["stack"],
                "deleteHistory": state["deleteHistory"],
            },
        )
        self._write_json(self.library_path, state["library"])
        self._write_json(
            self.config_path,
            {
                "filterModules": state["filterModules"],
                "qualityFilters": state["qualityFilters"],
                "packConfig": state["packConfig"],
                "flipbookConfig": state["flipbookConfig"],
                "dreamParams": state["dreamParams"],
                "uiPrefs": state["uiPrefs"],
                "lastDreamResults": state["lastDreamResults"],
            },
        )
        self._write_json(self.custom_ops_path, state["customOps"])

    def artifact_path(self, *parts: str) -> Path:
        self.ensure()
        path = self.artifacts.joinpath(*parts)
        path.parent.mkdir(parents=True, exist_ok=True)
        return path

    def absolute_path(self, value: str | Path) -> str:
        return str(Path(value).resolve())

