import { Navigate } from 'react-router-dom'
import Game from '../components/Game/Game'
import { useGameStore } from '../store/gameStore'

function GamePage() {
  const currentPlayerId = useGameStore((state) => state.currentPlayerId)

  if (!currentPlayerId) {
    return <Navigate to="/spillere" replace />
  }

  return <Game />
}

export default GamePage
