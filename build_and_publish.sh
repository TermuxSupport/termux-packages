#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [ -z "${PACKAGE_NAME:-}" ]; then
  echo "ERROR: secret PACKAGE_NAME belum diset." >&2
  exit 1
fi

if [ -z "${PYPI_API_TOKEN:-}" ]; then
  echo "ERROR: secret PYPI_API_TOKEN belum diset." >&2
  exit 1
fi

echo "Menggunakan nama paket: $PACKAGE_NAME"

sed "s/__PACKAGE_NAME__/${PACKAGE_NAME}/g" pyproject.toml.template > pyproject.toml

rm -rf dist build ./*.egg-info

python3 -m build

python3 -m twine upload dist/* -u __token__ -p "$PYPI_API_TOKEN"

echo "Selesai. Cek: https://pypi.org/project/${PACKAGE_NAME}/"
