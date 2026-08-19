#!/usr/bin/env bash
# Regenerates the app's navigation map at .expo-map/map.html (static mode — no
# simulator, no screenshots). Uses the vendored expo-map parser/renderer
# (https://github.com/aleqsio/expo-map, MIT) plus a manifest derived from
# App.tsx's screen registrations (see generate-manifest.mjs).
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."

node tools/expo-map/generate-manifest.mjs
node tools/expo-map/vendor/parse-routes.mjs .
node tools/expo-map/vendor/render-map.mjs .expo-map/graph.json
rm -f routes.ts Navigation.tsx

echo "Navigation map: .expo-map/map.html"
