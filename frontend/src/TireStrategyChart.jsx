import { scaleLinear } from 'd3'

const compounds = {
  SOFT: '#ef4444',
  MEDIUM: '#facc15',
  HARD: '#f5f5f5',
  INTERMEDIATE: '#4ade80',
  WET: '#60a5fa',
  UNKNOWN: '#a3a3a3',
}

export default function TireStrategyChart({ stintData, selectedDrivers }) {
  const rows = selectedDrivers.map((driver) => ({
    driver,
    stints: (stintData.find((entry) => entry.driver === driver)?.stints ?? [])
      .filter((stint) => Number.isFinite(stint.startLap) && Number.isFinite(stint.endLap) && stint.startLap >= 1 && stint.endLap >= stint.startLap),
  }))

  if (rows.length === 0) {
    return <div className="chart-placeholder">Select drivers above to compare tire strategies.</div>
  }
  if (!rows.some((row) => row.stints.length)) {
    return <div className="chart-placeholder">No tire data available for these drivers.</div>
  }

  const width = 900
  const rowHeight = 48
  const height = rows.length * rowHeight + 75
  const lastLap = Math.max(1, ...stintData.flatMap((entry) => entry.stints.map((stint) => stint.endLap)).filter(Number.isFinite))
  // Lap boundaries give even a one-lap stint a visible width.
  const x = scaleLinear().domain([0.5, lastLap + 0.5]).range([70, width - 20])
  const ticks = [...new Set([1, ...x.ticks(10).filter((tick) => Number.isInteger(tick) && tick >= 1 && tick <= lastLap), lastLap])]

  return (
    <div className="lap-chart">
      <ul className="chart-legend" aria-label="Tire compounds">
        {Object.entries(compounds).map(([compound, color]) => (
          <li key={compound}>
            <span className="compound-swatch" style={{ background: color }} />
            {compound.toLowerCase()}
          </li>
        ))}
      </ul>
      <div className="chart-scroll" tabIndex={0} role="region" aria-label="Tire strategy, scroll horizontally on small screens">
        <svg className="lap-chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Tire stints by lap for ${selectedDrivers.join(', ')}`}>
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={x(tick)} x2={x(tick)} y1="10" y2={height - 55} stroke="#383838" />
              <text x={x(tick)} y={height - 30} textAnchor="middle">{tick}</text>
            </g>
          ))}
          {rows.map((row, index) => (
            <g key={row.driver}>
              <text x="58" y={index * rowHeight + 36} textAnchor="end">{row.driver}</text>
              {!row.stints.length && <text x="80" y={index * rowHeight + 36}>No tire data</text>}
              {row.stints.map((stint) => (
                <rect
                  key={stint.stint}
                  x={x(stint.startLap - 0.5)}
                  y={index * rowHeight + 16}
                  width={x(stint.endLap + 0.5) - x(stint.startLap - 0.5)}
                  height="30"
                  fill={compounds[stint.compound] ?? compounds.UNKNOWN}
                  stroke="#202020"
                  strokeWidth="2"
                >
                  <title>{`${row.driver} · ${stint.compound} · Laps ${stint.startLap}–${stint.endLap} (${stint.endLap - stint.startLap + 1} laps)`}</title>
                </rect>
              ))}
            </g>
          ))}
          <text x={width / 2} y={height - 6} textAnchor="middle">Lap number</text>
        </svg>
      </div>
      <details className="selection-summary">
        <summary>View stint details</summary>
        <ul>
          {rows.map((row) => (
            <li key={row.driver}>
              {row.driver}: {row.stints.length ? row.stints.map((stint) => `${stint.compound}, laps ${stint.startLap}–${stint.endLap}`).join('; ') : 'No tire data'}
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
