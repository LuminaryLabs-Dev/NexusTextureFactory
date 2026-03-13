from __future__ import annotations

from .common import add_json_flag, as_path, emit


def register(subparsers, app_factory) -> None:
    parser = subparsers.add_parser("preview", help="Render preview artifacts.")
    preview_sub = parser.add_subparsers(dest="preview_cmd", required=True)

    render_parser = preview_sub.add_parser("render", help="Render current stack preview.")
    render_parser.add_argument("--size", type=int, default=256)
    render_parser.add_argument("--out")
    add_json_flag(render_parser)
    render_parser.set_defaults(func=lambda args: emit(app_factory().render_current_stack(size=args.size, out=as_path(args.out)), args.json))

    item_parser = preview_sub.add_parser("item", help="Resolve a saved item preview.")
    item_parser.add_argument("--item-id", required=True)
    add_json_flag(item_parser)
    item_parser.set_defaults(func=lambda args: emit(app_factory().preview_item(args.item_id), args.json))

