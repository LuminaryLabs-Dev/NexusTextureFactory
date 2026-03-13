from __future__ import annotations

from .common import add_json_flag, emit


def register(subparsers, app_factory) -> None:
    parser = subparsers.add_parser("config", help="Inspect and update persisted config.")
    config_sub = parser.add_subparsers(dest="config_cmd", required=True)

    show_parser = config_sub.add_parser("show", help="Show persisted state domains.")
    add_json_flag(show_parser)
    show_parser.set_defaults(
        func=lambda args: emit(
            {
                "dreamParams": app_factory().state["dreamParams"],
                "packConfig": app_factory().state["packConfig"],
                "uiPrefs": app_factory().state["uiPrefs"],
                "selectedRes": app_factory().state["selectedRes"],
            },
            args.json,
        )
    )

    set_parser = config_sub.add_parser("set", help="Set a config value.")
    set_parser.add_argument("--domain", required=True, choices=["dreamParams", "packConfig", "uiPrefs"])
    set_parser.add_argument("--key", required=True)
    set_parser.add_argument("--value", required=True)
    add_json_flag(set_parser)

    def handle_set(args):
        raw = args.value
        if raw.lower() in {"true", "false"}:
            value = raw.lower() == "true"
        else:
            try:
                value = int(raw)
            except ValueError:
                try:
                    value = float(raw)
                except ValueError:
                    value = raw
        return emit(app_factory().set_config_value(args.domain, args.key, value), args.json)

    set_parser.set_defaults(func=handle_set)

