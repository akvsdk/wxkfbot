#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
cp wrangler.toml wrangler.toml.dev
cp wrangler.toml.production wrangler.toml
npx wrangler deploy "$@"
cp wrangler.toml.dev wrangler.toml
rm -f wrangler.toml.dev
echo "✓ deployed"
