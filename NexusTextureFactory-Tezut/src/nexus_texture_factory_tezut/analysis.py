from __future__ import annotations

import hashlib
import math
from statistics import mean

from PIL import Image, ImageFilter


def image_hash(image: Image.Image) -> str:
    return hashlib.sha1(image.tobytes()).hexdigest()


def density(image: Image.Image) -> float:
    pixels = list(image.getdata())
    if not pixels:
        return 0.0
    return sum(pixels) / (len(pixels) * 255.0)


def edge_density(image: Image.Image) -> float:
    edged = image.filter(ImageFilter.FIND_EDGES)
    values = list(edged.getdata())
    if not values:
        return 0.0
    return sum(values) / (len(values) * 255.0)


def simplicity(image: Image.Image) -> float:
    return max(0.0, min(1.0, 1.0 - edge_density(image) * 1.2))


def bounding_box(mask: list[int], width: int, height: int, cutoff: int = 20) -> tuple[int, int, int, int] | None:
    min_x = width
    min_y = height
    max_x = -1
    max_y = -1
    for y in range(height):
        row_offset = y * width
        for x in range(width):
            if mask[row_offset + x] < cutoff:
                continue
            min_x = min(min_x, x)
            min_y = min(min_y, y)
            max_x = max(max_x, x)
            max_y = max(max_y, y)
    if max_x < min_x or max_y < min_y:
        return None
    return min_x, min_y, max_x, max_y


def circularity_and_squareness(image: Image.Image) -> tuple[float, float]:
    width, height = image.size
    mask = list(image.getdata())
    bbox = bounding_box(mask, width, height)
    if bbox is None:
        return 0.0, 0.0
    min_x, min_y, max_x, max_y = bbox
    area = 0
    perimeter = 0
    for y in range(min_y, max_y + 1):
        row_offset = y * width
        for x in range(min_x, max_x + 1):
            idx = row_offset + x
            if mask[idx] < 20:
                continue
            area += 1
            for ox, oy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx = x + ox
                ny = y + oy
                if nx < 0 or ny < 0 or nx >= width or ny >= height or mask[ny * width + nx] < 20:
                    perimeter += 1
    if area <= 0:
        return 0.0, 0.0
    circularity = 4 * math.pi * area / max(1, perimeter * perimeter)
    box_area = max(1, (max_x - min_x + 1) * (max_y - min_y + 1))
    squareness = area / box_area
    return max(0.0, min(1.0, circularity)), max(0.0, min(1.0, squareness))


def frame_delta(previous: Image.Image, current: Image.Image) -> float:
    a = list(previous.getdata())
    b = list(current.getdata())
    if len(a) != len(b) or not a:
        return 0.0
    return sum(abs(x - y) for x, y in zip(a, b)) / (len(a) * 255.0)


def temporal_metrics(frames: list[Image.Image]) -> dict:
    if len(frames) < 2:
        return {"changeScore": 0.0, "jitterScore": 0.0}
    anchor = frames[-1]
    dissimilarities = [frame_delta(frame, anchor) for frame in frames[:-1]]
    weights = [index + 1 for index in range(len(dissimilarities))]
    weighted = sum(value * weight for value, weight in zip(dissimilarities, weights)) / sum(weights)
    jitter_values = [frame_delta(frames[index - 1], frames[index]) for index in range(1, len(frames))]
    return {"changeScore": weighted, "jitterScore": mean(jitter_values)}


def analyze(image: Image.Image) -> dict:
    dens = density(image)
    circ, square = circularity_and_squareness(image)
    simple = simplicity(image)
    return {
        "density": dens,
        "sScore": simple,
        "circularity": circ,
        "squareness": square,
        "hash": image_hash(image),
    }

