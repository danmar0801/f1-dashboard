# F1 Dashboard backend

FastAPI serves race data loaded through FastF1. See the [project README](../README.md) for complete setup and API details.

Requires Python 3.14 or newer and uv. From this directory:

```bash
uv sync
uv run uvicorn main:app --reload
```

Open http://localhost:8000/docs for interactive API documentation. `/meta`, `/laps`, and `/stints` default to Monza 2024. The first data request may take a while to load the race.

`main.py` defines the API routes; `data.py` loads and shapes race data. FastF1 creates a local `cache` directory when loading a session.
