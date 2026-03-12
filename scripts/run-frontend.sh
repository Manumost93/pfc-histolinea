#!/usr/bin/env bash
set -euo pipefail

# Ir a la raiz del repo (carpeta que contiene este script)
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Instalar dependencias y arrancar frontend
cd frontend/histolinea-web
npm install
npm run dev
