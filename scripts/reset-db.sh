#!/usr/bin/env bash
set -euo pipefail

# Ir a la raiz del repo (carpeta que contiene este script)
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Borrar la BD si existe
rm -f histolinea.dev.db

# Recrear base de datos
 dotnet ef database update -p backend/src/Histolinea.Infrastructure -s backend/src/Histolinea.Api
