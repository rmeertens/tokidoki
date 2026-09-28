#!/bin/sh
# Copies the Tokidoki website (repo root) into the app bundle's Web/ folder.
set -eu

REPO_ROOT="${SRCROOT}/.."
DEST="${TARGET_BUILD_DIR}/${UNLOCALIZED_RESOURCES_FOLDER_PATH}/Web"

mkdir -p "$DEST"
rsync -a --delete \
  --exclude='/ios/' \
  --exclude='/scripts/' \
  --exclude='data/' \
  --exclude='.*' \
  --exclude='test_*.js' \
  --include='*/' \
  --include='*.html' \
  --include='*.js' \
  --include='*.css' \
  --include='*.pdf' \
  --exclude='*' \
  --prune-empty-dirs \
  "$REPO_ROOT/" "$DEST/"
