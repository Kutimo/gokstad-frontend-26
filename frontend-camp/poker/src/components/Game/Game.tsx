import { Link } from 'react-router-dom'
import Card from '../Card/Card'
import CurrentBet from '../CurrentBet/CurrentBet'
import CurrentHand from '../CurrentHand/CurrentHand'
import PayoutTable from '../PayoutTable/PayoutTable'
import TotalCoins from '../TotalCoins/TotalCoins'
import { MAX_BET, MIN_BET, useGameStore } from '../../store/gameStore'
import './Game.css'

function Game() {
  const players = useGameStore((state) => state.players)
  const currentPlayerId = useGameStore((state) => state.currentPlayerId)
  const hand = useGameStore((state) => state.hand)
  const held = useGameStore((state) => state.held)
  const bet = useGameStore((state) => state.bet)
  const stage = useGameStore((state) => state.stage)
  const lastResult = useGameStore((state) => state.lastResult)
  const setBet = useGameStore((state) => state.setBet)
  const deal = useGameStore((state) => state.deal)
  const toggleHold = useGameStore((state) => state.toggleHold)
  const draw = useGameStore((state) => state.draw)

  const player = players.find((p) => p.id === currentPlayerId)

  if (!player) {
    return (
      <p className="game__no-player">
        Ingen spiller er valgt. <Link to="/spillere">Velg en spiller</Link> for å spille.
      </p>
    )
  }

  const isHolding = stage === 'holding'
  const canDeal = !isHolding && player.coins >= bet
  const heldCount = held.filter(Boolean).length

  return (
    <div className="game">
      <div className="game__stats">
        <TotalCoins coins={player.coins} />
        <CurrentBet bet={bet} />
        <CurrentHand hand={lastResult?.hand ?? null} payout={lastResult?.payout} />
      </div>

      <div className="game__table" aria-live="polite">
        {hand.length === 0 ? (
          <p className="game__placeholder">Trykk «Del ut» for å starte en runde.</p>
        ) : (
          <ul className="game__hand">
            {hand.map((card, index) => (
              <li key={index}>
                <Card
                  card={card}
                  held={held[index]}
                  disabled={!isHolding}
                  onToggleHold={isHolding ? () => toggleHold(index) : undefined}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="game__controls">
        {!isHolding && (
          <div className="game__bet-controls">
            <label htmlFor="bet-input">Innsats</label>
            <div className="game__bet-stepper">
              <button
                type="button"
                onClick={() => setBet(bet - 1)}
                disabled={bet <= MIN_BET}
                aria-label="Reduser innsats"
              >
                −
              </button>
              <output id="bet-input">{bet}</output>
              <button
                type="button"
                onClick={() => setBet(bet + 1)}
                disabled={bet >= MAX_BET || bet >= player.coins}
                aria-label="Øk innsats"
              >
                +
              </button>
            </div>
          </div>
        )}

        {isHolding ? (
          <button type="button" className="game__action-button" onClick={draw}>
            Bytt kort ({5 - heldCount} nye)
          </button>
        ) : (
          <button
            type="button"
            className="game__action-button"
            onClick={deal}
            disabled={!canDeal}
          >
            Del ut
          </button>
        )}
      </div>

      {!canDeal && !isHolding && (
        <p className="game__warning" role="alert">
          Du har ikke nok mynter til å satse {bet}.
        </p>
      )}

      <details className="game__payout-details">
        <summary>Gevinster og utbetalinger</summary>
        <PayoutTable highlightedHand={lastResult?.hand} bet={bet} />
      </details>

      <p className="game__help">
        <Link to="/regler">Se fullstendige regler</Link>
      </p>
    </div>
  )
}

export default Game
