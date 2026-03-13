from __future__ import annotations

from .common import add_json_flag, emit


def register(subparsers, app_factory) -> None:
    parser = subparsers.add_parser("dream", help="Run foam dreaming sessions.")
    dream_sub = parser.add_subparsers(dest="dream_cmd", required=True)

    run_parser = dream_sub.add_parser("run", help="Generate and prune dream results.")
    run_parser.add_argument("--count", type=int, default=8)
    run_parser.add_argument("--until-total", type=int)
    run_parser.add_argument("--prompt")
    run_parser.add_argument("--preview-size", type=int, default=256)
    run_parser.add_argument("--use-workbench-seed", choices=["true", "false"])
    run_parser.add_argument("--auto-pack", action="store_true", help="Export computed sets at 256/512/1024/2048 after dreaming.")
    run_parser.add_argument("--auto-flipbooks", action="store_true", help="Include flipbook exports when --auto-pack is enabled.")
    run_parser.add_argument("--preview-each-success", action="store_true", help="Write a low-res preview each time a texture is accepted.")
    run_parser.add_argument("--success-preview-size", type=int, default=96)
    add_json_flag(run_parser)

    def handle_run(args):
        app = app_factory()
        if args.prompt is not None:
            app.set_config_value("dreamParams", "prompt", args.prompt)
        if args.use_workbench_seed is not None:
            app.set_config_value("uiPrefs", "useWorkbenchSeed", args.use_workbench_seed == "true")
        return emit(
            app.dream_run(
                args.count,
                preview_size=args.preview_size,
                until_total=args.until_total,
                auto_pack=args.auto_pack,
                auto_flipbooks=args.auto_flipbooks,
                preview_each_success=args.preview_each_success,
                success_preview_size=args.success_preview_size,
            ),
            args.json,
        )

    run_parser.set_defaults(func=handle_run)

    last_parser = dream_sub.add_parser("last", help="Show last dream results.")
    add_json_flag(last_parser)
    last_parser.set_defaults(func=lambda args: emit({"results": app_factory().state["lastDreamResults"]}, args.json))
