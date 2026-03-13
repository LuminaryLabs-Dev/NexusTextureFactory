from __future__ import annotations

from .common import add_json_flag, emit, parse_key_values


def register(subparsers, app_factory) -> None:
    parser = subparsers.add_parser("filters", help="Manage quality gates and modules.")
    filters_sub = parser.add_subparsers(dest="filters_cmd", required=True)

    show_parser = filters_sub.add_parser("show", help="Show filter state.")
    add_json_flag(show_parser)
    show_parser.set_defaults(func=lambda args: emit({"qualityFilters": app_factory().state["qualityFilters"], "modules": app_factory().state["filterModules"]}, args.json))

    quality_parser = filters_sub.add_parser("quality", help="Update a quality filter field.")
    quality_parser.add_argument("--category", required=True)
    quality_parser.add_argument("--field", required=True)
    quality_parser.add_argument("--value", required=True)
    add_json_flag(quality_parser)

    def handle_quality(args):
        raw = args.value
        if raw.lower() in {"true", "false"}:
            value = raw.lower() == "true"
        else:
            try:
                value = int(raw)
            except ValueError:
                value = float(raw)
        return emit(app_factory().update_quality_filter(args.category, args.field, value), args.json)

    quality_parser.set_defaults(func=handle_quality)

    module_parser = filters_sub.add_parser("module", help="Update a filter module.")
    module_parser.add_argument("--key", required=True)
    module_parser.add_argument("--enabled", choices=["true", "false"])
    module_parser.add_argument("--param", action="append")
    module_parser.add_argument("--universal", action="append")
    module_parser.add_argument("--blend-mode", type=int)
    add_json_flag(module_parser)
    module_parser.set_defaults(
        func=lambda args: emit(
            app_factory().update_filter_module(
                args.key,
                enabled=None if args.enabled is None else args.enabled == "true",
                params=parse_key_values(args.param),
                universal=parse_key_values(args.universal),
                blend_mode=args.blend_mode,
            ),
            args.json,
        )
    )

