import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createDeck, shuffleDeck } from '../lib/deck'
import { evaluateHand, getPayout } from '../lib/evaluateHand'
import type { PlayingCard } from '../types/card'
import type { Player } from '../types/player'
import type { PokerHand } from '../types/poker'

export const STARTING_COINS = 100
export const MIN_BET = 1
export const MAX_BET = 5
export const HAND_SIZE = 5

export type RoundStage = 'betting' | 'holding'

export interface RoundResult {
  hand: PokerHand
  payout: number
}

interface GameState {
  players: Player[]
  currentPlayerId: string | null
  deck: PlayingCard[]
  hand: PlayingCard[]
  held: boolean[]
  discarded: PlayingCard[]
  bet: number
  stage: RoundStage
  lastResult: RoundResult | null

  addPlayer: (name: string) => void
  selectPlayer: (id: string) => void
  setBet: (bet: number) => void
  deal: () => void
  toggleHold: (index: number) => void
  draw: () => void
}

function resetRound(bet: number) {
  return {
    deck: [] as PlayingCard[],
    hand: [] as PlayingCard[],
    held: [] as boolean[],
    discarded: [] as PlayingCard[],
    stage: 'betting' as RoundStage,
    lastResult: null,
    bet,
  }
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      players: [],
      currentPlayerId: null,
      deck: [],
      hand: [],
      held: [],
      discarded: [],
      bet: MIN_BET,
      stage: 'betting',
      lastResult: null,

      addPlayer: (name) => {
        const trimmed = name.trim()
        if (!trimmed) return
        const newPlayer: Player = {
          id: crypto.randomUUID(),
          name: trimmed,
          coins: STARTING_COINS,
        }
        set((state) => ({
          players: [...state.players, newPlayer],
          currentPlayerId: newPlayer.id,
          ...resetRound(MIN_BET),
        }))
      },

      selectPlayer: (id) => {
        if (id === get().currentPlayerId) return
        set(() => ({
          currentPlayerId: id,
          ...resetRound(MIN_BET),
        }))
      },

      setBet: (bet) => {
        if (get().stage !== 'betting') return
        const clamped = Math.min(MAX_BET, Math.max(MIN_BET, bet))
        set({ bet: clamped })
      },

      deal: () => {
        const state = get()
        const player = state.players.find((p) => p.id === state.currentPlayerId)
        if (!player || state.stage !== 'betting') return
        if (player.coins < state.bet) return

        const shuffled = shuffleDeck(createDeck())
        const hand = shuffled.slice(0, HAND_SIZE)
        const deck = shuffled.slice(HAND_SIZE)

        set({
          players: state.players.map((p) =>
            p.id === player.id ? { ...p, coins: p.coins - state.bet } : p,
          ),
          deck,
          hand,
          held: hand.map(() => false),
          discarded: [],
          stage: 'holding',
          lastResult: null,
        })
      },

      toggleHold: (index) => {
        const state = get()
        if (state.stage !== 'holding') return
        set({
          held: state.held.map((value, i) => (i === index ? !value : value)),
        })
      },

      draw: () => {
        const state = get()
        if (state.stage !== 'holding') return
        const player = state.players.find((p) => p.id === state.currentPlayerId)
        if (!player) return

        const deck = [...state.deck]
        const discarded = [...state.discarded]
        const newHand = state.hand.map((card, index) => {
          if (state.held[index]) return card
          const drawnCard = deck.shift()
          if (drawnCard) discarded.push(card)
          return drawnCard ?? card
        })

        const resultHand = evaluateHand(newHand)
        const payout = getPayout(resultHand, newHand, state.bet)

        set({
          players: state.players.map((p) =>
            p.id === player.id ? { ...p, coins: p.coins + payout } : p,
          ),
          deck,
          hand: newHand,
          discarded,
          stage: 'betting',
          lastResult: { hand: resultHand, payout },
        })
      },
    }),
    {
      name: 'poker-game-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
