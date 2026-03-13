from __future__ import annotations

import argparse

from .commands import config, custom_ops, dream, filters, flipbook, ops, preview, sets, stack
from .session.app import TezutApp


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="nexus-tezut", description="Nexus Texture Factory Tezut CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)
    app_factory = TezutApp
    stack.register(subparsers, app_factory)
    dream.register(subparsers, app_factory)
    preview.register(subparsers, app_factory)
    sets.register(subparsers, app_factory)
    filters.register(subparsers, app_factory)
    flipbook.register(subparsers, app_factory)
    ops.register(subparsers, app_factory)
    custom_ops.register(subparsers, app_factory)
    config.register(subparsers, app_factory)
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return args.func(args)

