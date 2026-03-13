from __future__ import annotations

from copy import deepcopy

BLEND_MODES = [
    {"id": 0, "name": "Overwrite"},
    {"id": 1, "name": "Subtract"},
    {"id": 2, "name": "Multiply"},
    {"id": 3, "name": "Add"},
    {"id": 4, "name": "Max (Lighten)"},
    {"id": 5, "name": "Min (Darken)"},
]

STEP_TYPES = {
    "BASE_SHAPE": {
        "id": 1,
        "name": "Base Shape",
        "cat": "GEN",
        "params": {"p1": 0, "p2": 0.8, "p3": 0.02, "p4": 0.05, "p5": 0, "p6": 0, "p7": 0},
        "controls": [
            {
                "key": "p1",
                "label": "Type",
                "type": "select",
                "options": [
                    {"label": "Circle", "value": 0},
                    {"label": "Square", "value": 1},
                    {"label": "Triangle", "value": 2},
                    {"label": "Wire Circle", "value": 3},
                    {"label": "Wire Square", "value": 4},
                    {"label": "Wire Triangle", "value": 5},
                ],
            },
            {"key": "p2", "label": "Size", "type": "slider", "min": 0, "max": 1, "step": 0.01},
            {"key": "p3", "label": "Softness", "type": "slider", "min": 0, "max": 1, "step": 0.01},
            {"key": "p4", "label": "Thickness", "type": "slider", "min": 0, "max": 0.5, "step": 0.01},
        ],
    },
    "BASE_GRAD": {
        "id": 3,
        "name": "Gradient",
        "cat": "GEN",
        "params": {"p1": 0, "p2": 0, "p3": 0, "p4": 0, "p5": 0, "p6": 0, "p7": 0},
        "controls": [{"key": "p1", "label": "Angle", "type": "slider", "min": 0, "max": 360, "step": 1}],
    },
    "NOISE_PERLIN": {
        "id": 4,
        "name": "Perlin Noise",
        "cat": "ERODE",
        "params": {"p1": 4.0, "p2": 123, "p3": 4, "p4": 0.5, "p5": 0, "p6": 0, "p7": 0},
        "controls": [
            {"key": "p1", "label": "Scale", "type": "slider", "min": 0, "max": 10, "step": 0.1},
            {"key": "p2", "label": "Seed", "type": "slider", "min": 0, "max": 9999, "step": 1},
            {"key": "p3", "label": "Octaves", "type": "slider", "min": 1, "max": 8, "step": 1},
            {"key": "p4", "label": "Rolloff", "type": "slider", "min": 0, "max": 1, "step": 0.01},
            {"key": "p6", "label": "Offset X", "type": "slider", "min": -1, "max": 1, "step": 0.01},
            {"key": "p7", "label": "Offset Y", "type": "slider", "min": -1, "max": 1, "step": 0.01},
        ],
    },
    "NOISE_WORLEY": {
        "id": 5,
        "name": "Worley Noise",
        "cat": "ERODE",
        "params": {"p1": 4.0, "p2": 456, "p3": 1, "p4": 0, "p5": 0, "p6": 0, "p7": 0},
        "controls": [
            {"key": "p1", "label": "Scale", "type": "slider", "min": 0, "max": 10, "step": 0.1},
            {"key": "p2", "label": "Seed", "type": "slider", "min": 0, "max": 9999, "step": 1},
            {"key": "p3", "label": "Jitter", "type": "slider", "min": 0, "max": 2, "step": 0.1},
            {"key": "p4", "label": "Invert", "type": "slider", "min": 0, "max": 1, "step": 1},
            {"key": "p6", "label": "Offset X", "type": "slider", "min": -1, "max": 1, "step": 0.01},
            {"key": "p7", "label": "Offset Y", "type": "slider", "min": -1, "max": 1, "step": 0.01},
        ],
    },
    "THRESHOLD": {
        "id": 11,
        "name": "Threshold",
        "cat": "FILT",
        "params": {"p1": 0.5, "p2": 0, "p3": 0, "p4": 0, "p5": 0, "p6": 0, "p7": 0},
        "controls": [{"key": "p1", "label": "Cutoff", "type": "slider", "min": 0, "max": 1, "step": 0.01}],
    },
    "FRACTAL": {
        "id": 12,
        "name": "Fractalize",
        "cat": "MOD",
        "params": {"p1": 6.0, "p2": 0, "p3": 0, "p4": 0, "p5": 0, "p6": 0, "p7": 0},
        "controls": [{"key": "p1", "label": "Segments", "type": "slider", "min": 1, "max": 16, "step": 1}],
    },
    "SPIRAL": {
        "id": 13,
        "name": "Spiral",
        "cat": "MOD",
        "params": {"p1": 0.5, "p2": 0, "p3": 0, "p4": 0.5, "p5": 0.5, "p6": 0, "p7": 0},
        "controls": [
            {"key": "p1", "label": "Twist", "type": "slider", "min": 0, "max": 2, "step": 0.01},
            {"key": "p4", "label": "Center X", "type": "slider", "min": 0, "max": 1, "step": 0.01},
            {"key": "p5", "label": "Center Y", "type": "slider", "min": 0, "max": 1, "step": 0.01},
        ],
    },
    "VIGNETTE": {
        "id": 14,
        "name": "Vignette",
        "cat": "MOD",
        "params": {"p1": 0.0, "p2": 0.45, "p3": 0.2, "p4": 0, "p5": 0, "p6": 0, "p7": 0},
        "controls": [
            {
                "key": "p1",
                "label": "Shape",
                "type": "select",
                "options": [{"label": "Circle", "value": 0}, {"label": "Square", "value": 1}],
            },
            {"key": "p2", "label": "Size", "type": "slider", "min": 0, "max": 1, "step": 0.01},
            {"key": "p3", "label": "Softness", "type": "slider", "min": 0, "max": 1, "step": 0.01},
        ],
    },
    "BASIC": {
        "id": 15,
        "name": "Basic / Note",
        "cat": "UTIL",
        "params": {"p1": 0, "p2": 0, "p3": 0, "p4": 0, "p5": 0, "p6": 0, "p7": 0},
        "controls": [],
    },
    "SMEAR": {
        "id": 16,
        "name": "Smear",
        "cat": "MOD",
        "params": {"p1": 0, "p2": 0.1, "p3": 0, "p4": 0, "p5": 0, "p6": 0, "p7": 0},
        "controls": [
            {"key": "p1", "label": "Angle", "type": "slider", "min": 0, "max": 360, "step": 1},
            {"key": "p2", "label": "Strength", "type": "slider", "min": 0, "max": 1, "step": 0.01},
        ],
    },
    "DOMAIN_WARP": {
        "id": 101,
        "name": "Domain Warp",
        "cat": "MOD",
        "params": {"p1": 4.0, "p2": 123, "p3": 0.35, "p4": 0, "p5": 0, "p6": 0, "p7": 0},
        "controls": [
            {"key": "p1", "label": "Warp Scale", "type": "slider", "min": 0, "max": 10, "step": 0.1},
            {"key": "p2", "label": "Seed", "type": "slider", "min": 0, "max": 9999, "step": 1},
            {"key": "p3", "label": "Warp Strength", "type": "slider", "min": 0, "max": 1, "step": 0.01},
        ],
    },
    "RADIAL_WARP": {
        "id": 102,
        "name": "Radial Warp",
        "cat": "MOD",
        "params": {"p1": 0, "p2": 0.5, "p3": 0.5, "p4": 0.5, "p5": 0.5, "p6": 0, "p7": 0},
        "controls": [
            {
                "key": "p1",
                "label": "Mode",
                "type": "select",
                "options": [{"label": "Twirl", "value": 0}, {"label": "Pinch", "value": 1}, {"label": "Bulge", "value": 2}],
            },
            {"key": "p2", "label": "Strength", "type": "slider", "min": -2, "max": 2, "step": 0.01},
            {"key": "p3", "label": "Radius", "type": "slider", "min": 0, "max": 1, "step": 0.01},
            {"key": "p4", "label": "Center X", "type": "slider", "min": 0, "max": 1, "step": 0.01},
            {"key": "p5", "label": "Center Y", "type": "slider", "min": 0, "max": 1, "step": 0.01},
        ],
    },
    "KALEIDOSCOPE_PLUS": {
        "id": 103,
        "name": "Kaleidoscope",
        "cat": "MOD",
        "params": {"p1": 6, "p2": 0, "p3": 1, "p4": 0, "p5": 0, "p6": 0, "p7": 0},
        "controls": [
            {"key": "p1", "label": "Segments", "type": "slider", "min": 1, "max": 32, "step": 1},
            {"key": "p2", "label": "Rotation", "type": "slider", "min": 0, "max": 360, "step": 1},
            {"key": "p3", "label": "Mirror", "type": "slider", "min": 0, "max": 1, "step": 1},
        ],
    },
    "MORPH_DILATE_ERODE": {
        "id": 104,
        "name": "Morph Dilate/Erode",
        "cat": "FILT",
        "params": {"p1": 0, "p2": 2, "p3": 0, "p4": 0, "p5": 0, "p6": 0, "p7": 0},
        "controls": [
            {"key": "p1", "label": "Mode", "type": "select", "options": [{"label": "Dilate", "value": 0}, {"label": "Erode", "value": 1}]},
            {"key": "p2", "label": "Radius (px)", "type": "slider", "min": 0, "max": 8, "step": 1},
        ],
    },
    "MORPH_OPEN_CLOSE": {
        "id": 105,
        "name": "Morph Open/Close",
        "cat": "FILT",
        "params": {"p1": 0, "p2": 2, "p3": 0, "p4": 0, "p5": 0, "p6": 0, "p7": 0},
        "controls": [
            {
                "key": "p1",
                "label": "Mode",
                "type": "select",
                "options": [{"label": "Open (Smooth)", "value": 0}, {"label": "Close (Fill)", "value": 1}],
            },
            {"key": "p2", "label": "Radius (px)", "type": "slider", "min": 0, "max": 8, "step": 1},
        ],
    },
    "EDGE_SOBEL": {
        "id": 106,
        "name": "Edge Detect",
        "cat": "FILT",
        "params": {"p1": 1.0, "p2": 0.1, "p3": 0, "p4": 0, "p5": 0, "p6": 0, "p7": 0},
        "controls": [
            {"key": "p1", "label": "Strength", "type": "slider", "min": 0, "max": 5, "step": 0.05},
            {"key": "p2", "label": "Threshold", "type": "slider", "min": 0, "max": 1, "step": 0.01},
            {"key": "p3", "label": "Invert", "type": "slider", "min": 0, "max": 1, "step": 1},
        ],
    },
    "OUTLINE_ALPHA": {
        "id": 107,
        "name": "Outline",
        "cat": "FILT",
        "params": {"p1": 2.0, "p2": 0.1, "p3": 2, "p4": 0, "p5": 0, "p6": 0, "p7": 0},
        "controls": [
            {"key": "p1", "label": "Thickness (px)", "type": "slider", "min": 0, "max": 8, "step": 1},
            {"key": "p2", "label": "Softness", "type": "slider", "min": 0.01, "max": 1, "step": 0.01},
            {
                "key": "p3",
                "label": "Mode",
                "type": "select",
                "options": [{"label": "Outer", "value": 0}, {"label": "Inner", "value": 1}, {"label": "Both", "value": 2}],
            },
        ],
    },
    "POSTERIZE_ALPHA": {
        "id": 108,
        "name": "Posterize Alpha",
        "cat": "FILT",
        "params": {"p1": 4, "p2": 0, "p3": 0, "p4": 0, "p5": 0, "p6": 0, "p7": 0},
        "controls": [
            {"key": "p1", "label": "Steps", "type": "slider", "min": 2, "max": 16, "step": 1},
            {"key": "p2", "label": "Bias", "type": "slider", "min": -1, "max": 1, "step": 0.01},
        ],
    },
    "DISTANCE_BANDS": {
        "id": 109,
        "name": "Distance Bands",
        "cat": "FILT",
        "params": {"p1": 8, "p2": 0.3, "p3": 0.1, "p4": 0.0, "p5": 0, "p6": 0, "p7": 0},
        "controls": [
            {"key": "p1", "label": "Frequency", "type": "slider", "min": 1, "max": 64, "step": 1},
            {"key": "p2", "label": "Band Start", "type": "slider", "min": 0, "max": 1, "step": 0.01},
            {"key": "p3", "label": "Band Width", "type": "slider", "min": 0.01, "max": 0.5, "step": 0.01},
            {"key": "p4", "label": "Phase", "type": "slider", "min": 0, "max": 1, "step": 0.01},
        ],
    },
    "LIBRARY_STAMP_SCATTER": {
        "id": 110,
        "name": "Library Stamp/Scatter",
        "cat": "MOD",
        "params": {"p1": 8, "p2": 1.0, "p3": 0.2, "p4": 0.8, "p5": 123, "p6": 0, "p7": 0},
        "controls": [
            {"key": "p1", "label": "Count", "type": "slider", "min": 1, "max": 16, "step": 1},
            {"key": "p2", "label": "Jitter", "type": "slider", "min": 0, "max": 1, "step": 0.01},
            {"key": "p3", "label": "Scale Min", "type": "slider", "min": 0.05, "max": 2, "step": 0.01},
            {"key": "p4", "label": "Scale Max", "type": "slider", "min": 0.05, "max": 2, "step": 0.01},
            {"key": "p5", "label": "Seed", "type": "slider", "min": 0, "max": 9999, "step": 1},
        ],
    },
    "LIBRARY_DISPLACE": {
        "id": 111,
        "name": "Library Displace",
        "cat": "MOD",
        "params": {"p1": 0.35, "p2": 3.0, "p3": 123, "p4": 0, "p5": 0, "p6": 0, "p7": 0},
        "controls": [
            {"key": "p1", "label": "Strength", "type": "slider", "min": 0, "max": 1, "step": 0.01},
            {"key": "p2", "label": "Scale", "type": "slider", "min": 0, "max": 10, "step": 0.1},
            {"key": "p3", "label": "Seed", "type": "slider", "min": 0, "max": 9999, "step": 1},
        ],
    },
    "GRUNGE_SCRATCH": {
        "id": 112,
        "name": "Grunge Scratch",
        "cat": "FILT",
        "params": {"p1": 0.45, "p2": 0.65, "p3": 0.4, "p4": 0.0, "p5": 0, "p6": 0, "p7": 0},
        "controls": [
            {"key": "p1", "label": "Density", "type": "slider", "min": 0, "max": 1, "step": 0.01},
            {"key": "p2", "label": "Scratch Length", "type": "slider", "min": 0, "max": 1, "step": 0.01},
            {"key": "p3", "label": "Speck Amount", "type": "slider", "min": 0, "max": 1, "step": 0.01},
            {"key": "p4", "label": "Fluidity", "type": "slider", "min": 0, "max": 1, "step": 0.01},
        ],
    },
}

STEP_MENU_GROUPS = [
    {"label": "GENERATORS", "keys": ["BASE_SHAPE", "BASE_GRAD"]},
    {"label": "NOISE / ERODE", "keys": ["NOISE_PERLIN", "NOISE_WORLEY"]},
    {
        "label": "FILTERS",
        "keys": [
            "THRESHOLD",
            "MORPH_DILATE_ERODE",
            "MORPH_OPEN_CLOSE",
            "EDGE_SOBEL",
            "OUTLINE_ALPHA",
            "POSTERIZE_ALPHA",
            "DISTANCE_BANDS",
            "GRUNGE_SCRATCH",
        ],
    },
    {
        "label": "MODIFIERS",
        "keys": [
            "FRACTAL",
            "SPIRAL",
            "VIGNETTE",
            "SMEAR",
            "DOMAIN_WARP",
            "RADIAL_WARP",
            "KALEIDOSCOPE_PLUS",
            "LIBRARY_STAMP_SCATTER",
            "LIBRARY_DISPLACE",
        ],
    },
    {"label": "UTILITY", "keys": ["BASIC"]},
]

OPERATION_EXPLANATIONS = {
    "BASE_SHAPE": "Creates a base alpha shape (filled or wireframe circle/square/triangle).",
    "BASE_GRAD": "Creates a directional gradient alpha mask using angle.",
    "NOISE_PERLIN": "Applies smooth fractal Perlin noise for organic breakup.",
    "NOISE_WORLEY": "Applies cellular noise for chunky breakup.",
    "THRESHOLD": "Converts soft alpha into hard black and white regions at a cutoff.",
    "FRACTAL": "Repeats radial wedges to create kaleidoscope symmetry.",
    "SPIRAL": "Warps source alpha around a center point with spiral twist.",
    "VIGNETTE": "Fades edges inward with circular or square falloff.",
    "BASIC": "Pass-through utility step.",
    "SMEAR": "Directional blur sampled along an angle and strength.",
    "DOMAIN_WARP": "Warps alpha sampling coordinates using procedural noise vectors.",
    "RADIAL_WARP": "Applies twirl, pinch, or bulge radial transform to alpha.",
    "KALEIDOSCOPE_PLUS": "Mirrors angular wedges for kaleidoscope symmetry.",
    "MORPH_DILATE_ERODE": "Expands or shrinks alpha regions by neighborhood sampling.",
    "MORPH_OPEN_CLOSE": "Smooths or fills alpha masks using morphology passes.",
    "EDGE_SOBEL": "Extracts edge alpha from gradient magnitude.",
    "OUTLINE_ALPHA": "Creates inner, outer, or dual outlines from alpha boundaries.",
    "POSTERIZE_ALPHA": "Quantizes alpha into discrete stepped levels.",
    "DISTANCE_BANDS": "Builds contour-like alpha bands from local distance cues.",
    "GRUNGE_SCRATCH": "Carves scratches and dust specks into the current alpha.",
    "LIBRARY_STAMP_SCATTER": "Scatters repeated alpha stamps with randomized placement and scale.",
    "LIBRARY_DISPLACE": "Displaces alpha sampling based on saved library alpha.",
}

DEFAULT_CUSTOM_OPERATION = """# Define custom_op(x, y, uvx, uvy, width, height, prev_sample)
def custom_op(x, y, uvx, uvy, width, height, prev_sample):
    dx = uvx - 0.5
    dy = uvy - 0.5
    dist = (dx * dx + dy * dy) ** 0.5
    return max(0.0, min(1.0, 1.0 - dist * 2.1))
"""

FILTER_MODULE_KEYS = [
    "NOISE_PERLIN",
    "NOISE_WORLEY",
    "THRESHOLD",
    "FRACTAL",
    "SPIRAL",
    "SMEAR",
    "VIGNETTE",
    "DOMAIN_WARP",
    "RADIAL_WARP",
    "KALEIDOSCOPE_PLUS",
    "MORPH_DILATE_ERODE",
    "MORPH_OPEN_CLOSE",
    "EDGE_SOBEL",
    "OUTLINE_ALPHA",
    "POSTERIZE_ALPHA",
    "DISTANCE_BANDS",
    "GRUNGE_SCRATCH",
    "LIBRARY_STAMP_SCATTER",
    "LIBRARY_DISPLACE",
]

MAX_GENERATION_WORKERS = 5
MAX_PACKAGING_WORKERS = 5
MAX_DELETE_HISTORY = 10
DEFAULT_PACK_RESOLUTIONS = [256, 512, 1024, 2048]


def get_default_blend_for_category(category: str) -> int:
    if category == "GEN":
        return 0
    if category == "ERODE":
        return 1
    return 2


def default_stack() -> list[dict]:
    return [
        {
            "id": "s1",
            "type_key": "BASE_SHAPE",
            "active": True,
            "blend_mode": 0,
            "params": deepcopy(STEP_TYPES["BASE_SHAPE"]["params"]),
            "universal": {"power": 1.0, "mult": 1.0, "scale": 1.0, "offsetX": 0.0, "offsetY": 0.0},
        }
    ]


def create_default_filter_modules() -> list[dict]:
    modules = []
    for index, key in enumerate(FILTER_MODULE_KEYS):
        step = STEP_TYPES[key]
        modules.append(
            {
                "id": f"fm-{key}-{index}",
                "key": key,
                "enabled": False,
                "expanded": False,
                "blend_mode": get_default_blend_for_category(step["cat"]),
                "params": deepcopy(step["params"]),
                "universal": {"power": 1.0, "mult": 1.0, "scale": 1.0, "offsetX": 0.0, "offsetY": 0.0},
            }
        )
    return modules


def default_quality_filters() -> dict:
    return {
        "alpha": {"enabled": True, "min": 0.05, "max": 0.75, "expanded": True},
        "similarity": {"enabled": False, "maxSimilarity": 0.9, "historySize": 200, "expanded": False},
        "shape": {
            "enabled": False,
            "minCircularity": 0.2,
            "maxCircularity": 1.0,
            "minSquareness": 0.2,
            "maxSquareness": 1.0,
            "expanded": False,
        },
        "temporalChange": {"enabled": True, "minChange": 0.04, "maxChange": 0.95, "maxJitter": 0.2, "expanded": True},
        "simplicity": {"enabled": False, "min": 0.1, "max": 0.9, "expanded": False},
    }


def default_pack_config() -> dict:
    return {
        "groupBy": "volume_fill",
        "groupDepth": 2,
        "maxItemsPerPack": 50,
        "sortBy": "none",
        "sortDir": "asc",
        "setNameOverrides": {},
    }


def default_dream_params() -> dict:
    return {
        "overdrive": 0.0,
        "generationWorkers": 5,
        "packagingWorkers": 5,
        "refineCycles": 1,
        "minDensity": 0.15,
        "maxDensity": 0.75,
        "minSimplicity": 0.1,
        "maxSimplicity": 0.9,
        "varianceStrictness": 0.1,
        "randStrength": 0.5,
        "flipFrames": 16,
        "prompt": "",
        "minComplexity": 5,
        "maxComplexity": 10,
        "resultFillMode": "slide",
    }


def default_ui_prefs() -> dict:
    return {"autoAnimateFrames": False, "useWorkbenchSeed": False}


def create_default_flipbook_config() -> dict:
    operations = {}
    for key, step in STEP_TYPES.items():
        params = {}
        for control in step["controls"]:
            if control["type"] != "slider":
                continue
            span = float(control["max"]) - float(control["min"])
            params[control["key"]] = {
                "enabled": False,
                "range": 24 if "angle" in control["label"].lower() else max(0.01, span * 0.08),
                "speed": 1.0,
                "phase": 0.0,
                "wave": "wrap",
            }
        operations[key] = {
            "enabled": False,
            "expanded": False,
            "speed": 1.0,
            "wave": "wrap",
            "universal": {
                "mult": {"enabled": False, "range": 0.05, "speed": 1.0, "phase": 0.11, "wave": "wrap"},
                "scale": {"enabled": False, "range": 0.02, "speed": 1.0, "phase": 0.29, "wave": "wrap"},
            },
            "params": params,
        }

    def enable(op_key: str, param_key: str, value: float, speed: float = 1.0, wave: str = "wrap", phase: float = 0.0) -> None:
        op = operations[op_key]
        op["enabled"] = True
        if param_key in {"mult", "scale"}:
            op["universal"][param_key] = {"enabled": True, "range": value, "speed": speed, "phase": phase, "wave": wave}
            return
        if param_key in op["params"]:
            op["params"][param_key] = {"enabled": True, "range": value, "speed": speed, "phase": phase, "wave": wave}

    enable("NOISE_PERLIN", "p6", 0.35)
    enable("NOISE_PERLIN", "p7", 0.35, phase=0.17)
    enable("NOISE_WORLEY", "p6", 0.28)
    enable("NOISE_WORLEY", "p7", 0.28, phase=0.17)
    enable("SPIRAL", "p1", 0.16, wave="pingpong")
    enable("SMEAR", "p2", 0.06, speed=0.8, wave="pingpong")
    enable("DOMAIN_WARP", "p3", 0.08, speed=0.9, wave="pingpong")
    enable("RADIAL_WARP", "p2", 0.2, speed=0.8, wave="pingpong")
    enable("LIBRARY_DISPLACE", "p1", 0.08, speed=0.8, wave="pingpong")
    enable("NOISE_PERLIN", "mult", 0.02, phase=0.11)
    enable("NOISE_PERLIN", "scale", 0.01, phase=0.29)
    enable("NOISE_WORLEY", "mult", 0.02, phase=0.11)
    enable("NOISE_WORLEY", "scale", 0.01, phase=0.29)

    return {
        "global": {"enabled": True, "frameCount": 16, "strength": 1.0, "baseSpeed": 1.0, "seedMode": "stable"},
        "quality": {
            "enabled": True,
            "minFrameDensity": 0.03,
            "maxEmptyFrameRatio": 0.25,
            "minTemporalChange": 0.12,
            "maxTemporalChange": 0.95,
            "maxJitter": 0.2,
            "minFrameDelta": 0.008,
            "maxFrameDelta": 0.2,
        },
        "operations": operations,
    }


def default_state() -> dict:
    return {
        "profileName": "Texture_01",
        "selectedRes": [2048],
        "stack": default_stack(),
        "library": [],
        "customOps": [],
        "filterModules": create_default_filter_modules(),
        "qualityFilters": default_quality_filters(),
        "packConfig": default_pack_config(),
        "flipbookConfig": create_default_flipbook_config(),
        "dreamParams": default_dream_params(),
        "uiPrefs": default_ui_prefs(),
        "deleteHistory": [],
        "lastDreamResults": [],
    }
