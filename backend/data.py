"""Data layer for the F1 dashboard.

Loads a session via FastF1 and reshapes it into plain, JSON-ready
Python structures (lists, dicts, ints, floats, strings only).

This module never writes files and never reads the cache directly.
FastF1 manages the cache; Stage 3's API will import these functions.
"""

import os

import fastf1

CACHE_DIR = "./cache"


def load_session(year: int, event: str, session_type: str = "R"):
    """Load one session (default: the Race) and return it.

    The first load of a session downloads and caches it (slow).
    Later loads read from ./cache (fast).
    """
    os.makedirs(CACHE_DIR, exist_ok=True)  # avoids NotADirectoryError on a fresh clone
    fastf1.Cache.enable_cache(CACHE_DIR)
    session = fastf1.get_session(year, event, session_type)
    session.load()
    return session


def get_lap_times(session):
    """Return lap times grouped by driver, in seconds.

    Shape:
    [
      {"driver": "LEC", "laps": [{"lap": 1, "time": 88.179}, ...]},
      ...
    ]
    """
    laps = session.laps
    result = []

    for driver in laps["Driver"].unique():
        # Rows for this driver only, minus laps with no recorded time
        # (in-laps / red-flag laps produce NaT, which is not valid JSON).
        driver_laps = laps[laps["Driver"] == driver].dropna(subset=["LapTime"])

        lap_numbers = driver_laps["LapNumber"].astype(int)
        lap_seconds = driver_laps["LapTime"].dt.total_seconds()  # timedelta -> float

        laps_list = [
            {"lap": int(n), "time": round(float(t), 3)}
            for n, t in zip(lap_numbers, lap_seconds)
        ]

        result.append({"driver": str(driver), "laps": laps_list})

    return result


def get_stints(session):
    """Return tire stints grouped by driver.

    Shape:
    [
      {"driver": "LEC", "stints": [
          {"stint": 1, "compound": "MEDIUM", "startLap": 1, "endLap": 14},
          ...
      ]},
      ...
    ]
    """
    laps = session.laps.dropna(subset=["Stint", "Compound"])
    result = []

    for driver in laps["Driver"].unique():
        driver_laps = laps[laps["Driver"] == driver]
        stints = []

        for stint_num in sorted(driver_laps["Stint"].unique()):
            stint_laps = driver_laps[driver_laps["Stint"] == stint_num]
            stints.append(
                {
                    "stint": int(stint_num),
                    "compound": str(stint_laps["Compound"].iloc[0]),
                    "startLap": int(stint_laps["LapNumber"].min()),
                    "endLap": int(stint_laps["LapNumber"].max()),
                }
            )

        result.append({"driver": str(driver), "stints": stints})

    return result


if __name__ == "__main__":
    # Quick manual test: run with `uv run python data.py`
    import json

    session = load_session(2024, "Monza")

    lap_data = get_lap_times(session)
    stint_data = get_stints(session)

    print("--- first driver, first 3 laps ---")
    first = {"driver": lap_data[0]["driver"], "laps": lap_data[0]["laps"][:3]}
    print(json.dumps(first, indent=2))

    print("\n--- first driver, stints ---")
    print(json.dumps(stint_data[0], indent=2))

    # The real Stage 2 checkpoint: everything serializes to JSON.
    json.dumps(lap_data)
    json.dumps(stint_data)
    print(f"\nOK: {len(lap_data)} drivers, all output JSON-serializable.")