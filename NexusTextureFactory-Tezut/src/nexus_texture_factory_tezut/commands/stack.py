from __future__ import annotations

from .common import add_json_flag, as_path, emit, parse_key_values


def register(subparsers, app_factory) -> None:
    parser = subparsers.add_parser("stack", help="Manage the workbench stack.")
    stack_sub = parser.add_subparsers(dest="stack_cmd", required=True)

    init_parser = stack_sub.add_parser("init", help="Reset stack to defaults.")
    add_json_flag(init_parser)
    init_parser.set_defaults(func=lambda args: emit(app_factory().reset_stack(), args.json))

    show_parser = stack_sub.add_parser("show", help="Show current stack.")
    add_json_flag(show_parser)
    show_parser.set_defaults(func=lambda args: emit({"stack": app_factory().state["stack"]}, args.json))

    add_parser = stack_sub.add_parser("add", help="Add a step.")
    add_parser.add_argument("type_key")
    add_parser.add_argument("--after", type=int)
    add_json_flag(add_parser)
    add_parser.set_defaults(func=lambda args: emit(app_factory().add_step(args.type_key, after=args.after), args.json))

    move_parser = stack_sub.add_parser("move", help="Move a step.")
    move_parser.add_argument("--from-index", type=int, required=True)
    move_parser.add_argument("--to-index", type=int, required=True)
    add_json_flag(move_parser)
    move_parser.set_defaults(func=lambda args: emit({"stack": app_factory().move_step(args.from_index, args.to_index)}, args.json))

    delete_parser = stack_sub.add_parser("delete", help="Delete a step.")
    delete_parser.add_argument("index", type=int)
    add_json_flag(delete_parser)
    delete_parser.set_defaults(func=lambda args: emit({"stack": app_factory().delete_step(args.index)}, args.json))

    toggle_parser = stack_sub.add_parser("toggle", help="Toggle a step.")
    toggle_parser.add_argument("index", type=int)
    toggle_parser.add_argument("--active", choices=["true", "false"])
    add_json_flag(toggle_parser)
    toggle_parser.set_defaults(func=lambda args: emit(app_factory().toggle_step(args.index, None if args.active is None else args.active == "true"), args.json))

    update_parser = stack_sub.add_parser("set", help="Update step params and universal controls.")
    update_parser.add_argument("index", type=int)
    update_parser.add_argument("--param", action="append")
    update_parser.add_argument("--universal", action="append")
    update_parser.add_argument("--blend-mode", type=int)
    add_json_flag(update_parser)
    update_parser.set_defaults(
        func=lambda args: emit(
            app_factory().update_step(
                args.index,
                params=parse_key_values(args.param),
                universal=parse_key_values(args.universal),
                blend_mode=args.blend_mode,
            ),
            args.json,
        )
    )

    render_parser = stack_sub.add_parser("render", help="Render current stack.")
    render_parser.add_argument("--size", type=int, default=256)
    render_parser.add_argument("--out")
    add_json_flag(render_parser)
    render_parser.set_defaults(func=lambda args: emit(app_factory().render_current_stack(size=args.size, out=as_path(args.out)), args.json))

    export_parser = stack_sub.add_parser("export", help="Export stack manifest.")
    export_parser.add_argument("--out", required=True)
    add_json_flag(export_parser)
    export_parser.set_defaults(func=lambda args: emit(app_factory().export_stack(as_path(args.out)), args.json))

    load_parser = stack_sub.add_parser("load", help="Load stack manifest.")
    load_parser.add_argument("--path", required=True)
    add_json_flag(load_parser)
    load_parser.set_defaults(func=lambda args: emit(app_factory().load_stack(as_path(args.path)), args.json))

