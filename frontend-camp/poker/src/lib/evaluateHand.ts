import { RANK_VALUES, type PlayingCard } from '../types/card'
import { PAYOUT_TABLE, type PokerHand } from '../types/poker'

const QUALIFYING_PAIR_VALUE = RANK_VALUES.J

function countBy<T>(items: T[], key: (item: T) => string | number) {
  const counts = new Map<string | number, number>()
  for (const item of items) {
    const k = key(item)
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  return counts
}

function isStraight(values: number[]): boolean {
  const sorted = [...values].sort((a, b) => a - b)
  const isSequential = sorted.every(
    (value, index) => index === 0 || value === sorted[index - 1] + 1,
  )
  if (isSequential) return true

  // Special case: Ace-low straight (A-2-3-4-5)
  const aceLow = sorted.map((value) => (value === 14 ? 1 : value)).sort((a, b) => a - b)
  return aceLow.every((value, index) => index === 0 || value === aceLow[index - 1] + 1)
}

/** Finds the rank value of a pair in the hand, if one exists. Used to decide if a pair qualifies for payout. */
function highestPairValue(cards: PlayingCard[]): number | null {
  const counts = countBy(cards, (card) => RANK_VALUES[card.rank])
  const pairValues = [...counts.entries()]
    .filter(([, count]) => count === 2)
    .map(([value]) => Number(value))
  return pairValues.length > 0 ? Math.max(...pairValues) : null
}

/** Evaluates a five-card hand and returns which PokerHand it represents. */
export function evaluateHand(cards: PlayingCard[]): PokerHand {
  if (cards.length !== 5) return 'Ingenting'

  const values = cards.map((card) => RANK_VALUES[card.rank])
  const suits = cards.map((card) => card.suit)
  const flush = suits.every((suit) => suit === suits[0])
  const straight = isStraight(values)

  const rankCounts = [...countBy(cards, (card) => card.rank).values()].sort(
    (a, b) => b - a,
  )

  if (straight && flush) {
    const sorted = [...values].sort((a, b) => a - b)
    const isRoyal = sorted.join(',') === [10, 11, 12, 13, 14].join(',')
    return isRoyal ? 'Royal flush' : 'Straight flush'
  }
  if (rankCounts[0] === 4) return 'Firkort'
  if (rankCounts[0] === 3 && rankCounts[1] === 2) return 'Fullt hus'
  if (flush) return 'Flush'
  if (straight) return 'Straight'
  if (rankCounts[0] === 3) return 'Tre like'
  if (rankCounts[0] === 2 && rankCounts[1] === 2) return 'To par'
  if (rankCounts[0] === 2) return 'Par'
  return 'Ingenting'
}

/**
 * Beregner utbetaling for en hånd. "Par" gir kun utbetaling dersom paret er
 * knekter (J) eller bedre - reglene for dette forklares på regel-siden.
 */
export function getPayout(hand: PokerHand, cards: PlayingCard[], bet: number): number {
  if (hand === 'Par') {
    const pairValue = highestPairValue(cards)
    if (pairValue === null || pairValue < QUALIFYING_PAIR_VALUE) return 0
  }
  return PAYOUT_TABLE[hand] * bet
}
