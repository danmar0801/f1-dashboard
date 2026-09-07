# F1 Dashboard

A learning project for comparing driver lap times and tire strategies from the 2024 Italian Grand Prix at Monza.

The frontend uses React, Vite, and D3. The backend uses FastAPI and FastF1 to load race data.

## Features

- Horizontally scrolling cards for all 20 drivers at Monza 2024.
- Multiple driver selection shared by both charts.
- Lap-time lines with a driver legend and exact times on hover.
- Tire-stint bars with compound colors, hover details, and an expandable text breakdown.
- Loading, error, and empty-selection messages.

## Requirements

- Node.js 22.12 or newer and npm.
- Python 3.14 or newer and uv.
- Internet access for dependency installation and the initial race-data download.

## Run locally

Run both servers in separate terminals. Commands below start from the repository root.

### Backend

```bash
cd backend
uv sync
uv run uvicorn main:app --reload
```

The API runs at http://localhost:8000. Interactive API documentation is at http://localhost:8000/docs.

The first race request can take a while while FastF1 downloads and processes data. FastF1 caches data in a `cache` directory relative to the backend's working directory; loaded sessions are also cached in server memory.

### Frontend

In another terminal:

```bash
cd frontend
npm ci
npm run dev -- --port 5173 --strictPort
```

Open http://localhost:5173. Keep both terminals running. Select driver cards to populate both charts, and click a selected card again to remove that driver. Scroll sideways through the cards; chart areas also scroll on narrow screens.

## Project structure

- `frontend/src/App.jsx`: race page, driver selection, and API requests.
- `frontend/src/LapTimeChart.jsx`: lap-time chart.
- `frontend/src/TireStrategyChart.jsx`: tire-stint chart.
- `frontend/src/App.css`: dashboard and chart styles.
- `frontend/src/index.css`: global page styles.
- `backend/main.py`: API routes and session caching.
- `backend/data.py`: race loading and conversion to JSON-ready data.

## API

- `GET /meta`: event details and driver metadata.
- `GET /laps`: lap times in seconds, grouped by driver.
- `GET /stints`: tire compounds and inclusive starting/ending laps, grouped by driver.

The endpoints default to Monza 2024 and accept `year` and `event` query parameters. The current frontend uses the default race and a fixed Monza 2024 driver list; it does not yet provide a race selector.

## Checks

From the repository root:

```bash
npm --prefix frontend run build
npm --prefix frontend run lint
```

These check compilation and linting. They do not replace testing the charts in a browser with the backend running.

## Troubleshooting and limitations

- If requests fail, confirm the backend is running on port 8000 and open `/docs` to check it.
- Use frontend port 5173: the backend allows browser requests from `localhost:5173` and `127.0.0.1:5173`.
- If the first load is slow, check the backend terminal for download progress or errors. Refresh after resolving a connection error.
- Lap times include pit laps and other slow recorded laps, which can stretch the vertical scale.
- The frontend API address is currently fixed to `http://localhost:8000`. Deployment requires configuring the API address and allowed origins.
- End-to-end browser verification remains a final manual check. This project is currently intended for local use.
