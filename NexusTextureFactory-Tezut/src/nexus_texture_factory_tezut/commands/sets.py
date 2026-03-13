from __future__ import annotations

from .common import add_json_flag, as_path, emit


def register(subparsers, app_factory) -> None:
    parser = subparsers.add_parser("sets", help="Manage saved sets and exports.")
    sets_sub = parser.add_subparsers(dest="sets_cmd", required=True)

    list_parser = sets_sub.add_parser("list", help="List computed sets.")
    add_json_flag(list_parser)
    list_parser.set_defaults(func=lambda args: emit({"sets": app_factory().compute_sets()}, args.json))

    config_parser = sets_sub.add_parser("config", help="Update grouping config.")
    config_parser.add_argument("--group-by")
    config_parser.add_argument("--group-depth", type=int)
    config_parser.add_argument("--sort-by")
    config_parser.add_argument("--sort-dir")
    config_parser.add_argument("--max-items-per-pack", type=int)
    add_json_flag(config_parser)

    def handle_config(args):
        app = app_factory()
        updates = {}
        for key in ("group_by", "group_depth", "sort_by", "sort_dir", "max_items_per_pack"):
            value = getattr(args, key)
            if value is None:
                continue
            updates["".join(part.capitalize() if index else part for index, part in enumerate(key.split("_")))] = value
        for key, value in updates.items():
            app.set_config_value("packConfig", key, value)
        return emit({"packConfig": app.state["packConfig"], "sets": app.compute_sets()}, args.json)

    config_parser.set_defaults(func=handle_config)

    rename_parser = sets_sub.add_parser("rename", help="Rename a set.")
    rename_parser.add_argument("--set-id", required=True)
    rename_parser.add_argument("--name", required=True)
    add_json_flag(rename_parser)
    rename_parser.set_defaults(func=lambda args: emit(app_factory().rename_set(args.set_id, args.name), args.json))

    reorder_parser = sets_sub.add_parser("reorder", help="Reorder items within a set.")
    reorder_parser.add_argument("--set-id", required=True)
    reorder_parser.add_argument("--from-index", type=int, required=True)
    reorder_parser.add_argument("--to-index", type=int, required=True)
    add_json_flag(reorder_parser)
    reorder_parser.set_defaults(func=lambda args: emit(app_factory().reorder_set_item(args.set_id, args.from_index, args.to_index), args.json))

    delete_item_parser = sets_sub.add_parser("delete-item", help="Delete a saved item.")
    delete_item_parser.add_argument("--item-id", required=True)
    add_json_flag(delete_item_parser)
    delete_item_parser.set_defaults(func=lambda args: emit(app_factory().delete_item(args.item_id), args.json))

    delete_set_parser = sets_sub.add_parser("delete-set", help="Delete a set.")
    delete_set_parser.add_argument("--set-id", required=True)
    add_json_flag(delete_set_parser)
    delete_set_parser.set_defaults(func=lambda args: emit(app_factory().delete_set(args.set_id), args.json))

    delete_all_parser = sets_sub.add_parser("delete-all", help="Delete every set.")
    add_json_flag(delete_all_parser)
    delete_all_parser.set_defaults(func=lambda args: emit(app_factory().delete_all_sets(), args.json))

    export_parser = sets_sub.add_parser("export", help="Export a set zip.")
    export_parser.add_argument("--set-id", required=True)
    export_parser.add_argument("--out")
    export_parser.add_argument("--include-flipbook", choices=["true", "false"], default="true")
    add_json_flag(export_parser)
    export_parser.set_defaults(
        func=lambda args: emit(
            app_factory().export_set(args.set_id, out=as_path(args.out), include_flipbook=args.include_flipbook == "true"),
            args.json,
        )
    )

