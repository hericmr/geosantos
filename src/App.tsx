import Map from './components/Map'
import './App.css'

function App() {
  return (
    <div style={{
      margin: 0,
      padding: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden'
    }}>
      <Map center={[-23.9618, -46.3322]} zoom={13} />
    </div>
  )
}

export default App
