from __future__ import annotations

from .common import add_json_flag, emit


def register(subparsers, app_factory) -> None:
    parser = subparsers.add_parser("ops", help="Inspect built-in operation metadata.")
    ops_sub = parser.add_subparsers(dest="ops_cmd", required=True)

    list_parser = ops_sub.add_parser("list", help="List operations.")
    add_json_flag(list_parser)
    list_parser.set_defaults(func=lambda args: emit(app_factory().list_operations(), args.json))

