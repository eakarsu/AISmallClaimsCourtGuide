#!/usr/bin/env bash
set -euo pipefail
project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; cd "$project_dir"
test -f .env || { echo '.env is required (copy .env.example)' >&2; exit 1; }; set -a; source .env; set +a
: "${DATABASE_URL:?DATABASE_URL is required}"; : "${JWT_SECRET:?JWT_SECRET is required}"; (( ${#JWT_SECRET} >= 32 )) || { echo 'JWT_SECRET must contain at least 32 characters' >&2; exit 1; }
test -d backend/node_modules || { echo 'Backend dependencies are missing; install them explicitly before starting' >&2; exit 1; }
backend_port="${BACKEND_PORT:-${PORT:-3001}}"; frontend_port="${FRONTEND_PORT:-${VITE_PORT:-5181}}"
export PORT="$backend_port" FRONTEND_URL="http://127.0.0.1:$frontend_port" VITE_PORT="$frontend_port" VITE_API_TARGET="http://127.0.0.1:$backend_port"
for port in "$backend_port" "$frontend_port"; do if command -v lsof >/dev/null 2>&1 && lsof -ti ":$port" >/dev/null 2>&1; then echo "Port $port is already in use" >&2; exit 1; fi; done
mode="${1:-all}"; pids=(); trap 'for pid in "${pids[@]:-}"; do kill "$pid" 2>/dev/null || true; done' EXIT INT TERM
if [[ "$mode" == backend || "$mode" == all ]]; then npm --prefix backend start & pids+=("$!"); fi
if [[ "$mode" == frontend || "$mode" == all ]]; then test -d frontend/node_modules || { echo 'Frontend dependencies are missing' >&2; exit 1; }; npm --prefix frontend run dev -- --host 127.0.0.1 --port "$frontend_port" & pids+=("$!"); fi
[[ ${#pids[@]} -gt 0 ]] || { echo 'Usage: ./start.sh [all|backend|frontend]' >&2; exit 2; }; wait
