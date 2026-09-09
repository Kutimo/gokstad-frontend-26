import { NavLink } from 'react-router-dom'
import { useGameStore } from '../../store/gameStore'
import './NavBar.css'

function NavBar() {
  const players = useGameStore((state) => state.players)
  const currentPlayerId = useGameStore((state) => state.currentPlayerId)
  const currentPlayer = players.find((p) => p.id === currentPlayerId)

  return (
    <header className="nav-bar">
      <p className="nav-bar__title">🃏 Video Poker</p>
      <nav aria-label="Hovednavigasjon">
        <ul className="nav-bar__list">
          <li>
            <NavLink to="/" end>
              Spill
            </NavLink>
          </li>
          <li>
            <NavLink to="/regler">Regler</NavLink>
          </li>
          <li>
            <NavLink to="/spillere">Spillere</NavLink>
          </li>
        </ul>
      </nav>
      <p className="nav-bar__player">
        {currentPlayer ? `Spiller: ${currentPlayer.name}` : 'Ingen spiller valgt'}
      </p>
    </header>
  )
}

export default NavBar
