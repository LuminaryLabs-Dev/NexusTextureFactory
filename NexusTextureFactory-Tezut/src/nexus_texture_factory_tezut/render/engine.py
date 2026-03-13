from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps

from ..catalog import STEP_TYPES


def clamp(value: float, minimum: float = 0.0, maximum: float = 1.0) -> float:
    return max(minimum, min(maximum, value))


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def smoothstep(edge0: float, edge1: float, value: float) -> float:
    if edge1 == edge0:
        return 0.0
    t = clamp((value - edge0) / (edge1 - edge0))
    return t * t * (3.0 - 2.0 * t)


def hash_float(*parts: float) -> float:
    total = 0.0
    for index, part in enumerate(parts, start=1):
        total += math.sin(part * (12.9898 + index * 17.123) + index * 78.233) * 43758.5453
    return total - math.floor(total)


def bilinear_sample(image: Image.Image, uvx: float, uvy: float) -> int:
    if uvx < 0.0 or uvx > 1.0 or uvy < 0.0 or uvy > 1.0:
        return 0
    width, height = image.size
    x = clamp(uvx) * (width - 1)
    y = clamp(uvy) * (height - 1)
    x0 = int(math.floor(x))
    y0 = int(math.floor(y))
    x1 = min(width - 1, x0 + 1)
    y1 = min(height - 1, y0 + 1)
    tx = x - x0
    ty = y - y0
    px = image.load()
    top = lerp(px[x0, y0], px[x1, y0], tx)
    bottom = lerp(px[x0, y1], px[x1, y1], tx)
    return int(lerp(top, bottom, ty))


def map_uv(uvx: float, uvy: float, universal: dict) -> tuple[float, float]:
    scale = max(0.001, float(universal.get("scale", 1.0)))
    return ((uvx - 0.5) / scale + 0.5 - float(universal.get("offsetX", 0.0)), (uvy - 0.5) / scale + 0.5 - float(universal.get("offsetY", 0.0)))


def new_canvas(size: int) -> Image.Image:
    return Image.new("L", (size, size), color=0)


def apply_universal_levels(image: Image.Image, universal: dict) -> Image.Image:
    power = max(0.001, float(universal.get("power", 1.0)))
    mult = float(universal.get("mult", 1.0))
    pixels = [int(clamp((pow(value / 255.0, power)) * mult) * 255) for value in image.getdata()]
    out = new_canvas(image.size[0])
    out.putdata(pixels)
    return out


def transform_prev(prev: Image.Image, universal: dict) -> Image.Image:
    size = prev.size[0]
    out = new_canvas(size)
    values = []
    for y in range(size):
        uvy = y / max(1, size - 1)
        for x in range(size):
            uvx = x / max(1, size - 1)
            mapped = map_uv(uvx, uvy, universal)
            values.append(bilinear_sample(prev, *mapped))
    out.putdata(values)
    return out


def make_base_shape(size: int, params: dict, universal: dict) -> Image.Image:
    image = new_canvas(size)
    draw = ImageDraw.Draw(image)
    shape_type = int(round(float(params.get("p1", 0))))
    shape_size = float(params.get("p2", 0.8))
    softness = float(params.get("p3", 0.02))
    thickness = max(1, int(round(float(params.get("p4", 0.05)) * size)))
    margin = int((1.0 - shape_size) * size * 0.5)
    bbox = (margin, margin, size - margin, size - margin)
    if shape_type in {0, 3}:
        draw.ellipse(bbox, outline=255 if shape_type >= 3 else None, fill=255 if shape_type < 3 else None, width=thickness)
    elif shape_type in {1, 4}:
        draw.rectangle(bbox, outline=255 if shape_type >= 3 else None, fill=255 if shape_type < 3 else None, width=thickness)
    else:
        points = [(size // 2, margin), (size - margin, size - margin), (margin, size - margin)]
        draw.polygon(points, outline=255 if shape_type >= 3 else None, fill=255 if shape_type < 3 else None, width=thickness)
    if softness > 0:
        image = image.filter(ImageFilter.GaussianBlur(radius=max(0.1, softness * size * 0.15)))
    return apply_universal_levels(image, universal)


def make_gradient(size: int, params: dict, universal: dict) -> Image.Image:
    angle = math.radians(float(params.get("p1", 0.0)))
    dx = math.cos(angle)
    dy = math.sin(angle)
    values = []
    for y in range(size):
        uvy = y / max(1, size - 1)
        for x in range(size):
            uvx = x / max(1, size - 1)
            mapped_x, mapped_y = map_uv(uvx, uvy, universal)
            val = clamp((mapped_x - 0.5) * dx + (mapped_y - 0.5) * dy + 0.5)
            values.append(int(val * 255))
    image = new_canvas(size)
    image.putdata(values)
    return apply_universal_levels(image, universal)


def value_noise(uvx: float, uvy: float, scale: float, seed: float) -> float:
    sx = uvx * scale + seed * 0.013
    sy = uvy * scale + seed * 0.029
    x0 = math.floor(sx)
    y0 = math.floor(sy)
    fx = sx - x0
    fy = sy - y0
    n00 = hash_float(x0, y0, seed)
    n10 = hash_float(x0 + 1, y0, seed)
    n01 = hash_float(x0, y0 + 1, seed)
    n11 = hash_float(x0 + 1, y0 + 1, seed)
    ux = fx * fx * (3.0 - 2.0 * fx)
    uy = fy * fy * (3.0 - 2.0 * fy)
    return lerp(lerp(n00, n10, ux), lerp(n01, n11, ux), uy)


def make_perlin(size: int, params: dict, universal: dict) -> Image.Image:
    scale = float(params.get("p1", 4.0))
    seed = float(params.get("p2", 0.0))
    octaves = max(1, int(round(float(params.get("p3", 4)))))
    rolloff = float(params.get("p4", 0.5))
    offx = float(params.get("p6", 0.0))
    offy = float(params.get("p7", 0.0))
    values = []
    for y in range(size):
        uvy = y / max(1, size - 1)
        for x in range(size):
            uvx = x / max(1, size - 1)
            mapped_x, mapped_y = map_uv(uvx, uvy, universal)
            total = 0.0
            amp = 1.0
            amp_total = 0.0
            freq = max(0.1, scale)
            for octave in range(octaves):
                total += value_noise(mapped_x + offx, mapped_y + offy, freq, seed + octave * 31.0) * amp
                amp_total += amp
                freq *= 2.0
                amp *= rolloff
            val = total / max(0.0001, amp_total)
            values.append(int(clamp(val) * 255))
    image = new_canvas(size)
    image.putdata(values)
    return apply_universal_levels(image, universal)


def worley_value(uvx: float, uvy: float, scale: float, seed: float, jitter: float) -> float:
    px = uvx * scale + seed * 0.017
    py = uvy * scale + seed * 0.031
    cx = math.floor(px)
    cy = math.floor(py)
    best = 10.0
    for oy in (-1, 0, 1):
        for ox in (-1, 0, 1):
            cell_x = cx + ox
            cell_y = cy + oy
            point_x = cell_x + hash_float(cell_x, cell_y, seed) * jitter
            point_y = cell_y + hash_float(cell_y, cell_x, seed + 17.0) * jitter
            dx = point_x - px
            dy = point_y - py
            best = min(best, math.sqrt(dx * dx + dy * dy))
    return clamp(best)


def make_worley(size: int, params: dict, universal: dict) -> Image.Image:
    scale = max(0.1, float(params.get("p1", 4.0)))
    seed = float(params.get("p2", 0.0))
    jitter = max(0.01, float(params.get("p3", 1.0)))
    invert = float(params.get("p4", 0.0)) > 0.5
    offx = float(params.get("p6", 0.0))
    offy = float(params.get("p7", 0.0))
    values = []
    for y in range(size):
        uvy = y / max(1, size - 1)
        for x in range(size):
            uvx = x / max(1, size - 1)
            mapped_x, mapped_y = map_uv(uvx + offx, uvy + offy, universal)
            val = worley_value(mapped_x, mapped_y, scale, seed, jitter)
            val = 1.0 - val if invert else val
            values.append(int(clamp(val) * 255))
    image = new_canvas(size)
    image.putdata(values)
    return apply_universal_levels(image, universal)


def remap_prev(prev: Image.Image, size: int, sampler) -> Image.Image:
    out = new_canvas(size)
    values = []
    for y in range(size):
        uvy = y / max(1, size - 1)
        for x in range(size):
            uvx = x / max(1, size - 1)
            sample_uv = sampler(uvx, uvy)
            values.append(bilinear_sample(prev, *sample_uv))
    out.putdata(values)
    return out


def apply_threshold(prev: Image.Image, params: dict, universal: dict) -> Image.Image:
    transformed = transform_prev(prev, universal)
    cutoff = float(params.get("p1", 0.5)) * 255.0
    values = [255 if value >= cutoff else 0 for value in transformed.getdata()]
    out = new_canvas(prev.size[0])
    out.putdata(values)
    return apply_universal_levels(out, universal)


def apply_fractal(prev: Image.Image, params: dict, universal: dict) -> Image.Image:
    segments = max(1.0, float(params.get("p1", 6.0)))
    return apply_universal_levels(
        remap_prev(
            prev,
            prev.size[0],
            lambda uvx, uvy: (
                0.5 + math.cos(abs(((math.atan2(uvy - 0.5, uvx - 0.5) % (2 * math.pi / segments)) - math.pi / segments)) * 1.0) * math.dist((uvx, uvy), (0.5, 0.5)),
                0.5 + math.sin(abs(((math.atan2(uvy - 0.5, uvx - 0.5) % (2 * math.pi / segments)) - math.pi / segments)) * 1.0) * math.dist((uvx, uvy), (0.5, 0.5)),
            ),
        ),
        universal,
    )


def apply_spiral(prev: Image.Image, params: dict, universal: dict) -> Image.Image:
    twist = float(params.get("p1", 0.5))
    cx = float(params.get("p4", 0.5))
    cy = float(params.get("p5", 0.5))
    transformed = transform_prev(prev, universal)

    def sampler(uvx: float, uvy: float) -> tuple[float, float]:
        dx = uvx - cx
        dy = uvy - cy
        radius = math.sqrt(dx * dx + dy * dy)
        angle = math.atan2(dy, dx) + twist * (1.0 - clamp(radius)) * math.tau
        return cx + math.cos(angle) * radius, cy + math.sin(angle) * radius

    return apply_universal_levels(remap_prev(transformed, prev.size[0], sampler), universal)


def apply_vignette(size: int, params: dict, universal: dict) -> Image.Image:
    square = float(params.get("p1", 0.0)) > 0.5
    v_size = float(params.get("p2", 0.45))
    softness = float(params.get("p3", 0.2))
    values = []
    for y in range(size):
        uvy = y / max(1, size - 1)
        for x in range(size):
            uvx = x / max(1, size - 1)
            mapped_x, mapped_y = map_uv(uvx, uvy, universal)
            if square:
                distance = max(abs(mapped_x - 0.5), abs(mapped_y - 0.5))
            else:
                distance = math.dist((mapped_x, mapped_y), (0.5, 0.5))
            val = 1.0 - smoothstep(v_size - softness, v_size, distance)
            values.append(int(clamp(val) * 255))
    image = new_canvas(size)
    image.putdata(values)
    return apply_universal_levels(image, universal)


def apply_smear(prev: Image.Image, params: dict, universal: dict) -> Image.Image:
    transformed = transform_prev(prev, universal)
    angle = math.radians(float(params.get("p1", 0.0)))
    strength = float(params.get("p2", 0.1))
    dx = math.cos(angle) * strength * 0.2
    dy = math.sin(angle) * strength * 0.2

    def sampler(uvx: float, uvy: float) -> tuple[float, float]:
        return uvx, uvy

    out = new_canvas(prev.size[0])
    values = []
    for y in range(prev.size[0]):
        uvy = y / max(1, prev.size[0] - 1)
        for x in range(prev.size[0]):
            uvx = x / max(1, prev.size[0] - 1)
            total = 0
            count = 8
            for sample_index in range(count):
                t = (sample_index / max(1, count - 1)) - 0.5
                total += bilinear_sample(transformed, uvx + dx * t, uvy + dy * t)
            values.append(int(total / count))
    out.putdata(values)
    return apply_universal_levels(out, universal)


def apply_domain_warp(prev: Image.Image, params: dict, universal: dict) -> Image.Image:
    transformed = transform_prev(prev, universal)
    scale = max(0.1, float(params.get("p1", 4.0)))
    seed = float(params.get("p2", 123.0))
    strength = float(params.get("p3", 0.35))

    def sampler(uvx: float, uvy: float) -> tuple[float, float]:
        nx = value_noise(uvx, uvy, scale, seed + 13.0)
        ny = value_noise(uvx, uvy, scale, seed + 71.0)
        return uvx + (nx - 0.5) * strength * 0.2, uvy + (ny - 0.5) * strength * 0.2

    return apply_universal_levels(remap_prev(transformed, prev.size[0], sampler), universal)


def apply_radial_warp(prev: Image.Image, params: dict, universal: dict) -> Image.Image:
    transformed = transform_prev(prev, universal)
    mode = int(round(float(params.get("p1", 0.0))))
    strength = float(params.get("p2", 0.5))
    radius = max(0.001, float(params.get("p3", 0.5)))
    cx = float(params.get("p4", 0.5))
    cy = float(params.get("p5", 0.5))

    def sampler(uvx: float, uvy: float) -> tuple[float, float]:
        dx = uvx - cx
        dy = uvy - cy
        dist = math.sqrt(dx * dx + dy * dy)
        if dist > radius:
            return uvx, uvy
        if mode == 0:
            angle = math.atan2(dy, dx) + strength * (1.0 - dist / radius) * math.tau
            return cx + math.cos(angle) * dist, cy + math.sin(angle) * dist
        scale = 1.0 - strength * (1.0 - dist / radius) if mode == 1 else 1.0 + strength * (1.0 - dist / radius)
        return cx + dx * scale, cy + dy * scale

    return apply_universal_levels(remap_prev(transformed, prev.size[0], sampler), universal)


def apply_kaleidoscope(prev: Image.Image, params: dict, universal: dict) -> Image.Image:
    transformed = transform_prev(prev, universal)
    segments = max(1, int(round(float(params.get("p1", 6.0)))))
    rotation = math.radians(float(params.get("p2", 0.0)))
    mirror = float(params.get("p3", 1.0)) > 0.5
    segment_size = math.tau / segments

    def sampler(uvx: float, uvy: float) -> tuple[float, float]:
        dx = uvx - 0.5
        dy = uvy - 0.5
        radius = math.sqrt(dx * dx + dy * dy)
        angle = math.atan2(dy, dx) + rotation
        angle = math.fmod(angle, segment_size)
        if mirror:
            angle = abs(angle - segment_size * 0.5)
        return 0.5 + math.cos(angle) * radius, 0.5 + math.sin(angle) * radius

    return apply_universal_levels(remap_prev(transformed, prev.size[0], sampler), universal)


def apply_morph(prev: Image.Image, params: dict, universal: dict) -> Image.Image:
    transformed = transform_prev(prev, universal)
    mode = int(round(float(params.get("p1", 0.0))))
    radius = max(0, int(round(float(params.get("p2", 2.0)))))
    size = max(3, radius * 2 + 1)
    return transformed.filter(ImageFilter.MaxFilter(size=size) if mode == 0 else ImageFilter.MinFilter(size=size))


def apply_open_close(prev: Image.Image, params: dict, universal: dict) -> Image.Image:
    transformed = transform_prev(prev, universal)
    mode = int(round(float(params.get("p1", 0.0))))
    radius = max(0, int(round(float(params.get("p2", 2.0)))))
    size = max(3, radius * 2 + 1)
    if mode == 0:
        return transformed.filter(ImageFilter.MinFilter(size=size)).filter(ImageFilter.MaxFilter(size=size))
    return transformed.filter(ImageFilter.MaxFilter(size=size)).filter(ImageFilter.MinFilter(size=size))


def apply_edge(prev: Image.Image, params: dict, universal: dict) -> Image.Image:
    transformed = transform_prev(prev, universal).filter(ImageFilter.FIND_EDGES)
    strength = float(params.get("p1", 1.0))
    threshold = float(params.get("p2", 0.1)) * 255.0
    invert = float(params.get("p3", 0.0)) > 0.5
    values = []
    for value in transformed.getdata():
        scaled = clamp(value / 255.0 * strength)
        out = 255 if scaled * 255.0 >= threshold else 0
        values.append(255 - out if invert else out)
    image = new_canvas(prev.size[0])
    image.putdata(values)
    return apply_universal_levels(image, universal)


def apply_outline(prev: Image.Image, params: dict, universal: dict) -> Image.Image:
    transformed = transform_prev(prev, universal)
    radius = max(0, int(round(float(params.get("p1", 2.0)))))
    softness = max(0.01, float(params.get("p2", 0.1)))
    mode = int(round(float(params.get("p3", 2.0))))
    size = max(3, radius * 2 + 1)
    outer = ImageChops.subtract(transformed.filter(ImageFilter.MaxFilter(size=size)), transformed)
    inner = ImageChops.subtract(transformed, transformed.filter(ImageFilter.MinFilter(size=size)))
    if mode == 0:
        out = outer
    elif mode == 1:
        out = inner
    else:
        out = ImageChops.lighter(outer, inner)
    if softness > 0.01:
        out = out.filter(ImageFilter.GaussianBlur(radius=softness * radius))
    return apply_universal_levels(out, universal)


def apply_posterize(prev: Image.Image, params: dict, universal: dict) -> Image.Image:
    transformed = transform_prev(prev, universal)
    steps = max(2, int(round(float(params.get("p1", 4.0)))))
    bias = float(params.get("p2", 0.0))
    values = []
    for value in transformed.getdata():
        shifted = clamp(value / 255.0 + bias)
        quantized = round(shifted * (steps - 1)) / max(1, steps - 1)
        values.append(int(quantized * 255))
    out = new_canvas(prev.size[0])
    out.putdata(values)
    return apply_universal_levels(out, universal)


def apply_distance_bands(prev: Image.Image, params: dict, universal: dict) -> Image.Image:
    transformed = transform_prev(prev, universal)
    blurred = transformed.filter(ImageFilter.BoxBlur(radius=2))
    frequency = max(1.0, float(params.get("p1", 8.0)))
    start = float(params.get("p2", 0.3))
    width = max(0.01, float(params.get("p3", 0.1)))
    phase = float(params.get("p4", 0.0))
    values = []
    for value, avg in zip(transformed.getdata(), blurred.getdata()):
        edge = abs((value - avg) / 255.0)
        band = (math.sin((edge * frequency + phase) * math.tau) + 1.0) * 0.5
        values.append(255 if start <= band <= start + width else 0)
    out = new_canvas(prev.size[0])
    out.putdata(values)
    return apply_universal_levels(out, universal)


def apply_grunge(prev: Image.Image, params: dict, universal: dict) -> Image.Image:
    transformed = transform_prev(prev, universal)
    density = float(params.get("p1", 0.45))
    scratch_length = float(params.get("p2", 0.65))
    speck_amount = float(params.get("p3", 0.4))
    fluidity = float(params.get("p4", 0.0))
    scratch = Image.new("L", transformed.size, color=0)
    draw = ImageDraw.Draw(scratch)
    rng = random.Random(int(density * 1000 + scratch_length * 100 + speck_amount * 10))
    count = max(8, int(transformed.size[0] * density * 0.5))
    for _ in range(count):
        x = rng.randint(0, transformed.size[0] - 1)
        y = rng.randint(0, transformed.size[1] - 1)
        angle = rng.random() * math.tau
        length = int((scratch_length * 0.3 + 0.1) * transformed.size[0] * rng.uniform(0.2, 1.0))
        end_x = int(x + math.cos(angle) * length)
        end_y = int(y + math.sin(angle) * length)
        draw.line((x, y, end_x, end_y), fill=255, width=max(1, int(1 + fluidity * 3)))
    for _ in range(max(12, int(transformed.size[0] * speck_amount * 0.8))):
        x = rng.randint(0, transformed.size[0] - 1)
        y = rng.randint(0, transformed.size[1] - 1)
        radius = max(1, int((0.005 + speck_amount * 0.03) * transformed.size[0] * rng.uniform(0.5, 1.5)))
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=255)
    damage = scratch.filter(ImageFilter.GaussianBlur(radius=max(0.0, fluidity * 3.0)))
    out = ImageChops.subtract(transformed, damage)
    return apply_universal_levels(out, universal)


def apply_library_scatter(prev: Image.Image, params: dict, universal: dict, library_images: list[Image.Image]) -> Image.Image:
    if not library_images:
        return transform_prev(prev, universal)
    size = prev.size[0]
    count = max(1, min(16, int(round(float(params.get("p1", 8.0))))))
    jitter = float(params.get("p2", 1.0))
    scale_min = max(0.05, float(params.get("p3", 0.2)))
    scale_max = max(scale_min, float(params.get("p4", 0.8)))
    seed = int(round(float(params.get("p5", 123.0))))
    rng = random.Random(seed)
    out = new_canvas(size)
    for index in range(count):
        source = library_images[index % len(library_images)].copy()
        scale = rng.uniform(scale_min, scale_max)
        target = max(8, int(size * scale))
        stamp = source.resize((target, target))
        center_x = int(lerp(size * 0.5, rng.uniform(0, size), jitter))
        center_y = int(lerp(size * 0.5, rng.uniform(0, size), jitter))
        layer = new_canvas(size)
        layer.paste(stamp, (center_x - target // 2, center_y - target // 2))
        out = ImageChops.lighter(out, layer)
    return apply_universal_levels(out, universal)


def apply_library_displace(prev: Image.Image, params: dict, universal: dict, library_images: list[Image.Image]) -> Image.Image:
    if not library_images:
        return transform_prev(prev, universal)
    transformed = transform_prev(prev, universal)
    source = library_images[0]
    strength = float(params.get("p1", 0.35))
    scale = max(0.1, float(params.get("p2", 3.0)))
    seed = float(params.get("p3", 123.0))

    def sampler(uvx: float, uvy: float) -> tuple[float, float]:
        nx = value_noise(uvx, uvy, scale, seed + 13.0)
        ny = bilinear_sample(source, uvx, uvy) / 255.0
        return uvx + (nx - 0.5) * strength * 0.2, uvy + (ny - 0.5) * strength * 0.2

    return apply_universal_levels(remap_prev(transformed, transformed.size[0], sampler), universal)


def apply_custom(prev: Image.Image, universal: dict, source: str) -> Image.Image:
    namespace: dict = {}
    exec(source, {"__builtins__": {"abs": abs, "min": min, "max": max, "pow": pow, "round": round}}, namespace)
    custom = namespace.get("custom_op")
    if not callable(custom):
        raise ValueError("custom operation must define custom_op")
    transformed = transform_prev(prev, universal)
    out = new_canvas(prev.size[0])
    values = []
    for y in range(prev.size[0]):
        uvy = y / max(1, prev.size[0] - 1)
        for x in range(prev.size[0]):
            uvx = x / max(1, prev.size[0] - 1)
            prev_value = transformed.getpixel((x, y)) / 255.0
            value = float(custom(x, y, uvx, uvy, prev.size[0], prev.size[0], prev_value))
            values.append(int(clamp(value) * 255))
    out.putdata(values)
    return apply_universal_levels(out, universal)


def blend(prev: Image.Image, current: Image.Image, mode: int) -> Image.Image:
    if mode == 0:
        return current
    if mode == 1:
        return ImageChops.subtract(prev, current)
    if mode == 2:
        return ImageChops.multiply(prev, current)
    if mode == 3:
        return ImageChops.lighter(prev, current)
    if mode == 4:
        return ImageChops.lighter(prev, current)
    if mode == 5:
        return ImageChops.darker(prev, current)
    return current


class TextureEngine:
    def __init__(self, size: int = 256) -> None:
        self.size = size

    def _resolve_custom(self, step: dict, custom_ops: list[dict]) -> str | None:
        type_key = step.get("type_key", "")
        if not type_key.startswith("CUSTOM:"):
            return None
        target_id = type_key.split(":", 1)[1]
        for op in custom_ops:
            if op.get("id") == target_id:
                return str(op.get("code", ""))
        return None

    def render_stack(self, steps: list[dict], custom_ops: list[dict] | None = None, library_images: list[Image.Image] | None = None, size: int | None = None) -> list[Image.Image]:
        canvas_size = size or self.size
        previews: list[Image.Image] = []
        prev = new_canvas(canvas_size)
        custom_ops = custom_ops or []
        library_images = library_images or []
        for step in steps:
            if not step.get("active", True):
                previews.append(prev.copy())
                continue
            type_key = step.get("type_key")
            params = step.get("params", {})
            universal = step.get("universal", {})
            if type_key == "BASE_SHAPE":
                current = make_base_shape(canvas_size, params, universal)
            elif type_key == "BASE_GRAD":
                current = make_gradient(canvas_size, params, universal)
            elif type_key == "NOISE_PERLIN":
                current = make_perlin(canvas_size, params, universal)
            elif type_key == "NOISE_WORLEY":
                current = make_worley(canvas_size, params, universal)
            elif type_key == "THRESHOLD":
                current = apply_threshold(prev, params, universal)
            elif type_key == "FRACTAL":
                current = apply_fractal(prev, params, universal)
            elif type_key == "SPIRAL":
                current = apply_spiral(prev, params, universal)
            elif type_key == "VIGNETTE":
                current = apply_vignette(canvas_size, params, universal)
            elif type_key == "BASIC":
                current = apply_universal_levels(transform_prev(prev, universal), universal)
            elif type_key == "SMEAR":
                current = apply_smear(prev, params, universal)
            elif type_key == "DOMAIN_WARP":
                current = apply_domain_warp(prev, params, universal)
            elif type_key == "RADIAL_WARP":
                current = apply_radial_warp(prev, params, universal)
            elif type_key == "KALEIDOSCOPE_PLUS":
                current = apply_kaleidoscope(prev, params, universal)
            elif type_key == "MORPH_DILATE_ERODE":
                current = apply_universal_levels(apply_morph(prev, params, universal), universal)
            elif type_key == "MORPH_OPEN_CLOSE":
                current = apply_universal_levels(apply_open_close(prev, params, universal), universal)
            elif type_key == "EDGE_SOBEL":
                current = apply_edge(prev, params, universal)
            elif type_key == "OUTLINE_ALPHA":
                current = apply_outline(prev, params, universal)
            elif type_key == "POSTERIZE_ALPHA":
                current = apply_posterize(prev, params, universal)
            elif type_key == "DISTANCE_BANDS":
                current = apply_distance_bands(prev, params, universal)
            elif type_key == "GRUNGE_SCRATCH":
                current = apply_grunge(prev, params, universal)
            elif type_key == "LIBRARY_STAMP_SCATTER":
                current = apply_library_scatter(prev, params, universal, library_images)
            elif type_key == "LIBRARY_DISPLACE":
                current = apply_library_displace(prev, params, universal, library_images)
            elif type_key and type_key.startswith("CUSTOM:"):
                source = self._resolve_custom(step, custom_ops)
                if not source:
                    raise ValueError(f"unknown custom op {type_key}")
                current = apply_custom(prev, universal, source)
            else:
                raise ValueError(f"unsupported step type {type_key}")
            prev = blend(prev, current, int(step.get("blend_mode", 0)))
            previews.append(prev.copy())
        return previews

    def render_frames(
        self,
        steps: list[dict],
        flipbook_config: dict,
        custom_ops: list[dict] | None = None,
        library_images: list[Image.Image] | None = None,
        size: int | None = None,
    ) -> list[Image.Image]:
        frames = []
        frame_count = max(1, int(flipbook_config.get("global", {}).get("frameCount", 16)))
        for frame_index in range(frame_count):
            animated = []
            t = frame_index / max(1, frame_count - 1)
            for step in steps:
                clone = {
                    "id": step["id"],
                    "type_key": step["type_key"],
                    "active": step.get("active", True),
                    "blend_mode": step.get("blend_mode", 0),
                    "params": dict(step.get("params", {})),
                    "universal": dict(step.get("universal", {})),
                }
                op_cfg = flipbook_config.get("operations", {}).get(step["type_key"], {})
                if op_cfg.get("enabled"):
                    wave = math.sin(t * math.tau * float(op_cfg.get("speed", 1.0)))
                    for param_key, param_cfg in op_cfg.get("params", {}).items():
                        if param_cfg.get("enabled"):
                            clone["params"][param_key] = float(clone["params"].get(param_key, 0.0)) + wave * float(param_cfg.get("range", 0.0))
                    for key in ("mult", "scale"):
                        u_cfg = op_cfg.get("universal", {}).get(key, {})
                        if u_cfg.get("enabled"):
                            clone["universal"][key] = float(clone["universal"].get(key, 0.0)) + wave * float(u_cfg.get("range", 0.0))
                animated.append(clone)
            frames.append(self.render_stack(animated, custom_ops=custom_ops, library_images=library_images, size=size)[-1])
        return frames

    @staticmethod
    def save(image: Image.Image, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        image.save(path)

