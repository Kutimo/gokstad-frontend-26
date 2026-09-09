import { POKER_HANDS, PAYOUT_TABLE, type PokerHand } from '../../types/poker'
import './PayoutTable.css'

interface PayoutTableProps {
  /** The hand to visually highlight, e.g. the player's current or last hand. */
  highlightedHand?: PokerHand | null
  bet?: number
}

const HAND_LABELS: Partial<Record<PokerHand, string>> = {
  Par: 'Par (knekter eller bedre)',
}

function PayoutTable({ highlightedHand, bet }: PayoutTableProps) {
  return (
    <table className="payout-table">
      <caption>Gevinster og utbetalinger</caption>
      <thead>
        <tr>
          <th scope="col">Hånd</th>
          <th scope="col">Utbetaling per mynt</th>
          {bet !== undefined && <th scope="col">Med din innsats ({bet})</th>}
        </tr>
      </thead>
      <tbody>
        {POKER_HANDS.map((hand) => {
          const multiplier = PAYOUT_TABLE[hand]
          const isActive = hand === highlightedHand
          return (
            <tr key={hand} className={isActive ? 'payout-table__row--active' : ''}>
              <th scope="row">{HAND_LABELS[hand] ?? hand}</th>
              <td>{multiplier === 0 ? '—' : `x${multiplier}`}</td>
              {bet !== undefined && (
                <td>{multiplier === 0 ? '—' : multiplier * bet}</td>
              )}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default PayoutTable
