from __future__ import annotations

import importlib.util
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


@unittest.skipUnless(importlib.util.find_spec("build") is not None, "python-build module is required")
class WheelInstallTests(unittest.TestCase):
    def test_clean_wheel_install(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            work = Path(temp_dir)
            subprocess.run([sys.executable, "-m", "build"], cwd=ROOT, check=True, capture_output=True, text=True)
            wheels = sorted((ROOT / "dist").glob("*.whl"))
            self.assertTrue(wheels)
            wheel = wheels[-1]
            venv = work / "venv"
            subprocess.run([sys.executable, "-m", "venv", str(venv)], check=True, capture_output=True, text=True)
            python = venv / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
            subprocess.run([str(python), "-m", "pip", "install", str(wheel)], check=True, capture_output=True, text=True)
            result = subprocess.run(
                [str(python), "-c", "import nexus_texture_factory_tezut, sys; print(nexus_texture_factory_tezut.__file__); print(sys.executable)"],
                check=True,
                capture_output=True,
                text=True,
            )
            self.assertIn("site-packages", result.stdout)
            help_result = subprocess.run([str(python), "-m", "nexus_texture_factory_tezut", "--help"], check=True, capture_output=True, text=True)
            self.assertIn("nexus-tezut", help_result.stdout)
