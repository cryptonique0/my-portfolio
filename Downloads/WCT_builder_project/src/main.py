"""Small CLI + optional web server for WCT_builder_project.

Subcommands:
  greet --name NAME    Print a personalised greeting (default: World)
  info                 Print the repository README (if present)
  serve --host --port  Start a tiny Flask web app with a few endpoints

Usage examples:
  python3 src/main.py greet --name Alice
  python3 src/main.py serve --port 8000
"""

import argparse
import sys
from pathlib import Path


def greet(name: str) -> None:
	"""Print a friendly greeting."""
	print(f"Hello, {name}! Welcome to WCT_builder_project")


def info() -> None:
	"""Print the repository README.md if present."""
	# README.md is expected to be at the repository root (two levels up from src)
	readme = Path(__file__).resolve().parents[1] / "README.md"
	if readme.exists():
		print(readme.read_text())
	else:
		print("No README.md found.")


def run_server(host: str = "127.0.0.1", port: int = 8000) -> None:
	"""Start a tiny Flask web app.

	If Flask isn't installed, this prints instructions and exits with code 1.
	"""
	try:
		from flask import Flask, jsonify
	except Exception:
		print("Flask is not installed. Install dependencies with:\n  pip install -r requirements.txt")
		sys.exit(1)

	app = Flask(__name__)

	@app.route("/")
	def index():
		return "<h1>WCT_builder_project</h1><p>Hello from the web app!</p>"

	@app.route("/greet/<name>")
	def greet_route(name: str):
		return f"Hello, {name}!"

	@app.route("/status")
	def status():
		return jsonify({"status": "ok"})

	print(f"Starting web server at http://{host}:{port} (CTRL+C to stop)")
	app.run(host=host, port=port)


def build_parser() -> argparse.ArgumentParser:
	parser = argparse.ArgumentParser(description="WCT_builder_project CLI")
	subparsers = parser.add_subparsers(dest="command", required=False)

	p_greet = subparsers.add_parser("greet", help="Print a greeting")
	p_greet.add_argument("--name", "-n", default="World", help="Name to greet")

	subparsers.add_parser("info", help="Show README.md contents if available")

	p_serve = subparsers.add_parser("serve", help="Run a tiny web server (Flask)")
	p_serve.add_argument("--host", default="127.0.0.1", help="Host to bind to")
	p_serve.add_argument("--port", type=int, default=8000, help="Port to listen on")

	return parser


def main() -> None:
	parser = build_parser()
	args = parser.parse_args()

	if args.command == "greet":
		greet(args.name)
	elif args.command == "info":
		info()
	elif args.command == "serve":
		run_server(args.host, args.port)
	else:
		# No subcommand given: show help and a short banner
		parser.print_help()


if __name__ == "__main__":
	main()