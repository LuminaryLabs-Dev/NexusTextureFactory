from __future__ import annotations

from .common import add_json_flag, emit, parse_key_values


def register(subparsers, app_factory) -> None:
    parser = subparsers.add_parser("flipbook", help="Manage flipbook animation settings.")
    flip_sub = parser.add_subparsers(dest="flip_cmd", required=True)

    show_parser = flip_sub.add_parser("show", help="Show flipbook config.")
    add_json_flag(show_parser)
    show_parser.set_defaults(func=lambda args: emit({"flipbookConfig": app_factory().state["flipbookConfig"]}, args.json))

    global_parser = flip_sub.add_parser("global", help="Update global flipbook settings.")
    global_parser.add_argument("--set", action="append", required=True)
    add_json_flag(global_parser)

    def handle_global(args):
        app = app_factory()
        updates = parse_key_values(args.set)
        for key, value in updates.items():
            app.update_flipbook("global", key, value)
        return emit({"global": app.state["flipbookConfig"]["global"]}, args.json)

    global_parser.set_defaults(func=handle_global)

    quality_parser = flip_sub.add_parser("quality", help="Update quality gates.")
    quality_parser.add_argument("--set", action="append", required=True)
    add_json_flag(quality_parser)

    def handle_quality(args):
        app = app_factory()
        updates = parse_key_values(args.set)
        for key, value in updates.items():
            app.update_flipbook("quality", key, value)
        return emit({"quality": app.state["flipbookConfig"]["quality"]}, args.json)

    quality_parser.set_defaults(func=handle_quality)

    op_parser = flip_sub.add_parser("op", help="Update an operation flipbook config.")
    op_parser.add_argument("--key", required=True)
    op_parser.add_argument("--set", action="append")
    op_parser.add_argument("--param-key")
    op_parser.add_argument("--param-set", action="append")
    op_parser.add_argument("--universal-key", choices=["mult", "scale"])
    op_parser.add_argument("--universal-set", action="append")
    add_json_flag(op_parser)

    def handle_op(args):
        app = app_factory()
        if args.param_key:
            result = app.update_flipbook_operation(args.key, param_key=args.param_key, values=parse_key_values(args.param_set))
        elif args.universal_key:
            result = app.update_flipbook_operation(args.key, universal_key=args.universal_key, values=parse_key_values(args.universal_set))
        else:
            result = app.update_flipbook_operation(args.key, values=parse_key_values(args.set))
        return emit(result, args.json)

    op_parser.set_defaults(func=handle_op)

