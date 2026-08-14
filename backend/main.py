"""FastAPI app for the F1 dashboard.

Delivery layer only. All data shaping happens in data.py; this file
loads a session once, keeps it in memory, and serves the results as JSON.

Run from the backend/ folder:
    uv run uvicorn main:app --reload

Then open http://localhost:8000/laps or http://localhost:8000/docs
"""

from functools import lru_cache

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from data import get_lap_times, get_stints, load_session

app = FastAPI(title="F1 Dashboard API")

# The Vite dev server runs on a different port than this API, so the browser
# treats it as a different origin and blocks the requests unless we allow it.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

DEFAULT_YEAR = 2024
DEFAULT_EVENT = "Monza"


@lru_cache(maxsize=4)
def get_session(year: int, event: str):
    """Load a session once and reuse it.

    session.load() takes seconds even with a warm disk cache, so without
    this every request would re-load and the UI would feel broken.
    lru_cache keeps the last 4 races in memory; asking for a 5th evicts
    the least recently used one.
    """
    return load_session(year, event)


def resolve_session(year: int, event: str):
    """Load a session, or return a clean 404 if the race doesn't exist."""
    try:
        return get_session(year, event)
    except Exception as exc:
        raise HTTPException(
            status_code=404,
            detail=f"Could not load {event} {year}: {exc}",
        )


# Query parameters with defaults, so /laps works bare during development
# and /laps?year=2023&event=Silverstone works in Stage 8 with no new code.
YearParam = Query(default=DEFAULT_YEAR, ge=2018, le=2100)
EventParam = Query(default=DEFAULT_EVENT)


@app.get("/")
def root():
    """Tiny index so hitting the base URL isn't a 404."""
    return {
        "name": "F1 Dashboard API",
        "endpoints": ["/meta", "/laps", "/stints"],
        "docs": "/docs",
    }


@app.get("/meta")
def meta(year: int = YearParam, event: str = EventParam):
    """Race info and the driver list, for page headers and selectors."""
    session = resolve_session(year, event)
    laps = session.laps

    drivers = []
    for code in laps["Driver"].unique():
        driver_laps = laps[laps["Driver"] == code]
        team = driver_laps["Team"].iloc[0]
        drivers.append(
            {
                "code": str(code),
                "team": str(team),
                # FastF1 knows the official team colours; using them means the
                # lap chart is readable without inventing a palette.
                "color": f"#{session.get_driver(code)['TeamColor']}",
            }
        )

    drivers.sort(key=lambda d: d["code"])

    return {
        "year": year,
        "event": session.event["EventName"],
        "location": session.event["Location"],
        "totalLaps": int(laps["LapNumber"].max()),
        "drivers": drivers,
    }


@app.get("/laps")
def laps(year: int = YearParam, event: str = EventParam):
    """Lap times per driver, in seconds."""
    session = resolve_session(year, event)
    return get_lap_times(session)


@app.get("/stints")
def stints(year: int = YearParam, event: str = EventParam):
    """Tire stints per driver: compound, start lap, end lap."""
    session = resolve_session(year, event)
    return get_stints(session)