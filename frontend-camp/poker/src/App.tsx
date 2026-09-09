import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom'
import NavBar from './components/NavBar/NavBar'
import GamePage from './pages/GamePage'
import PlayersPage from './pages/PlayersPage'
import RulesPage from './pages/RulesPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div id="app-shell">
        <NavBar />
        <main>
          <Routes>
            <Route path="/" element={<GamePage />} />
            <Route path="/regler" element={<RulesPage />} />
            <Route path="/spillere" element={<PlayersPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
