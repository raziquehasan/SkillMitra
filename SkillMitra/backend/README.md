# SkillMitra — Backend

FastAPI backend service for SkillMitra.

## Stack

- Python 3.11+
- FastAPI
- Uvicorn
- Pydantic / pydantic-settings
- python-dotenv

## Development Setup

```bash
# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (macOS/Linux)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload
```

Server will start at: `http://localhost:8000`

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/docs` | Swagger UI (auto-generated) |
| GET | `/redoc` | ReDoc (auto-generated) |

## Project Structure

```
backend/
├── app/
│   ├── main.py          # FastAPI app entrypoint
│   ├── core/            # Configuration and settings
│   ├── api/routes/      # API route handlers
│   ├── models/          # Database models (future)
│   ├── schemas/         # Pydantic request/response schemas
│   ├── services/        # Business logic layer
│   ├── repositories/    # Data access layer
│   └── utils/           # Utility functions
├── tests/               # Test suite
├── requirements.txt
└── Dockerfile
```
