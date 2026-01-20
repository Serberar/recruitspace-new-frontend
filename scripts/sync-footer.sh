#!/bin/bash

# Script para sincronizar las páginas del footer compartidas a todas las apps
# Uso: npm run sync:footer

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
SHARED_FOOTER="$ROOT_DIR/shared/footer"

# Apps destino
APPS=("landing" "ats" "jobs")

echo "Sincronizando páginas del footer..."

for app in "${APPS[@]}"; do
  DEST="$ROOT_DIR/apps/$app/src/pages/footer"

  # Crear directorio si no existe
  mkdir -p "$DEST"

  # Copiar archivos
  cp "$SHARED_FOOTER"/*.tsx "$DEST/" 2>/dev/null || true
  cp "$SHARED_FOOTER"/*.css "$DEST/" 2>/dev/null || true

  echo "  ✓ $app"
done

echo ""
echo "Sincronización completada."
