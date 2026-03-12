#!/usr/bin/env bash
set -euo pipefail

# Ir a la raiz del repo (carpeta que contiene este script)
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Iniciar backend en segundo plano y frontend en primer plano
bash scripts/run-backend.sh &
BACKEND_PID=$!

cleanup() {
	kill "$BACKEND_PID" 2>/dev/null || true
}
trap cleanup EXIT

bash scripts/run-frontend.sh
