import type { PokerHand } from '../../types/poker'
import '../../styles/stat-box.css'
import './CurrentHand.css'

interface CurrentHandProps {
  hand: PokerHand | null
  payout?: number
}

function CurrentHand({ hand, payout }: CurrentHandProps) {
  return (
    <div className="stat-box current-hand" role="status" aria-live="polite">
      <span className="stat-box__label">Hånd</span>
      <span className="stat-box__value">{hand ?? '—'}</span>
      {payout !== undefined && payout > 0 && (
        <span className="current-hand__payout">+{payout} mynter!</span>
      )}
    </div>
  )
}

export default CurrentHand
