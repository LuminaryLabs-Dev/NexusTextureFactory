from __future__ import annotations

from pathlib import Path

from ..catalog import DEFAULT_CUSTOM_OPERATION
from .common import add_json_flag, emit


def register(subparsers, app_factory) -> None:
    parser = subparsers.add_parser("custom-ops", help="Manage custom Python operations.")
    custom_sub = parser.add_subparsers(dest="custom_cmd", required=True)

    list_parser = custom_sub.add_parser("list", help="List custom ops.")
    add_json_flag(list_parser)
    list_parser.set_defaults(func=lambda args: emit({"customOps": app_factory().state["customOps"]}, args.json))

    add_parser = custom_sub.add_parser("add", help="Add a custom op.")
    add_parser.add_argument("--title", required=True)
    add_parser.add_argument("--description", default="")
    add_parser.add_argument("--code-file")
    add_json_flag(add_parser)

    def handle_add(args):
        code = DEFAULT_CUSTOM_OPERATION
        if args.code_file:
            code = Path(args.code_file).read_text(encoding="utf-8")
        return emit(app_factory().add_custom_op(args.title, code, args.description), args.json)

    add_parser.set_defaults(func=handle_add)

    validate_parser = custom_sub.add_parser("validate", help="Render a validation preview for a custom op.")
    validate_parser.add_argument("--id", required=True)
    add_json_flag(validate_parser)
    validate_parser.set_defaults(func=lambda args: emit(app_factory().validate_custom_op(args.id), args.json))

