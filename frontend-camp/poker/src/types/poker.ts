/** Alle mulige pokerhender en spiller kan sitte igjen med. */
export type PokerHand =
  | 'Ingenting'
  | 'Par'
  | 'To par'
  | 'Tre like'
  | 'Straight'
  | 'Flush'
  | 'Fullt hus'
  | 'Firkort'
  | 'Straight flush'
  | 'Royal flush'

export const POKER_HANDS: PokerHand[] = [
  'Royal flush',
  'Straight flush',
  'Firkort',
  'Fullt hus',
  'Flush',
  'Straight',
  'Tre like',
  'To par',
  'Par',
  'Ingenting',
]

/** Utbetaling per innsatt mynt for hver hånd. "Par" gjelder kun par av knekter eller bedre. */
export const PAYOUT_TABLE: Record<PokerHand, number> = {
  'Royal flush': 250,
  'Straight flush': 50,
  Firkort: 25,
  'Fullt hus': 9,
  Flush: 6,
  Straight: 4,
  'Tre like': 3,
  'To par': 2,
  Par: 1,
  Ingenting: 0,
}
