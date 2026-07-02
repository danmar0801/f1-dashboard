import fastf1

fastf1.Cache.enable_cache("./cache")              # caches data to disk
session = fastf1.get_session(2024, "Monza", "R")  # year, event, session (R = race)
session.load()

print(session.laps[["Driver", "LapNumber", "LapTime", "Compound"]].head())
