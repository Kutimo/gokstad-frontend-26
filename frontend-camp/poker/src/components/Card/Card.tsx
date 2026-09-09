import { SUIT_SYMBOLS, type PlayingCard } from '../../types/card'
import './Card.css'

interface CardProps {
  card: PlayingCard
  /** Show the back of the card instead of its face. */
  faceDown?: boolean
  /** Whether the card is currently held (kept) by the player. */
  held?: boolean
  /** When provided, the card becomes an interactive hold/discard toggle. */
  onToggleHold?: () => void
  disabled?: boolean
  label?: string
}

const RED_SUITS = new Set(['diamonds', 'hearts'])

/**
 * A single playing card, front or back. Face-down is handled inside this same
 * component (via the `faceDown` prop) rather than as a separate component,
 * since the two states share the same size/shape/wrapper and toggling
 * between them is just a matter of which CSS classes and content render -
 * splitting it in two would mean duplicating that shared shell.
 */
function Card({ card, faceDown = false, held = false, onToggleHold, disabled, label }: CardProps) {
  const isRed = RED_SUITS.has(card.suit)
  const colorClass = isRed ? 'card--red' : 'card--black'
  const suitSymbol = SUIT_SYMBOLS[card.suit]

  const content = faceDown ? (
    <div className="card card--back" aria-hidden="true" />
  ) : (
    <div className={`card card--face ${colorClass}`}>
      <span className="card__corner card__corner--tl">
        <span className="card__rank">{card.rank}</span>
        <span className="card__suit">{suitSymbol}</span>
      </span>
      <span className="card__center" aria-hidden="true">
        {suitSymbol}
      </span>
      <span className="card__corner card__corner--br">
        <span className="card__rank">{card.rank}</span>
        <span className="card__suit">{suitSymbol}</span>
      </span>
    </div>
  )

  const cardName = `${card.rank} ${suitSymbol}`

  if (!onToggleHold) {
    return (
      <div className="card-slot">
        {content}
        {label && <span className="card-slot__label">{label}</span>}
      </div>
    )
  }

  return (
    <div className="card-slot">
      <button
        type="button"
        className={`card-slot__button ${held ? 'card-slot__button--held' : ''}`}
        onClick={onToggleHold}
        disabled={disabled}
        aria-pressed={held}
        aria-label={faceDown ? 'Skjult kort' : `${cardName}${held ? ', holdt' : ''}`}
      >
        {content}
      </button>
      <span className="card-slot__label">{label ?? (held ? 'Holdt' : ' ')}</span>
    </div>
  )
}

export default Card
