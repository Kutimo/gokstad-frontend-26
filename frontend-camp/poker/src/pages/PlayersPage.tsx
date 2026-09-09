import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import './PlayersPage.css'

function PlayersPage() {
  const navigate = useNavigate()
  const players = useGameStore((state) => state.players)
  const currentPlayerId = useGameStore((state) => state.currentPlayerId)
  const addPlayer = useGameStore((state) => state.addPlayer)
  const selectPlayer = useGameStore((state) => state.selectPlayer)
  const [newName, setNewName] = useState('')

  function handleSelect(id: string) {
    selectPlayer(id)
    navigate('/')
  }

  function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!newName.trim()) return
    addPlayer(newName)
    setNewName('')
    navigate('/')
  }

  return (
    <div className="players-page">
      <h1>Velg spiller</h1>

      {players.length === 0 ? (
        <p>Det finnes ingen spillere ennå. Opprett en under.</p>
      ) : (
        <ul className="players-page__list">
          {players.map((player) => (
            <li key={player.id}>
              <button
                type="button"
                className={`players-page__player ${
                  player.id === currentPlayerId ? 'players-page__player--active' : ''
                }`}
                onClick={() => handleSelect(player.id)}
                aria-current={player.id === currentPlayerId ? 'true' : undefined}
              >
                <span className="players-page__name">{player.name}</span>
                <span className="players-page__coins">{player.coins} mynter</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <form className="players-page__form" onSubmit={handleCreate}>
        <label htmlFor="new-player-name">Ny spiller</label>
        <div className="players-page__form-row">
          <input
            id="new-player-name"
            type="text"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Skriv inn navn"
            maxLength={30}
            required
          />
          <button type="submit">Opprett spiller</button>
        </div>
        <p className="players-page__hint">Nye spillere starter med 100 mynter.</p>
      </form>
    </div>
  )
}

export default PlayersPage
