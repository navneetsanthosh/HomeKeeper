#!/usr/bin/env bash
set -euo pipefail

python -m pip install -r backend/requirements-prod.txt
npm ci --prefix frontend
VITE_API_URL=/api npm --prefix frontend run build -- --base=/static/

rm -rf backend/static-web
mkdir -p backend/static-web
cp -R frontend/dist/. backend/static-web/

cd backend
python manage.py collectstatic --noinput --clear
