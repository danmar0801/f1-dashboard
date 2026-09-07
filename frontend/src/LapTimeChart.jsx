import { extent, line, scaleLinear, schemeTableau10 } from 'd3'

// D3 calculates coordinates; React draws the SVG elements.
export default function LapTimeChart({ lapData, selectedDrivers, drivers }) {
  const series = lapData
    .filter((entry) => selectedDrivers.includes(entry.driver))
    .map((entry) => ({
      ...entry,
      laps: entry.laps
        .filter((point) => Number.isFinite(point.lap) && Number.isFinite(point.time))
        .sort((a, b) => a.lap - b.lap),
    }))
  const points = series.flatMap((entry) => entry.laps)

  if (selectedDrivers.length === 0) {
    return <div className="chart-placeholder">Select drivers above to compare lap times.</div>
  }
  if (points.length === 0) {
    return <div className="chart-placeholder">No lap times available for these drivers.</div>
  }

  const width = 900
  const height = 380
  const margin = { top: 20, right: 20, bottom: 55, left: 70 }
  const [minimum, maximum] = extent(points, (point) => point.time)
  const lastLap = Math.max(2, ...lapData.flatMap((entry) => entry.laps.map((point) => point.lap)).filter(Number.isFinite))
  const x = scaleLinear().domain([1, lastLap]).range([margin.left, width - margin.right])
  const y = scaleLinear().domain([minimum - 1, maximum + 1]).nice().range([height - margin.bottom, margin.top])
  const drawLine = line().x((point) => x(point.lap)).y((point) => y(point.time))
  // Use the full driver list so selecting another driver doesn't change colors.
  const driverIndex = (code) => Math.max(0, drivers.findIndex((driver) => driver.code === code))
  const color = (code) => schemeTableau10[driverIndex(code) % 10]
  const dash = (code) => driverIndex(code) >= 10 ? '6 4' : undefined

  return (
    <div className="lap-chart">
      <ul className="chart-legend" aria-label="Chart legend">
        {series.map((entry) => (
          <li key={entry.driver}>
            <svg width="24" height="12" aria-hidden="true">
              <line x1="0" y1="6" x2="24" y2="6" stroke={color(entry.driver)} strokeWidth="3" strokeDasharray={dash(entry.driver)} />
            </svg>
            {entry.driver}
          </li>
        ))}
      </ul>
      <div className="chart-scroll" tabIndex={0} role="region" aria-label="Lap-time chart, scroll horizontally on small screens">
        <svg className="lap-chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Lap times in seconds by lap for ${selectedDrivers.join(', ')}`}>
          {y.ticks(6).map((tick) => (
            <g key={tick}>
              <line x1={margin.left} x2={width - margin.right} y1={y(tick)} y2={y(tick)} stroke="#383838" />
              <text x={margin.left - 10} y={y(tick)} dy="0.35em" textAnchor="end">{tick}</text>
            </g>
          ))}
          {x.ticks(10).filter(Number.isInteger).map((tick) => (
            <text key={tick} x={x(tick)} y={height - margin.bottom + 24} textAnchor="middle">{tick}</text>
          ))}
          <text x={width / 2} y={height - 8} textAnchor="middle">Lap number</text>
          <text transform={`translate(18 ${height / 2}) rotate(-90)`} textAnchor="middle">Lap time (seconds)</text>
          {series.map((entry) => (
            <g key={entry.driver}>
              <path d={drawLine(entry.laps)} fill="none" stroke={color(entry.driver)} strokeWidth="2" strokeDasharray={dash(entry.driver)} />
              {entry.laps.map((point) => (
                <circle key={point.lap} cx={x(point.lap)} cy={y(point.time)} r="3" fill={color(entry.driver)}>
                  <title>{`${entry.driver} · Lap ${point.lap}: ${point.time.toFixed(3)} seconds`}</title>
                </circle>
              ))}
            </g>
          ))}
        </svg>
      </div>
      <p className="selection-summary">Hover over a point for its time. All recorded lap times are included, including pit laps.</p>
    </div>
  )
}
