import './App.css'
import LapTimeChart from './LapTimeChart'
import { useEffect, useState } from 'react'

// Drivers who raced at Monza in 2024.
const drivers = [
  { code: 'HAM', number: 44, name: 'Lewis Hamilton', team: 'Mercedes' },
  { code: 'RUS', number: 63, name: 'George Russell', team: 'Mercedes' },
  { code: 'LEC', number: 16, name: 'Charles Leclerc', team: 'Ferrari' },
  { code: 'SAI', number: 55, name: 'Carlos Sainz', team: 'Ferrari' },
  { code: 'NOR', number: 4, name: 'Lando Norris', team: 'McLaren' },
  { code: 'PIA', number: 81, name: 'Oscar Piastri', team: 'McLaren' },
  { code: 'VER', number: 1, name: 'Max Verstappen', team: 'Red Bull' },
  { code: 'PER', number: 11, name: 'Sergio Pérez', team: 'Red Bull' },
  { code: 'ALO', number: 14, name: 'Fernando Alonso', team: 'Aston Martin' },
  { code: 'STR', number: 18, name: 'Lance Stroll', team: 'Aston Martin' },
  { code: 'GAS', number: 10, name: 'Pierre Gasly', team: 'Alpine' },
  { code: 'OCO', number: 31, name: 'Esteban Ocon', team: 'Alpine' },
  { code: 'ALB', number: 23, name: 'Alex Albon', team: 'Williams' },
  { code: 'COL', number: 43, name: 'Franco Colapinto', team: 'Williams' },
  { code: 'TSU', number: 22, name: 'Yuki Tsunoda', team: 'RB' },
  { code: 'RIC', number: 3, name: 'Daniel Ricciardo', team: 'RB' },
  { code: 'HUL', number: 27, name: 'Nico Hülkenberg', team: 'Haas' },
  { code: 'MAG', number: 20, name: 'Kevin Magnussen', team: 'Haas' },
  { code: 'BOT', number: 77, name: 'Valtteri Bottas', team: 'Kick Sauber' },
  { code: 'ZHO', number: 24, name: 'Zhou Guanyu', team: 'Kick Sauber' },
]

function App() {
  const [selectedDrivers, setSelectedDrivers] = useState([])
  const [lapData, setLapData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadLaps() {
      try {
        const response = await fetch('http://localhost:8000/laps', {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Could not load lap times.')
        }

        const data = await response.json()
        setLapData(data)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setError(error.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadLaps()

    return () => controller.abort()
  }, [])
  function toggleDriver(code) {
    setSelectedDrivers((current) =>
      current.includes(code)
        ? current.filter((driver) => driver !== code)
        : [...current, code]
    )
  }
  return (
    <main className="dashboard">
      <header className="race-header">
        <p>2024 · Monza</p>
        <h1>Italian Grand Prix</h1>
        <p>Compare driver lap times and tire strategies.</p>
      </header>

      <section className="panel">
        <h2>Drivers</h2>
        <p>Select drivers to compare.</p>

        <div className="driver-slider" role="group" aria-label="Drivers">
          {drivers.map((driver) => (
            <button
              key={driver.code}
              type="button"
              className="driver-card"
              aria-pressed={selectedDrivers.includes(driver.code)}
              onClick={() => toggleDriver(driver.code)}
            >
              <span className="driver-number">{driver.number}</span>
              <span className="driver-name">{driver.name}</span>
              <span>{driver.team}</span>
            </button>
          ))}
        </div>
        <p className="selection-summary">
          {selectedDrivers.length === 0
            ? 'No drivers selected. Choose a driver above.'
            : `Comparing: ${selectedDrivers.join(', ')}`}
        </p>
      </section>

      <section className="panel">
        <h2>Lap times</h2>
        <p>See how each driver's pace changes during the race.</p>
        {loading ? (
          <div className="chart-placeholder">Loading lap times…</div>
        ) : error ? (
          <div className="chart-placeholder" role="alert">{error}</div>
        ) : (
          <LapTimeChart lapData={lapData} selectedDrivers={selectedDrivers} drivers={drivers} />
        )}
      </section>

      <section className="panel">
        <h2>Tire strategy</h2>
        <p>Compare tire compounds and stint lengths.</p>
        <div className="chart-placeholder">Tire-strategy chart goes here</div>
      </section>
    </main>
  )
}

export default App
