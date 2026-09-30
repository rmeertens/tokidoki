#!/bin/sh
# Copies the website's exercise data (JS) and printable sheets (PDF) from the
# repo root into the app bundle's Content/ folder. The app reads the data by
# evaluating these scripts in JavaScriptCore, so the site stays the source of truth.
set -eu

REPO_ROOT="${SRCROOT}/.."
DEST="${TARGET_BUILD_DIR}/${UNLOCALIZED_RESOURCES_FOLDER_PATH}/Content"

mkdir -p "$DEST"
rsync -a --delete \
  --exclude='/ios/' \
  --exclude='/scripts/' \
  --exclude='data/' \
  --exclude='.*' \
  --exclude='test_*.js' \
  --include='*/' \
  --include='*.js' \
  --include='*.pdf' \
  --exclude='*' \
  --prune-empty-dirs \
  "$REPO_ROOT/" "$DEST/"
