#!/bin/bash
# Render startup script for SkillMitra backend
# Uses Render's $PORT environment variable

PORT=${PORT:-8000}
echo "Starting SkillMitra backend on port $PORT"
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT