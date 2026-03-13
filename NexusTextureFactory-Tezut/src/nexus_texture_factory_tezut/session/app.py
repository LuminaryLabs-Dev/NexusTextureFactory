from __future__ import annotations

import json
import math
import random
import shutil
import zipfile
from copy import deepcopy
from datetime import UTC, datetime
from pathlib import Path

from PIL import Image

from ..analysis import analyze, image_hash, temporal_metrics
from ..catalog import (
    BLEND_MODES,
    DEFAULT_CUSTOM_OPERATION,
    DEFAULT_PACK_RESOLUTIONS,
    FILTER_MODULE_KEYS,
    MAX_DELETE_HISTORY,
    MAX_GENERATION_WORKERS,
    MAX_PACKAGING_WORKERS,
    OPERATION_EXPLANATIONS,
    STEP_MENU_GROUPS,
    STEP_TYPES,
    default_state,
    get_default_blend_for_category,
)
from ..render.engine import TextureEngine
from ..storage import TezutStorage


class TezutApp:
    def __init__(self, storage: TezutStorage | None = None) -> None:
        self.storage = storage or TezutStorage()
        self.engine = TextureEngine()
        self.state = self.storage.load_state()

    def save(self) -> None:
        self.storage.save_state(self.state)

    def reset_stack(self) -> dict:
        defaults = default_state()
        self.state["stack"] = defaults["stack"]
        self.save()
        return {"ok": True, "stack": self.state["stack"]}

    def _new_step_id(self) -> str:
        return f"s{len(self.state['stack']) + 1}-{int(datetime.now(UTC).timestamp() * 1000)}-{random.randint(1000, 9999)}"

    def _resolve_step_type(self, type_key: str) -> dict:
        if type_key in STEP_TYPES:
            return STEP_TYPES[type_key]
        if type_key.startswith("CUSTOM:"):
            for op in self.state["customOps"]:
                if op["id"] == type_key.split(":", 1)[1]:
                    return {
                        "id": 5000,
                        "name": op["title"],
                        "cat": "MOD",
                        "params": {"p1": 0, "p2": 0, "p3": 0, "p4": 0, "p5": 0, "p6": 0, "p7": 0},
                        "controls": [],
                    }
        raise ValueError(f"unknown step type {type_key}")

    def add_step(self, type_key: str, after: int | None = None) -> dict:
        step_def = self._resolve_step_type(type_key)
        step = {
            "id": self._new_step_id(),
            "type_key": type_key,
            "active": True,
            "blend_mode": get_default_blend_for_category(step_def["cat"]),
            "params": deepcopy(step_def["params"]),
            "universal": {"power": 1.0, "mult": 1.0, "scale": 1.0, "offsetX": 0.0, "offsetY": 0.0},
        }
        if after is None or after >= len(self.state["stack"]) - 1:
            self.state["stack"].append(step)
        else:
            self.state["stack"].insert(max(0, after + 1), step)
        self.save()
        return step

    def move_step(self, from_index: int, to_index: int) -> list[dict]:
        stack = self.state["stack"]
        step = stack.pop(from_index)
        stack.insert(to_index, step)
        self.save()
        return stack

    def delete_step(self, index: int) -> list[dict]:
        self.state["stack"].pop(index)
        if not self.state["stack"]:
            self.state["stack"] = default_state()["stack"]
        self.save()
        return self.state["stack"]

    def toggle_step(self, index: int, active: bool | None = None) -> dict:
        step = self.state["stack"][index]
        step["active"] = (not step["active"]) if active is None else bool(active)
        self.save()
        return step

    def update_step(self, index: int, params: dict | None = None, universal: dict | None = None, blend_mode: int | None = None) -> dict:
        step = self.state["stack"][index]
        if params:
            step["params"].update(params)
        if universal:
            step["universal"].update(universal)
        if blend_mode is not None:
            step["blend_mode"] = int(blend_mode)
        self.save()
        return step

    def export_stack(self, path: Path) -> dict:
        payload = {
            "profileName": self.state["profileName"],
            "selectedRes": self.state["selectedRes"],
            "stack": self.state["stack"],
        }
        path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        return {"path": str(path.resolve()), "stepCount": len(self.state["stack"])}

    def load_stack(self, path: Path) -> dict:
        payload = json.loads(path.read_text(encoding="utf-8"))
        self.state["profileName"] = payload.get("profileName", self.state["profileName"])
        self.state["selectedRes"] = payload.get("selectedRes", self.state["selectedRes"])
        self.state["stack"] = payload.get("stack", self.state["stack"])
        self.save()
        return {"ok": True, "stack": self.state["stack"]}

    def _library_images(self) -> list[Image.Image]:
        images: list[Image.Image] = []
        for item in self.state["library"][:8]:
            path = Path(item["artifactPath"])
            if path.exists():
                images.append(Image.open(path).convert("L"))
        return images

    def render_current_stack(self, size: int = 256, out: Path | None = None) -> dict:
        previews = self.engine.render_stack(self.state["stack"], custom_ops=self.state["customOps"], library_images=self._library_images(), size=size)
        image = previews[-1]
        artifact_path = out or self.storage.artifact_path("preview", f"stack-preview-{size}.png")
        self.engine.save(image, artifact_path)
        return {"artifactPath": str(artifact_path.resolve()), "stepCount": len(previews), "size": size}

    def _control_bounds(self, type_key: str, param_key: str) -> tuple[float, float] | None:
        if type_key not in STEP_TYPES:
            return None
        for control in STEP_TYPES[type_key]["controls"]:
            if control["key"] == param_key and control["type"] == "slider":
                return float(control["min"]), float(control["max"])
        return None

    def _vary_step(self, step: dict, rng: random.Random, strength: float) -> dict:
        clone = deepcopy(step)
        type_key = clone["type_key"]
        for param_key, value in clone["params"].items():
            bounds = self._control_bounds(type_key, param_key)
            if not bounds:
                continue
            low, high = bounds
            span = high - low
            delta = rng.uniform(-span * 0.25, span * 0.25) * strength
            clone["params"][param_key] = max(low, min(high, float(value) + delta))
        clone["id"] = self._new_step_id()
        return clone

    def _random_step(self, rng: random.Random) -> dict:
        type_key = rng.choice(FILTER_MODULE_KEYS + ["BASE_SHAPE", "BASE_GRAD", "GRUNGE_SCRATCH"])
        step = self.add_step(type_key)
        self.state["stack"].pop()
        return self._vary_step(step, rng, 1.0)

    def _build_candidate_stack(self, rng: random.Random) -> list[dict]:
        params = self.state["dreamParams"]
        complexity = rng.randint(int(params["minComplexity"]), int(params["maxComplexity"]))
        base = []
        if self.state["uiPrefs"].get("useWorkbenchSeed"):
            base = [deepcopy(step) for step in self.state["stack"] if step.get("active", True)]
        if not base:
            base = [deepcopy(default_state()["stack"][0])]
        for step in base:
            step["id"] = self._new_step_id()
        while len(base) < complexity:
            base.append(self._random_step(rng))
        enabled_modules = [module for module in self.state["filterModules"] if module.get("enabled")]
        for module in enabled_modules:
            base.append(
                {
                    "id": self._new_step_id(),
                    "type_key": module["key"],
                    "active": True,
                    "blend_mode": module.get("blend_mode", get_default_blend_for_category(STEP_TYPES[module["key"]]["cat"])),
                    "params": deepcopy(module["params"]),
                    "universal": deepcopy(module["universal"]),
                }
            )
        return [self._vary_step(step, rng, float(params.get("randStrength", 0.5))) for step in base]

    def _flipbook_pass(self, stack: list[dict], size: int) -> dict:
        config = deepcopy(self.state["flipbookConfig"])
        config["global"]["frameCount"] = min(4, int(config["global"].get("frameCount", 16)))
        frames = self.engine.render_frames(stack, config, custom_ops=self.state["customOps"], library_images=self._library_images(), size=size)
        return temporal_metrics(frames)

    def _passes_quality(self, metrics: dict, seen_hashes: list[str], temporal: dict | None) -> tuple[bool, str]:
        filters = self.state["qualityFilters"]
        alpha_filter = filters["alpha"]
        if alpha_filter["enabled"] and not (alpha_filter["min"] <= metrics["density"] <= alpha_filter["max"]):
            return False, "alpha"
        simplicity = filters["simplicity"]
        if simplicity["enabled"] and not (simplicity["min"] <= metrics["sScore"] <= simplicity["max"]):
            return False, "simplicity"
        shape = filters["shape"]
        if shape["enabled"]:
            if not (shape["minCircularity"] <= metrics["circularity"] <= shape["maxCircularity"]):
                return False, "shape"
            if not (shape["minSquareness"] <= metrics["squareness"] <= shape["maxSquareness"]):
                return False, "shape"
        similarity = filters["similarity"]
        if similarity["enabled"] and metrics["hash"] in seen_hashes[-int(similarity["historySize"]) :]:
            return False, "similarity"
        temporal_filter = filters["temporalChange"]
        if temporal_filter["enabled"] and temporal is not None:
            if not (temporal_filter["minChange"] <= temporal["changeScore"] <= temporal_filter["maxChange"]):
                return False, "temporal"
            if temporal["jitterScore"] > temporal_filter["maxJitter"]:
                return False, "temporal"
        return True, ""

    def _artifact_name(self, prefix: str) -> str:
        stamp = datetime.now(UTC).strftime("%Y%m%dT%H%M%S%f")
        return f"{prefix}-{stamp}"

    def dream_run(
        self,
        count: int,
        preview_size: int = 256,
        until_total: int | None = None,
        auto_pack: bool = False,
        auto_flipbooks: bool = False,
        preview_each_success: bool = False,
        success_preview_size: int = 96,
    ) -> dict:
        initial_library_count = len(self.state["library"])
        requested_count = count
        if until_total is not None:
            count = max(0, int(until_total) - initial_library_count)
        rng = random.Random(self.state["dreamParams"].get("prompt", "") + self.state["profileName"])
        accepted = []
        rejected = []
        seen_hashes = [item.get("hash") for item in self.state["library"] if item.get("hash")]
        fallback_candidates = []
        attempts = 0
        max_attempts = max(count * 4, count, 1)
        while len(accepted) < count and attempts < max_attempts:
            attempts += 1
            stack = self._build_candidate_stack(rng)
            image = self.engine.render_stack(stack, custom_ops=self.state["customOps"], library_images=self._library_images(), size=preview_size)[-1]
            metrics = analyze(image)
            passed, reason = self._passes_quality(metrics, seen_hashes, None)
            temporal = None
            if passed:
                temporal = self._flipbook_pass(stack, 48)
                passed, reason = self._passes_quality(metrics, seen_hashes, temporal)
            if not passed:
                if metrics["density"] > 0.02:
                    fallback_candidates.append({"stack": stack, "image": image.copy(), "metrics": metrics, "temporal": temporal, "reason": reason})
                rejected.append({"reason": reason, "metrics": metrics})
                continue
            item = self._persist_dream_result(
                stack,
                image,
                metrics,
                temporal,
                fallback=False,
                preview_each_success=preview_each_success,
                success_preview_size=success_preview_size,
            )
            accepted.append(item)
            seen_hashes.append(metrics["hash"])
        while len(accepted) < count and fallback_candidates:
            fallback_candidate = fallback_candidates.pop(0)
            item = self._persist_dream_result(
                fallback_candidate["stack"],
                fallback_candidate["image"],
                fallback_candidate["metrics"],
                fallback_candidate["temporal"],
                fallback=True,
                fallback_reason=fallback_candidate["reason"],
                preview_each_success=preview_each_success,
                success_preview_size=success_preview_size,
            )
            accepted.append(item)
        self.state["library"].extend(accepted)
        self.state["lastDreamResults"] = accepted
        self.save()
        preview_path = accepted[0]["artifactPath"] if accepted else None
        payload = {
            "acceptedCount": len(accepted),
            "rejectedCount": len(rejected),
            "attemptedCount": attempts,
            "requestedCount": requested_count,
            "targetTotal": until_total,
            "initialLibraryCount": initial_library_count,
            "finalLibraryCount": len(self.state["library"]),
            "previewPath": preview_path,
            "previewPaths": [item.get("successPreviewPath") for item in accepted if item.get("successPreviewPath")],
            "results": accepted,
            "rejected": rejected,
        }
        if auto_pack and self.state["library"]:
            payload["autoPack"] = self.auto_pack_latest(include_flipbook=auto_flipbooks)
        return payload

    def _persist_dream_result(
        self,
        stack: list[dict],
        image: Image.Image,
        metrics: dict,
        temporal: dict | None,
        fallback: bool,
        fallback_reason: str | None = None,
        preview_each_success: bool = False,
        success_preview_size: int = 96,
    ) -> dict:
        artifact_id = self._artifact_name("dream")
        artifact_path = self.storage.artifact_path("dream", f"{artifact_id}.png")
        self.engine.save(image, artifact_path)
        payload = {
            "id": artifact_id,
            "name": f"{self.state['profileName']}_{artifact_id[-6:]}",
            "artifactPath": str(artifact_path.resolve()),
            "stack": stack,
            "metrics": metrics,
            "density": metrics["density"],
            "sScore": metrics["sScore"],
            "circularity": metrics["circularity"],
            "squareness": metrics["squareness"],
            "hash": metrics["hash"],
            "prompt": self.state["dreamParams"].get("prompt", ""),
            "createdAt": datetime.now(UTC).isoformat(),
            "requestedGenerationWorkers": min(MAX_GENERATION_WORKERS, int(self.state["dreamParams"].get("generationWorkers", 1))),
            "requestedPackagingWorkers": min(MAX_PACKAGING_WORKERS, int(self.state["dreamParams"].get("packagingWorkers", 1))),
            "temporal": temporal,
            "fallbackAccepted": fallback,
            "fallbackReason": fallback_reason,
        }
        if preview_each_success:
            preview_image = image.resize((success_preview_size, success_preview_size))
            preview_path = self.storage.artifact_path("dream-previews", f"{artifact_id}-{success_preview_size}.png")
            self.engine.save(preview_image, preview_path)
            payload["successPreviewPath"] = str(preview_path.resolve())
        return payload

    def _get_library_item(self, item_id: str) -> dict:
        for item in self.state["library"]:
            if item["id"] == item_id:
                return item
        raise ValueError(f"unknown library item {item_id}")

    def preview_item(self, item_id: str) -> dict:
        item = self._get_library_item(item_id)
        return {"itemId": item["id"], "artifactPath": item["artifactPath"], "name": item["name"]}

    def list_operations(self) -> dict:
        return {"blendModes": BLEND_MODES, "groups": STEP_MENU_GROUPS, "operations": STEP_TYPES, "explanations": OPERATION_EXPLANATIONS}

    def add_custom_op(self, title: str, code: str, description: str = "") -> dict:
        artifact_id = self._artifact_name("custom")
        item = {"id": artifact_id, "title": title, "description": description, "kind": "python", "code": code or DEFAULT_CUSTOM_OPERATION}
        self.state["customOps"].append(item)
        self.save()
        return item

    def validate_custom_op(self, op_id: str, size: int = 128) -> dict:
        for op in self.state["customOps"]:
            if op["id"] != op_id:
                continue
            temp_stack = [deepcopy(default_state()["stack"][0]), {"id": self._new_step_id(), "type_key": f"CUSTOM:{op_id}", "active": True, "blend_mode": 0, "params": {"p1": 0, "p2": 0, "p3": 0, "p4": 0, "p5": 0, "p6": 0, "p7": 0}, "universal": {"power": 1.0, "mult": 1.0, "scale": 1.0, "offsetX": 0.0, "offsetY": 0.0}}]
            image = self.engine.render_stack(temp_stack, custom_ops=self.state["customOps"], size=size)[-1]
            artifact_path = self.storage.artifact_path("custom", f"{op_id}-validation.png")
            self.engine.save(image, artifact_path)
            return {"artifactPath": str(artifact_path.resolve()), "metrics": analyze(image)}
        raise ValueError(f"unknown custom op {op_id}")

    def update_quality_filter(self, category: str, field: str, value: float | bool | int) -> dict:
        self.state["qualityFilters"][category][field] = value
        self.save()
        return self.state["qualityFilters"][category]

    def update_filter_module(self, key: str, enabled: bool | None = None, params: dict | None = None, universal: dict | None = None, blend_mode: int | None = None) -> dict:
        for module in self.state["filterModules"]:
            if module["key"] != key:
                continue
            if enabled is not None:
                module["enabled"] = bool(enabled)
            if params:
                module["params"].update(params)
            if universal:
                module["universal"].update(universal)
            if blend_mode is not None:
                module["blend_mode"] = int(blend_mode)
            self.save()
            return module
        raise ValueError(f"unknown filter module {key}")

    def update_flipbook(self, domain: str, key: str, value) -> dict:
        self.state["flipbookConfig"][domain][key] = value
        self.save()
        return self.state["flipbookConfig"][domain]

    def update_flipbook_operation(self, op_key: str, param_key: str | None = None, values: dict | None = None, universal_key: str | None = None) -> dict:
        op = self.state["flipbookConfig"]["operations"][op_key]
        if param_key:
            op["params"][param_key].update(values or {})
        elif universal_key:
            op["universal"][universal_key].update(values or {})
        else:
            op.update(values or {})
        self.save()
        return op

    def set_config_value(self, domain: str, key: str, value) -> dict:
        self.state[domain][key] = value
        self.save()
        return self.state[domain]

    def _sort_items(self, items: list[dict]) -> list[dict]:
        cfg = self.state["packConfig"]
        sort_by = cfg.get("sortBy", "none")
        if sort_by == "none":
            return list(items)
        reverse = cfg.get("sortDir", "asc") == "desc"

        def sort_value(item: dict):
            if sort_by == "name":
                return item["name"]
            if sort_by == "density":
                return item.get("density", 0)
            if sort_by == "simplicity":
                return item.get("sScore", 0)
            if sort_by == "circularity":
                return item.get("circularity", 0)
            if sort_by == "squareness":
                return item.get("squareness", 0)
            return item["name"]

        return sorted(items, key=sort_value, reverse=reverse)

    def compute_sets(self) -> list[dict]:
        cfg = self.state["packConfig"]
        group_by = cfg.get("groupBy", "volume_fill")
        group_depth = max(1, int(cfg.get("groupDepth", 2)))
        max_items = max(1, int(cfg.get("maxItemsPerPack", 50)))
        grouped: dict[str, list[dict]] = {}
        for item in self._sort_items(self.state["library"]):
            if group_by == "volume_fill":
                key = "__all__"
            else:
                parts = item["name"].split("_")
                if group_by == "full":
                    key = item["name"]
                elif group_by == "shape_variant":
                    key = "_".join(parts[:2]) if len(parts) > 1 else item["name"]
                else:
                    key = "_".join(parts[:group_depth]) if parts else item["name"]
            grouped.setdefault(key, []).append(item)
        sets = []
        for key, items in grouped.items():
            if group_by == "volume_fill":
                for index in range(0, len(items), max_items):
                    volume = index // max_items + 1
                    set_id = f"volume_{volume}"
                    set_name = self.state["packConfig"]["setNameOverrides"].get(set_id, f"Volume {volume}")
                    sets.append({"id": set_id, "name": set_name, "items": items[index : index + max_items]})
            else:
                for index in range(0, len(items), max_items):
                    slice_index = index // max_items + 1
                    set_id = f"{key}:{slice_index}"
                    set_name = self.state["packConfig"]["setNameOverrides"].get(set_id, key)
                    sets.append({"id": set_id, "name": set_name, "items": items[index : index + max_items]})
        return sets

    def reorder_set_item(self, set_id: str, from_index: int, to_index: int) -> dict:
        cfg = self.state["packConfig"]
        if cfg.get("groupBy") != "volume_fill" or cfg.get("sortBy") != "none":
            raise ValueError("manual reorder is only enabled for volume_fill with sortBy=none")
        target_set = next((item for item in self.compute_sets() if item["id"] == set_id), None)
        if target_set is None:
            raise ValueError(f"unknown set {set_id}")
        item = target_set["items"][from_index]
        library_ids = [entry["id"] for entry in self.state["library"]]
        current_index = library_ids.index(item["id"])
        volume_start = library_ids.index(target_set["items"][0]["id"])
        new_index = volume_start + to_index
        moved = self.state["library"].pop(current_index)
        self.state["library"].insert(new_index, moved)
        self.save()
        return {"setId": set_id, "itemId": item["id"], "toIndex": to_index}

    def rename_set(self, set_id: str, new_name: str) -> dict:
        self.state["packConfig"]["setNameOverrides"][set_id] = new_name
        self.save()
        return {"setId": set_id, "name": new_name}

    def delete_item(self, item_id: str) -> dict:
        removed = None
        next_library = []
        for item in self.state["library"]:
            if item["id"] == item_id:
                removed = item
            else:
                next_library.append(item)
        if removed is None:
            raise ValueError(f"unknown library item {item_id}")
        self.state["library"] = next_library
        self.state["deleteHistory"].append(removed)
        self.state["deleteHistory"] = self.state["deleteHistory"][-MAX_DELETE_HISTORY:]
        self.save()
        return {"deleted": removed["id"]}

    def delete_set(self, set_id: str) -> dict:
        target = next((item for item in self.compute_sets() if item["id"] == set_id), None)
        if target is None:
            raise ValueError(f"unknown set {set_id}")
        remove_ids = {item["id"] for item in target["items"]}
        removed = [item for item in self.state["library"] if item["id"] in remove_ids]
        self.state["library"] = [item for item in self.state["library"] if item["id"] not in remove_ids]
        self.state["deleteHistory"].append({"setId": set_id, "items": removed})
        self.state["deleteHistory"] = self.state["deleteHistory"][-MAX_DELETE_HISTORY:]
        self.save()
        return {"deletedSet": set_id, "deletedCount": len(removed)}

    def delete_all_sets(self) -> dict:
        count = len(self.state["library"])
        self.state["deleteHistory"].append({"setId": "all", "items": list(self.state["library"])})
        self.state["deleteHistory"] = self.state["deleteHistory"][-MAX_DELETE_HISTORY:]
        self.state["library"] = []
        self.save()
        return {"deletedCount": count}

    def export_set(self, set_id: str, out: Path | None = None, include_flipbook: bool = True, resolutions: list[int] | None = None) -> dict:
        target = next((item for item in self.compute_sets() if item["id"] == set_id), None)
        if target is None:
            raise ValueError(f"unknown set {set_id}")
        artifact_dir = self.storage.artifact_path("exports")
        staging = artifact_dir / f"{set_id}-staging"
        if staging.exists():
            shutil.rmtree(staging)
        staging.mkdir(parents=True, exist_ok=True)
        selected_res = [int(value) for value in (resolutions or self.state["selectedRes"])]
        for resolution in selected_res:
            folder = staging / f"{target['name'].replace(' ', '')}_{resolution}"
            folder.mkdir(parents=True, exist_ok=True)
            for index, item in enumerate(target["items"], start=1):
                image = Image.open(item["artifactPath"]).convert("L").resize((resolution, resolution))
                image.save(folder / f"{target['name'].replace(' ', '')}_{index:02d}_x{resolution}.png")
        flipbook_paths = []
        if include_flipbook:
            for index, item in enumerate(target["items"], start=1):
                frames = self.engine.render_frames(item["stack"], self.state["flipbookConfig"], custom_ops=self.state["customOps"], library_images=self._library_images(), size=128)
                frame_dir = staging / "flipbooks" / f"{index:02d}"
                frame_dir.mkdir(parents=True, exist_ok=True)
                for frame_index, frame in enumerate(frames, start=1):
                    frame_path = frame_dir / f"frame_{frame_index:02d}.png"
                    frame.save(frame_path)
                    flipbook_paths.append(str(frame_path.resolve()))
        zip_path = out or self.storage.artifact_path("exports", f"{set_id}.zip")
        with zipfile.ZipFile(zip_path, "w") as archive:
            for file_path in staging.rglob("*"):
                if file_path.is_file():
                    archive.write(file_path, arcname=file_path.relative_to(staging))
        return {"setId": set_id, "zipPath": str(zip_path.resolve()), "flipbookPaths": flipbook_paths, "resolutions": selected_res}

    def auto_pack_latest(self, include_flipbook: bool = False) -> dict:
        exports = []
        for target_set in self.compute_sets():
            exports.append(
                self.export_set(
                    target_set["id"],
                    out=self.storage.artifact_path("exports", f"{target_set['id']}.zip"),
                    include_flipbook=include_flipbook,
                    resolutions=DEFAULT_PACK_RESOLUTIONS,
                )
            )
        return {
            "setCount": len(exports),
            "includeFlipbooks": include_flipbook,
            "resolutions": DEFAULT_PACK_RESOLUTIONS,
            "exports": exports,
        }
