from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ENV = os.environ.copy()
ENV["PYTHONPATH"] = str(ROOT / "src")


def run_cli(*args: str, cwd: Path, extra_env: dict | None = None) -> subprocess.CompletedProcess:
    env = ENV.copy()
    env["NEXUS_TEZUT_HOME"] = str(cwd / ".runtime")
    if extra_env:
        env.update(extra_env)
    return subprocess.run(
        [sys.executable, "-m", "nexus_texture_factory_tezut", *args],
        cwd=cwd,
        env=env,
        capture_output=True,
        text=True,
        check=True,
    )


class CliWorkflowTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tempdir = tempfile.TemporaryDirectory()
        self.cwd = Path(self.tempdir.name)

    def tearDown(self) -> None:
        self.tempdir.cleanup()

    def test_stack_render_and_export(self) -> None:
        run_cli("stack", "init", "--json", cwd=self.cwd)
        run_cli("stack", "add", "NOISE_PERLIN", "--json", cwd=self.cwd)
        run_cli("stack", "move", "--from-index", "1", "--to-index", "0", "--json", cwd=self.cwd)
        render = run_cli("stack", "render", "--json", cwd=self.cwd)
        payload = json.loads(render.stdout)
        self.assertTrue(Path(payload["artifactPath"]).exists())
        exported = run_cli("stack", "export", "--out", str(self.cwd / "stack.json"), "--json", cwd=self.cwd)
        export_payload = json.loads(exported.stdout)
        self.assertTrue(Path(export_payload["path"]).exists())

    def test_dream_and_sets_workflow(self) -> None:
        run_cli("filters", "module", "--key", "GRUNGE_SCRATCH", "--enabled", "true", "--json", cwd=self.cwd)
        dreamed = run_cli("dream", "run", "--count", "2", "--prompt", "foam alpha", "--json", cwd=self.cwd)
        payload = json.loads(dreamed.stdout)
        self.assertGreaterEqual(payload["acceptedCount"], 1)
        self.assertTrue(Path(payload["previewPath"]).exists())

        sets_list = json.loads(run_cli("sets", "list", "--json", cwd=self.cwd).stdout)
        self.assertGreaterEqual(len(sets_list["sets"]), 1)
        set_id = sets_list["sets"][0]["id"]

        exported = json.loads(run_cli("sets", "export", "--set-id", set_id, "--json", cwd=self.cwd).stdout)
        self.assertTrue(Path(exported["zipPath"]).exists())

    def test_dream_until_total_with_auto_pack_and_success_previews(self) -> None:
        dreamed = json.loads(
            run_cli(
                "dream",
                "run",
                "--until-total",
                "3",
                "--preview-each-success",
                "--auto-pack",
                "--auto-flipbooks",
                "--json",
                cwd=self.cwd,
            ).stdout
        )
        self.assertEqual(dreamed["finalLibraryCount"], 3)
        self.assertEqual(len(dreamed["previewPaths"]), 3)
        for path in dreamed["previewPaths"]:
            self.assertTrue(Path(path).exists())
        self.assertIn("autoPack", dreamed)
        self.assertGreaterEqual(dreamed["autoPack"]["setCount"], 1)
        for export in dreamed["autoPack"]["exports"]:
            self.assertTrue(Path(export["zipPath"]).exists())
            self.assertEqual(export["resolutions"], [256, 512, 1024, 2048])

    def test_custom_op_validation(self) -> None:
        created = json.loads(run_cli("custom-ops", "add", "--title", "Test Op", "--json", cwd=self.cwd).stdout)
        validated = json.loads(run_cli("custom-ops", "validate", "--id", created["id"], "--json", cwd=self.cwd).stdout)
        self.assertTrue(Path(validated["artifactPath"]).exists())
