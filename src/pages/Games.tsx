import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore, type ChildProfile } from '../store/profileStore'
import { supabase } from '../lib/supabase'
import gamesAreaImg from '../img/games_area.png'
import ticTacToeImg from '../img/games/tic_tac_toe.png'
import memoryImg from '../img/games/memory.png'
import treasureHuntImg from '../img/games/treasure_hunt.png'
import treasureCardBackImg from '../img/games/treasure.png'
import betachouImg from '../img/betachou.png'
import mollassonImg from '../img/mollasson.png'
import bobbyImg from '../img/bobby.png'
import dauphinouImg from '../img/dauphinou.png'
import lapinouImg from '../img/lapinou.png'
import tartuffeImg from '../img/tartuffe.png'
import patapamVictoryImg from '../img/patapam_debout.png'
import miniPatapamImg from '../img/patapam_collection/mini_patapam.png'
import patapamExplorateurImg from '../img/patapam_collection/patapam_explorateur.png'
import betachouNightImg from '../img/patapam_collection/betachou_night.png'
import reneLePoneyImg from '../img/patapam_collection/rene_le_poney.png'

type GameKey = 'tictactoe' | 'memory' | 'treasure'
type TicTacToeLevel = 'random' | 'normal' | 'optimized'
type TreasureMode = 'pvp' | 'ai'
type TreasureAiLevel = 1 | 2 | 3 | 4
type TreasureSelectStep = 'mode' | 'pvp-opponent' | 'ai-level'
type Cell = 'X' | 'O' | null
type GamePhase = 'select' | 'play'
interface MemoryCard {
  id: string
  token: string
  image: string
}

type TreasureTileType =
  | 'dauphinou'
  | 'lapinou'
  | 'tartuffe'
  | 'mollasson'
  | 'bobby'
  | 'patapam'
  | 'betachou'
  | 'rene'

interface TreasureTile {
  id: string
  type: TreasureTileType
  image: string
  revealed: boolean
  collectedBy: 0 | 1 | null
}

interface CharacterSummary {
  id: string
  name_fr: string
}

const GAME_ZONES: Array<{ key: GameKey; title: string; top: string; image: string }> = [
  { key: 'tictactoe', title: 'Tic Tac Toe', top: '0%', image: ticTacToeImg },
  { key: 'memory', title: 'Memory', top: '33.333%', image: memoryImg },
  { key: 'treasure', title: 'Chasse au Tresor', top: '66.666%', image: treasureHuntImg },
]

const MEMORY_LEVELS = [
  { level: 1, cards: 6 },
  { level: 2, cards: 10 },
  { level: 3, cards: 14 },
  { level: 4, cards: 18 },
  { level: 5, cards: 24 },
  { level: 6, cards: 30 },
]

const PATAPAM_COLLECTION_IMAGES = Object.values(
  import.meta.glob('../img/patapam_collection/*.{png,jpg,jpeg,webp}', {
    eager: true,
    import: 'default',
  })
) as string[]

const MEMORY_IMAGE_POOL = [
  ...PATAPAM_COLLECTION_IMAGES,
  betachouImg,
  bobbyImg,
  dauphinouImg,
  mollassonImg,
  patapamVictoryImg,
  tartuffeImg,
]

const TREASURE_TILE_CONFIG: Array<{ type: TreasureTileType; count: number; image: string; label: string }> = [
  { type: 'dauphinou', count: 4, image: dauphinouImg, label: 'Dauphinou' },
  { type: 'lapinou', count: 4, image: lapinouImg, label: 'Lapinou' },
  { type: 'tartuffe', count: 4, image: tartuffeImg, label: 'Tartuffe' },
  { type: 'mollasson', count: 8, image: mollassonImg, label: 'Mollasson' },
  { type: 'bobby', count: 6, image: bobbyImg, label: 'Bobby' },
  { type: 'patapam', count: 8, image: patapamVictoryImg, label: 'Patapam' },
  { type: 'betachou', count: 12, image: betachouNightImg, label: 'Betachou' },
  { type: 'rene', count: 3, image: reneLePoneyImg, label: 'Rene le Poney' },
]

const TREASURE_PAIR_TYPES: TreasureTileType[] = ['dauphinou', 'lapinou', 'tartuffe']
const TREASURE_ROW_SIZES = [10, 10, 10, 10, 9]
const TREASURE_AI_LEVELS: Array<{ level: TreasureAiLevel; label: string; image: string }> = [
  { level: 1, label: 'Betachou', image: betachouImg },
  { level: 2, label: 'Mollasson', image: mollassonImg },
  { level: 3, label: 'Tartuffe', image: tartuffeImg },
  { level: 4, label: 'Bobby', image: bobbyImg },
]
const PROFILE_CHARACTER_IMAGES: Record<string, string> = {
  Patapam: miniPatapamImg,
  Bobby: bobbyImg,
  Tartuffe: tartuffeImg,
  Mollasson: mollassonImg,
  Dauphinou: dauphinouImg,
  Betachou: betachouImg,
  Lapinou: lapinouImg,
}

function shuffleArray<T>(input: T[]) {
  const list = [...input]
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = list[i]
    list[i] = list[j]
    list[j] = tmp
  }
  return list
}

export default function Games() {
  const navigate = useNavigate()
  const addCoins = useProfileStore((s) => s.addCoins)
  const activeProfile = useProfileStore((s) => s.activeProfile)
  const [selectedGame, setSelectedGame] = useState<GameKey | null>(null)
  const [gamePhase, setGamePhase] = useState<GamePhase>('select')
  const [ticTacToeLevel, setTicTacToeLevel] = useState<TicTacToeLevel>('normal')
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X')
  const [winner, setWinner] = useState<Cell | 'draw'>(null)
  const [isAiThinking, setIsAiThinking] = useState(false)
  const [rewardCoins, setRewardCoins] = useState(0)
  const [rewardApplied, setRewardApplied] = useState(false)
  const [memoryLevel, setMemoryLevel] = useState<number | null>(null)
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([])
  const [flippedMemoryCards, setFlippedMemoryCards] = useState<number[]>([])
  const [matchedMemoryCards, setMatchedMemoryCards] = useState<number[]>([])
  const [isMemoryLocked, setIsMemoryLocked] = useState(false)
  const [memoryWon, setMemoryWon] = useState(false)
  const [treasureTiles, setTreasureTiles] = useState<TreasureTile[]>([])
  const [treasureSelectStep, setTreasureSelectStep] = useState<TreasureSelectStep>('mode')
  const [treasureMode, setTreasureMode] = useState<TreasureMode>('pvp')
  const [accountProfiles, setAccountProfiles] = useState<ChildProfile[]>([])
  const [accountCharacters, setAccountCharacters] = useState<CharacterSummary[]>([])
  const [treasurePvpOpponentProfileId, setTreasurePvpOpponentProfileId] = useState<string | null>(null)
  const [treasureAiLevel, setTreasureAiLevel] = useState<TreasureAiLevel>(1)
  const [currentTreasurePlayer, setCurrentTreasurePlayer] = useState<0 | 1>(0)
  const [isTreasureLocked, setIsTreasureLocked] = useState(false)
  const [isTreasureAiThinking, setIsTreasureAiThinking] = useState(false)
  const [treasureGameOver, setTreasureGameOver] = useState(false)
  const [treasureWinner, setTreasureWinner] = useState<0 | 1 | null>(null)
  const [treasureMessage, setTreasureMessage] = useState('')
  const aiTimeoutRef = useRef<number | null>(null)
  const memoryTimeoutRef = useRef<number | null>(null)
  const treasureTimeoutRef = useRef<number | null>(null)
  const treasureAiTimeoutRef = useRef<number | null>(null)
  const treasureAiSeenCardsRef = useRef<Map<number, TreasureTileType>>(new Map())
  const treasureAiLastHumanCardRef = useRef<{ index: number; type: TreasureTileType } | null>(null)
  const treasureAiTurnFlipsRef = useRef(0)
  const treasureAiFirstFlipTypeRef = useRef<TreasureTileType | null>(null)
  const treasureAiPriorityTypeRef = useRef<TreasureTileType | null>(null)

  const selectedTitle = GAME_ZONES.find((z) => z.key === selectedGame)?.title

  const winningLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  function getWinner(cells: Cell[]) {
    for (const [a, b, c] of winningLines) {
      if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) return cells[a]
    }
    return cells.every(Boolean) ? 'draw' : null
  }

  function resetTicTacToe() {
    if (aiTimeoutRef.current !== null) {
      window.clearTimeout(aiTimeoutRef.current)
      aiTimeoutRef.current = null
    }
    setBoard(Array(9).fill(null))
    setCurrentPlayer('X')
    setWinner(null)
    setIsAiThinking(false)
    setRewardCoins(0)
    setRewardApplied(false)
  }

  function resetMemory() {
    if (memoryTimeoutRef.current !== null) {
      window.clearTimeout(memoryTimeoutRef.current)
      memoryTimeoutRef.current = null
    }
    setMemoryLevel(null)
    setMemoryCards([])
    setFlippedMemoryCards([])
    setMatchedMemoryCards([])
    setIsMemoryLocked(false)
    setMemoryWon(false)
    setRewardCoins(0)
    setRewardApplied(false)
  }

  function resetTreasureHunt() {
    if (treasureTimeoutRef.current !== null) {
      window.clearTimeout(treasureTimeoutRef.current)
      treasureTimeoutRef.current = null
    }
    if (treasureAiTimeoutRef.current !== null) {
      window.clearTimeout(treasureAiTimeoutRef.current)
      treasureAiTimeoutRef.current = null
    }
    setTreasureTiles([])
    setCurrentTreasurePlayer(0)
    setIsTreasureLocked(false)
    setIsTreasureAiThinking(false)
    setTreasureGameOver(false)
    setTreasureWinner(null)
    setTreasureMessage('')
    setRewardCoins(0)
    setRewardApplied(false)
    treasureAiSeenCardsRef.current = new Map()
    treasureAiLastHumanCardRef.current = null
    treasureAiTurnFlipsRef.current = 0
    treasureAiFirstFlipTypeRef.current = null
    treasureAiPriorityTypeRef.current = null
  }

  function startTreasureHunt(mode: TreasureMode, aiLevel: TreasureAiLevel = 1) {
    setTreasureMode(mode)
    setTreasureAiLevel(aiLevel)
    resetTreasureHunt()
    setGamePhase('play')

    const deck: TreasureTile[] = []
    for (const cfg of TREASURE_TILE_CONFIG) {
      for (let idx = 0; idx < cfg.count; idx += 1) {
        deck.push({
          id: `${cfg.type}-${idx}`,
          type: cfg.type,
          image: cfg.image,
          revealed: false,
          collectedBy: null,
        })
      }
    }
    setTreasureTiles(shuffleArray(deck))
    setTreasureMessage(`Tour de ${activeProfile?.name ?? 'Joueur 1'}`)
  }

  function getTreasurePlayerLabel(player: 0 | 1) {
    if (player === 0) return activeProfile?.name ?? 'Joueur 1'
    if (treasureMode === 'ai' && player === 1) return `IA Niv ${treasureAiLevel}`
    if (treasureMode === 'pvp' && player === 1) {
      return selectedPvpOpponent?.name ?? 'Invite'
    }
    return 'Joueur 2'
  }

  function selectTreasureMode(mode: TreasureMode) {
    setTreasureMode(mode)
    setTreasureSelectStep(mode === 'pvp' ? 'pvp-opponent' : 'ai-level')
  }

  function randomFromList<T>(list: T[]) {
    if (list.length === 0) return null
    return list[Math.floor(Math.random() * list.length)]
  }

  function getHiddenTreasureIndices(tiles: TreasureTile[]) {
    return tiles
      .map((tile, index) => ({ tile, index }))
      .filter(({ tile }) => tile.collectedBy === null && !tile.revealed)
      .map(({ index }) => index)
  }

  function getVisibleTreasureIndices(tiles: TreasureTile[]) {
    return tiles
      .map((tile, index) => ({ tile, index }))
      .filter(({ tile }) => tile.collectedBy === null && tile.revealed)
      .map(({ index }) => index)
  }

  function getTreasureCoords(index: number) {
    let offset = 0
    for (let row = 0; row < TREASURE_ROW_SIZES.length; row += 1) {
      const size = TREASURE_ROW_SIZES[row]
      if (index < offset + size) return { row, col: index - offset }
      offset += size
    }
    return { row: -1, col: -1 }
  }

  function getTreasureIndexFromCoords(row: number, col: number) {
    if (row < 0 || row >= TREASURE_ROW_SIZES.length) return null
    if (col < 0 || col >= TREASURE_ROW_SIZES[row]) return null

    let offset = 0
    for (let r = 0; r < row; r += 1) {
      offset += TREASURE_ROW_SIZES[r]
    }
    return offset + col
  }

  function getAdjacentTreasureIndices(index: number, tiles: TreasureTile[]) {
    const { row, col } = getTreasureCoords(index)
    if (row < 0) return [] as number[]

    const candidateCoords: Array<{ row: number; col: number }> = [
      { row, col: col - 1 },
      { row, col: col + 1 },
      { row: row - 1, col },
      { row: row + 1, col },
      { row: row - 1, col: col - 1 },
      { row: row + 1, col: col - 1 },
    ]

    return candidateCoords
      .map(({ row: nextRow, col: nextCol }) => getTreasureIndexFromCoords(nextRow, nextCol))
      .filter((idx): idx is number => idx !== null)
      .filter((idx, idxPos, arr) => arr.indexOf(idx) === idxPos)
      .filter((idx) => {
        const tile = tiles[idx]
        return !!tile && tile.collectedBy === null && !tile.revealed
      })
  }

  function pickFromSeenMemory(
    tiles: TreasureTile[],
    predicate: (type: TreasureTileType) => boolean,
    excludedIndices: number[] = []
  ) {
    const excludedSet = new Set(excludedIndices)
    const candidates = [...treasureAiSeenCardsRef.current.entries()]
      .filter(([index, type]) => {
        if (!predicate(type) || excludedSet.has(index)) return false
        const tile = tiles[index]
        return !!tile && tile.collectedBy === null && !tile.revealed
      })
      .map(([index]) => index)

    return randomFromList(candidates)
  }

  function pickLevel3Card(tiles: TreasureTile[]) {
    const visible = getVisibleTreasureIndices(tiles)
    const visibleTypes = visible.map((idx) => tiles[idx].type)
    const byType = new Map<TreasureTileType, number[]>()
    for (const idx of visible) {
      const type = tiles[idx].type
      const list = byType.get(type) ?? []
      list.push(idx)
      byType.set(type, list)
    }

    if (visibleTypes.includes('betachou')) {
      const knownBetachou = pickFromSeenMemory(tiles, (type) => type === 'betachou', visible)
      if (knownBetachou !== null) return knownBetachou
    }

    for (const type of TREASURE_PAIR_TYPES) {
      const count = (byType.get(type) ?? []).length
      if (count % 2 === 1) {
        const match = pickFromSeenMemory(tiles, (t) => t === type, visible)
        if (match !== null) return match
      }
    }

    const bobbyVisible = (byType.get('bobby') ?? []).length
    if (bobbyVisible % 3 !== 0) {
      const bobbyPick = pickFromSeenMemory(tiles, (type) => type === 'bobby', visible)
      if (bobbyPick !== null) return bobbyPick
    }

    const patapamVisible = (byType.get('patapam') ?? []).length
    if (patapamVisible % 4 !== 0) {
      const patapamPick = pickFromSeenMemory(tiles, (type) => type === 'patapam', visible)
      if (patapamPick !== null) return patapamPick
    }

    const neutral = pickFromSeenMemory(tiles, (type) => type !== 'rene')
    if (neutral !== null) return neutral

    return randomFromList(getHiddenTreasureIndices(tiles))
  }

  function applyLevel3Error(targetIndex: number, tiles: TreasureTile[]) {
    if (Math.random() >= 0.25) return targetIndex
    const adjacent = getAdjacentTreasureIndices(targetIndex, tiles)
    const mistake = randomFromList(adjacent)
    return mistake ?? targetIndex
  }

  function chooseTreasureAiFlipIndex(tiles: TreasureTile[]) {
    const hidden = getHiddenTreasureIndices(tiles)
    if (hidden.length === 0) return null

    if (treasureAiLevel === 1) {
      return randomFromList(hidden)
    }

    if (treasureAiLevel === 2) {
      if (treasureAiTurnFlipsRef.current === 0 && treasureAiLastHumanCardRef.current) {
        const remembered = treasureAiLastHumanCardRef.current
        const tile = tiles[remembered.index]
        const canStartOnRemembered = !!tile
          && tile.collectedBy === null
          && !tile.revealed
          && remembered.type !== 'rene'
          && Math.random() < 0.7
        if (canStartOnRemembered) {
          return remembered.index
        }
      }
      return randomFromList(hidden)
    }

    if (treasureAiLevel === 3) {
      const target = pickLevel3Card(tiles)
      if (target === null) return null
      const fromMemory = treasureAiSeenCardsRef.current.has(target)
      return fromMemory ? applyLevel3Error(target, tiles) : target
    }

    if (treasureAiTurnFlipsRef.current === 0) {
      const unseen = hidden.filter((idx) => !treasureAiSeenCardsRef.current.has(idx))
      return randomFromList(unseen.length > 0 ? unseen : hidden)
    }

    if (treasureAiPriorityTypeRef.current) {
      const priorityPick = pickFromSeenMemory(tiles, (type) => type === treasureAiPriorityTypeRef.current)
      if (priorityPick !== null) return priorityPick
    }

    return randomFromList(hidden)
  }

  function shouldTreasureAiCollect(tiles: TreasureTile[]) {
    const collectable = getTreasureCollectableIndices(tiles)
    if (collectable.length === 0) return false

    if (treasureAiLevel === 1) {
      return treasureAiTurnFlipsRef.current >= 3
    }

    if (treasureAiLevel === 2) {
      return true
    }

    if (treasureAiLevel === 3) {
      if (treasureAiTurnFlipsRef.current === 1 && treasureAiFirstFlipTypeRef.current === 'betachou') {
        return true
      }
      return collectable.length >= 2
    }

    return true
  }

  function chooseGame(gameKey: GameKey) {
    setSelectedGame(gameKey)
    if (gameKey === 'tictactoe') {
      setGamePhase('select')
      resetTicTacToe()
      resetMemory()
      resetTreasureHunt()
    }
    if (gameKey === 'memory') {
      setGamePhase('select')
      resetMemory()
      resetTicTacToe()
      resetTreasureHunt()
    }
    if (gameKey === 'treasure') {
      setGamePhase('select')
      setTreasureSelectStep('mode')
      resetTreasureHunt()
      resetMemory()
      resetTicTacToe()
    }
  }

  function awardCoins(coinsToAdd: number) {
    if (coinsToAdd <= 0) return

    addCoins(coinsToAdd)
    setRewardCoins(coinsToAdd)

    if (activeProfile?.id) {
      const nextCoins = (activeProfile.coins ?? 0) + coinsToAdd
      void supabase
        .from('profiles')
        .update({ coins: nextCoins })
        .eq('id', activeProfile.id)
        .then(({ error }) => {
          if (error) {
            console.error('Erreur update coins profile:', error)
          }
        })
    }
  }

  function startMemory(level: number) {
    const levelConfig = MEMORY_LEVELS.find((cfg) => cfg.level === level)
    if (!levelConfig) return

    resetMemory()
    setMemoryLevel(level)
    setGamePhase('play')

    const pairsCount = levelConfig.cards / 2
    const selectedImages = shuffleArray(MEMORY_IMAGE_POOL).slice(0, pairsCount)
    const cards = shuffleArray(
      selectedImages.flatMap((image, idx) => [
        { id: `${idx}-a`, token: `${idx}`, image },
        { id: `${idx}-b`, token: `${idx}`, image },
      ])
    )
    setMemoryCards(cards)
  }

  function handleMemoryCardClick(index: number) {
    if (selectedGame !== 'memory' || gamePhase !== 'play' || isMemoryLocked || memoryWon) return
    if (flippedMemoryCards.includes(index) || matchedMemoryCards.includes(index)) return

    if (flippedMemoryCards.length === 0) {
      setFlippedMemoryCards([index])
      return
    }

    const firstIndex = flippedMemoryCards[0]
    const secondIndex = index
    const firstCard = memoryCards[firstIndex]
    const secondCard = memoryCards[secondIndex]
    if (!firstCard || !secondCard) return

    setFlippedMemoryCards([firstIndex, secondIndex])

    if (firstCard.token === secondCard.token) {
      const nextMatched = [...matchedMemoryCards, firstIndex, secondIndex]
      setMatchedMemoryCards(nextMatched)
      setFlippedMemoryCards([])

      if (nextMatched.length === memoryCards.length) {
        setMemoryWon(true)
      }
      return
    }

    setIsMemoryLocked(true)
    memoryTimeoutRef.current = window.setTimeout(() => {
      setFlippedMemoryCards([])
      setIsMemoryLocked(false)
      memoryTimeoutRef.current = null
    }, 700)
  }

  function getTreasureCollectableIndices(tiles: TreasureTile[]) {
    const visibleTiles = tiles
      .map((tile, index) => ({ tile, index }))
      .filter(({ tile }) => tile.revealed && tile.collectedBy === null)

    if (visibleTiles.length === 0) return [] as number[]

    const visibleTypes = visibleTiles.map(({ tile }) => tile.type)
    const onlyBetachou = visibleTypes.every((type) => type === 'betachou')
    if (onlyBetachou) {
      return visibleTiles.map(({ index }) => index)
    }

    const collectable: number[] = []
    const byType = new Map<TreasureTileType, number[]>()
    for (const { tile, index } of visibleTiles) {
      const list = byType.get(tile.type) ?? []
      list.push(index)
      byType.set(tile.type, list)
    }

    const mollasson = byType.get('mollasson') ?? []
    collectable.push(...mollasson)

    for (const type of TREASURE_PAIR_TYPES) {
      const list = byType.get(type) ?? []
      const pairCount = Math.floor(list.length / 2) * 2
      collectable.push(...list.slice(0, pairCount))
    }

    const bobbyList = byType.get('bobby') ?? []
    collectable.push(...bobbyList.slice(0, Math.floor(bobbyList.length / 3) * 3))

    const patapamList = byType.get('patapam') ?? []
    collectable.push(...patapamList.slice(0, Math.floor(patapamList.length / 4) * 4))

    return collectable
  }

  function endTreasureTurn(nextPlayer: 0 | 1) {
    setTreasureTiles((prev) => prev.map((tile) => (
      tile.collectedBy === null && tile.revealed ? { ...tile, revealed: false } : tile
    )))
    setCurrentTreasurePlayer(nextPlayer)
    setTreasureMessage(`Tour de ${getTreasurePlayerLabel(nextPlayer)}`)
    setIsTreasureAiThinking(false)
    treasureAiTurnFlipsRef.current = 0
    treasureAiFirstFlipTypeRef.current = null
    treasureAiPriorityTypeRef.current = null
  }

  function handleTreasureBust(reason: 'betachou' | 'rene') {
    if (treasureGameOver) return

    const nextPlayer: 0 | 1 = currentTreasurePlayer === 0 ? 1 : 0
    setIsTreasureLocked(true)
    setTreasureMessage(reason === 'rene' ? 'Rene le Poney! Tour perdu.' : 'Betachou! Tour perdu.')

    treasureTimeoutRef.current = window.setTimeout(() => {
      endTreasureTurn(nextPlayer)
      setIsTreasureLocked(false)
      treasureTimeoutRef.current = null
    }, 600)
  }

  function handleTreasureCardClick(index: number) {
    if (selectedGame !== 'treasure' || gamePhase !== 'play' || treasureGameOver || isTreasureLocked) return
    if (treasureMode === 'ai' && currentTreasurePlayer === 1) return

    const target = treasureTiles[index]
    if (!target || target.collectedBy !== null || target.revealed) return

    if (treasureMode === 'ai') {
      treasureAiSeenCardsRef.current.set(index, target.type)
      if (currentTreasurePlayer === 0) {
        treasureAiLastHumanCardRef.current = { index, type: target.type }
      }
    }

    const nextTiles = treasureTiles.map((tile, tileIndex) => (
      tileIndex === index ? { ...tile, revealed: true } : tile
    ))
    setTreasureTiles(nextTiles)

    const visibleTypes = nextTiles
      .filter((tile) => tile.revealed && tile.collectedBy === null)
      .map((tile) => tile.type)

    // If a Betachou is visible, only Betachou can continue safely.
    if (target.type !== 'betachou' && visibleTypes.includes('betachou')) {
      handleTreasureBust('betachou')
      return
    }

    if (target.type === 'rene') {
      handleTreasureBust('rene')
      return
    }

    if (target.type === 'betachou') {
      const hasNonBetachou = visibleTypes.some((type) => type !== 'betachou')
      if (hasNonBetachou) {
        handleTreasureBust('betachou')
        return
      }
    }

    setTreasureMessage('Tu peux continuer ou ramasser.')
  }

  function revealTreasureCardForAi(index: number) {
    if (selectedGame !== 'treasure' || gamePhase !== 'play' || treasureGameOver || isTreasureLocked) return
    if (treasureMode !== 'ai' || currentTreasurePlayer !== 1) return

    const target = treasureTiles[index]
    if (!target || target.collectedBy !== null || target.revealed) return

    treasureAiSeenCardsRef.current.set(index, target.type)
    treasureAiTurnFlipsRef.current += 1

    if (treasureAiTurnFlipsRef.current === 1) {
      treasureAiFirstFlipTypeRef.current = target.type
      treasureAiPriorityTypeRef.current = target.type
    }

    const nextTiles = treasureTiles.map((tile, tileIndex) => (
      tileIndex === index ? { ...tile, revealed: true } : tile
    ))
    setTreasureTiles(nextTiles)

    const visibleTypes = nextTiles
      .filter((tile) => tile.revealed && tile.collectedBy === null)
      .map((tile) => tile.type)

    if (target.type !== 'betachou' && visibleTypes.includes('betachou')) {
      handleTreasureBust('betachou')
      return
    }

    if (target.type === 'rene') {
      handleTreasureBust('rene')
      return
    }

    if (target.type === 'betachou') {
      const hasNonBetachou = visibleTypes.some((type) => type !== 'betachou')
      if (hasNonBetachou) {
        handleTreasureBust('betachou')
        return
      }
    }

    setTreasureMessage('L\'IA continue ou ramasse.')
  }

  function handleTreasureCollect() {
    if (selectedGame !== 'treasure' || gamePhase !== 'play' || treasureGameOver || isTreasureLocked) return

    const collectable = getTreasureCollectableIndices(treasureTiles)
    if (collectable.length === 0) return

    setTreasureTiles((prev) => prev.map((tile, index) => (
      collectable.includes(index) ? { ...tile, collectedBy: currentTreasurePlayer, revealed: false } : tile
    )))

    const nextPlayer: 0 | 1 = currentTreasurePlayer === 0 ? 1 : 0
    endTreasureTurn(nextPlayer)
  }

  function bestMove(cells: Cell[], aiMark: 'O' | 'X', humanMark: 'X' | 'O') {
    const availableMoves = cells
      .map((cell, index) => (cell === null ? index : null))
      .filter((index): index is number => index !== null)

    function minimax(nextCells: Cell[], isMaximizing: boolean): number {
      const result = getWinner(nextCells)
      if (result === aiMark) return 10
      if (result === humanMark) return -10
      if (result === 'draw') return 0

      const nextAvailableMoves = nextCells
        .map((cell, index) => (cell === null ? index : null))
        .filter((index): index is number => index !== null)

      if (isMaximizing) {
        let bestScore = -Infinity
        for (const move of nextAvailableMoves) {
          nextCells[move] = aiMark
          const score = minimax(nextCells, false)
          nextCells[move] = null
          bestScore = Math.max(bestScore, score)
        }
        return bestScore
      }

      let bestScore = Infinity
      for (const move of nextAvailableMoves) {
        nextCells[move] = humanMark
        const score = minimax(nextCells, true)
        nextCells[move] = null
        bestScore = Math.min(bestScore, score)
      }
      return bestScore
    }

    let chosenMove = availableMoves[0] ?? 0
    let bestScore = -Infinity

    for (const move of availableMoves) {
      cells[move] = aiMark
      const score = minimax(cells, false)
      cells[move] = null
      if (score > bestScore) {
        bestScore = score
        chosenMove = move
      }
    }

    return chosenMove
  }

  function playAiTurn(nextBoard: Cell[], level: TicTacToeLevel) {
    const availableMoves = nextBoard
      .map((cell, index) => (cell === null ? index : null))
      .filter((index): index is number => index !== null)

    if (availableMoves.length === 0) return nextBoard

    const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)]
    const optimizedMove = bestMove([...nextBoard], 'O', 'X')

    let aiMove = optimizedMove
    if (level === 'random') {
      aiMove = randomMove
    } else if (level === 'normal') {
      aiMove = Math.random() < 0.25 ? randomMove : optimizedMove
    }

    const updatedBoard = [...nextBoard]
    updatedBoard[aiMove] = 'O'
    return updatedBoard
  }

  function handleCellClick(index: number) {
    if (selectedGame !== 'tictactoe' || gamePhase !== 'play' || winner || board[index] || currentPlayer !== 'X' || isAiThinking) return

    const nextBoard = [...board]
    nextBoard[index] = 'X'
    const afterPlayerMove = getWinner(nextBoard)
    setBoard(nextBoard)

    if (afterPlayerMove) {
      setWinner(afterPlayerMove)
      return
    }

    setCurrentPlayer('O')
    setIsAiThinking(true)

    const aiBoard = playAiTurn(nextBoard, ticTacToeLevel)
    aiTimeoutRef.current = window.setTimeout(() => {
      const afterAiMove = getWinner(aiBoard)
      setBoard(aiBoard)
      setWinner(afterAiMove)
      setCurrentPlayer('X')
      setIsAiThinking(false)
      aiTimeoutRef.current = null
    }, 1000)
  }

  function startTicTacToe(level: TicTacToeLevel) {
    setTicTacToeLevel(level)
    setGamePhase('play')
    resetTicTacToe()
  }

  function getRewardForOutcome(result: Cell | 'draw', level: TicTacToeLevel) {
    if (result === 'X' && level === 'random') return 1
    if (result === 'X' && level === 'normal') return 2
    if (result === 'draw' && level === 'optimized') return 1
    return 0
  }

  function getTreasureAiReward(level: TreasureAiLevel) {
    if (level === 1) return 1
    if (level === 2) return 2
    if (level === 3) return 4
    return 8
  }

  function updateProfileCoinsInDb(profileId: string, currentCoins: number, coinsToAdd: number) {
    if (coinsToAdd <= 0) return

    void supabase
      .from('profiles')
      .update({ coins: currentCoins + coinsToAdd })
      .eq('id', profileId)
      .then(({ error }) => {
        if (error) {
          console.error('Erreur update coins profile:', error)
        }
      })
  }

  const overlayBackgroundStyle = useMemo(() => ({
    background: 'rgba(255, 255, 255, 0.05)',
  }), [])

  const currentLevelAvatar =
    ticTacToeLevel === 'random'
      ? betachouImg
      : ticTacToeLevel === 'normal'
        ? mollassonImg
        : bobbyImg

  const characterNameById = useMemo(
    () => Object.fromEntries(accountCharacters.map((character) => [character.id, character.name_fr])),
    [accountCharacters]
  )

  const suggestedPvpOpponents = useMemo(
    () => accountProfiles.filter((profile) => profile.id !== activeProfile?.id),
    [accountProfiles, activeProfile]
  )

  const selectedPvpOpponent = useMemo(
    () => suggestedPvpOpponents.find((profile) => profile.id === treasurePvpOpponentProfileId) ?? null,
    [suggestedPvpOpponents, treasurePvpOpponentProfileId]
  )

  const activeProfileAvatar = useMemo(() => {
    const characterName = characterNameById[activeProfile?.character_id ?? ''] ?? ''
    return PROFILE_CHARACTER_IMAGES[characterName] ?? miniPatapamImg
  }, [activeProfile, characterNameById])

  const opponentProfileAvatar = useMemo(() => {
    if (treasureMode === 'ai') {
      return TREASURE_AI_LEVELS.find((level) => level.level === treasureAiLevel)?.image ?? bobbyImg
    }

    if (!selectedPvpOpponent) {
      return patapamExplorateurImg
    }

    const characterName = characterNameById[selectedPvpOpponent.character_id ?? ''] ?? ''
    return PROFILE_CHARACTER_IMAGES[characterName] ?? patapamExplorateurImg
  }, [treasureMode, treasureAiLevel, selectedPvpOpponent, characterNameById])

  const treasureCollectableIndices = useMemo(
    () => getTreasureCollectableIndices(treasureTiles),
    [treasureTiles]
  )

  const treasureCollectedCounts = useMemo(() => {
    const p1 = treasureTiles.filter((tile) => tile.collectedBy === 0).length
    const p2 = treasureTiles.filter((tile) => tile.collectedBy === 1).length
    return [p1, p2] as const
  }, [treasureTiles])

  const treasureBetachouCounts = useMemo(() => {
    const p1 = treasureTiles.filter((tile) => tile.collectedBy === 0 && tile.type === 'betachou').length
    const p2 = treasureTiles.filter((tile) => tile.collectedBy === 1 && tile.type === 'betachou').length
    return [p1, p2] as const
  }, [treasureTiles])

  const treasureRows = useMemo(() => {
    const rows: Array<Array<{ tile: TreasureTile; index: number }>> = []
    let start = 0

    for (const size of TREASURE_ROW_SIZES) {
      const rowTiles = treasureTiles.slice(start, start + size).map((tile, idx) => ({
        tile,
        index: start + idx,
      }))
      rows.push(rowTiles)
      start += size
    }
    return rows
  }, [treasureTiles])

  useEffect(() => {
    if (selectedGame !== 'treasure' || gamePhase !== 'select') return

    Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('characters').select('id, name_fr'),
    ]).then(([{ data: profileData }, { data: characterData }]) => {
      setAccountProfiles((profileData as ChildProfile[]) ?? [])
      setAccountCharacters((characterData as CharacterSummary[]) ?? [])
    })
  }, [selectedGame, gamePhase])

  useEffect(() => {
    if (suggestedPvpOpponents.length === 0) {
      setTreasurePvpOpponentProfileId(null)
      return
    }

    const stillValid = suggestedPvpOpponents.some((profile) => profile.id === treasurePvpOpponentProfileId)
    if (!stillValid) {
      setTreasurePvpOpponentProfileId(suggestedPvpOpponents[0].id)
    }
  }, [suggestedPvpOpponents, treasurePvpOpponentProfileId])

  useEffect(() => {
    return () => {
      if (aiTimeoutRef.current !== null) {
        window.clearTimeout(aiTimeoutRef.current)
      }
      if (memoryTimeoutRef.current !== null) {
        window.clearTimeout(memoryTimeoutRef.current)
      }
      if (treasureTimeoutRef.current !== null) {
        window.clearTimeout(treasureTimeoutRef.current)
      }
      if (treasureAiTimeoutRef.current !== null) {
        window.clearTimeout(treasureAiTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (selectedGame !== 'treasure' || gamePhase !== 'play') return
    if (treasureMode !== 'ai' || currentTreasurePlayer !== 1) return
    if (treasureGameOver || isTreasureLocked) return

    setIsTreasureAiThinking(true)

    if (treasureAiTimeoutRef.current !== null) {
      window.clearTimeout(treasureAiTimeoutRef.current)
      treasureAiTimeoutRef.current = null
    }

    treasureAiTimeoutRef.current = window.setTimeout(() => {
      if (shouldTreasureAiCollect(treasureTiles)) {
        handleTreasureCollect()
        treasureAiTimeoutRef.current = null
        return
      }

      const index = chooseTreasureAiFlipIndex(treasureTiles)
      if (index === null) {
        endTreasureTurn(0)
        treasureAiTimeoutRef.current = null
        return
      }

      revealTreasureCardForAi(index)
      treasureAiTimeoutRef.current = null
    }, 700)

    return () => {
      if (treasureAiTimeoutRef.current !== null) {
        window.clearTimeout(treasureAiTimeoutRef.current)
        treasureAiTimeoutRef.current = null
      }
    }
  }, [
    selectedGame,
    gamePhase,
    treasureMode,
    currentTreasurePlayer,
    treasureGameOver,
    isTreasureLocked,
    treasureTiles,
    treasureAiLevel,
  ])

  useEffect(() => {
    if (selectedGame !== 'tictactoe' || gamePhase !== 'play' || !winner || rewardApplied) return

    const coinsToAdd = getRewardForOutcome(winner, ticTacToeLevel)
    if (coinsToAdd > 0) {
      awardCoins(coinsToAdd)
    } else {
      setRewardCoins(0)
    }
    setRewardApplied(true)
  }, [winner, ticTacToeLevel, rewardApplied, selectedGame, gamePhase])

  useEffect(() => {
    if (selectedGame !== 'memory' || gamePhase !== 'play' || !memoryWon || rewardApplied || !memoryLevel) return

    awardCoins(memoryLevel)
    setRewardApplied(true)
  }, [selectedGame, gamePhase, memoryWon, rewardApplied, memoryLevel])

  useEffect(() => {
    if (selectedGame !== 'treasure' || gamePhase !== 'play' || !treasureGameOver || rewardApplied) return

    if (treasureMode === 'pvp') {
      if (treasureWinner === null) {
        setRewardCoins(0)
        setRewardApplied(true)
        return
      }

      const playerOneReward = treasureWinner === 0 ? 5 : 1
      const playerTwoReward = treasureWinner === 1 ? 5 : 1

      if (activeProfile?.id) {
        addCoins(playerOneReward)
        setRewardCoins(playerOneReward)
        updateProfileCoinsInDb(activeProfile.id, activeProfile.coins ?? 0, playerOneReward)
      }

      if (selectedPvpOpponent?.id) {
        updateProfileCoinsInDb(selectedPvpOpponent.id, selectedPvpOpponent.coins ?? 0, playerTwoReward)
      }

      setAccountProfiles((prev) => prev.map((profile) => {
        if (activeProfile?.id && profile.id === activeProfile.id) {
          return { ...profile, coins: (profile.coins ?? 0) + playerOneReward }
        }
        if (selectedPvpOpponent?.id && profile.id === selectedPvpOpponent.id) {
          return { ...profile, coins: (profile.coins ?? 0) + playerTwoReward }
        }
        return profile
      }))

      setRewardApplied(true)
      return
    }

    if (treasureWinner !== 0) {
      setRewardCoins(0)
      setRewardApplied(true)
      return
    }

    const coinsToAdd = getTreasureAiReward(treasureAiLevel)
    awardCoins(coinsToAdd)
    setRewardApplied(true)
  }, [
    selectedGame,
    gamePhase,
    treasureGameOver,
    rewardApplied,
    treasureMode,
    treasureWinner,
    treasureAiLevel,
    activeProfile,
    selectedPvpOpponent,
    addCoins,
  ])

  useEffect(() => {
    if (selectedGame !== 'treasure' || gamePhase !== 'play' || treasureGameOver || treasureTiles.length === 0) return

    const nonReneLeft = treasureTiles.some((tile) => tile.collectedBy === null && tile.type !== 'rene')
    if (nonReneLeft) return

    const uncollectedRene = treasureTiles.filter((tile) => tile.collectedBy === null && tile.type === 'rene').length
    const [p1B, p2B] = treasureBetachouCounts
    let reneAwardTo: 0 | 1 | null = null
    if (p1B > p2B) reneAwardTo = 0
    if (p2B > p1B) reneAwardTo = 1

    if (reneAwardTo !== null && uncollectedRene > 0) {
      setTreasureTiles((prev) => prev.map((tile) => (
        tile.collectedBy === null && tile.type === 'rene' ? { ...tile, collectedBy: reneAwardTo } : tile
      )))
    }

    const p1Total = treasureCollectedCounts[0] + (reneAwardTo === 0 ? uncollectedRene : 0)
    const p2Total = treasureCollectedCounts[1] + (reneAwardTo === 1 ? uncollectedRene : 0)
    const winner: 0 | 1 | null = p1Total === p2Total ? null : p1Total > p2Total ? 0 : 1

    setTreasureWinner(winner)
    setTreasureGameOver(true)
    if (reneAwardTo === null) {
      setTreasureMessage('Fin de partie: egalite de Betachou, Rene non attribues.')
    } else {
      setTreasureMessage(`Fin de partie: Rene attribues au Joueur ${reneAwardTo + 1}.`)
    }
  }, [selectedGame, gamePhase, treasureTiles, treasureGameOver, treasureCollectedCounts, treasureBetachouCounts])

  const memoryGridColumns =
    memoryCards.length <= 6
      ? 3
      : memoryCards.length <= 10
        ? 5
        : memoryCards.length <= 14
          ? 7
          : 6

  return (
    <div className="h-screen overflow-hidden bg-black relative">
      <img
        src={gamesAreaImg}
        alt="Zone des jeux"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-20 bg-black/45 text-white font-bold px-4 py-2 rounded-xl border border-white/30 hover:bg-black/60 transition-colors"
      >
        ← Clairiere
      </button>

      {/* Zones jeux en % pour ajustement manuel facile */}
      {GAME_ZONES.map((zone) => (
        <button
          key={zone.key}
          onClick={() => chooseGame(zone.key)}
          style={{ position: 'absolute', top: zone.top, left: '11%', width: '33.333%', height: '33.333%' }}
          className="z-10 group flex items-center gap-3 px-4 border-2 border-transparent rounded-3xl hover:border-white/70 transition-all duration-200"
        >
          <div className="w-60 h-60 shrink-0 rounded-xl overflow-hidden bg-white/15 border border-white/20 shadow-lg">
            <img src={zone.image} alt={zone.title} className="w-full h-full object-contain" />
          </div>
          <span className="text-white font-bold text-base drop-shadow-lg bg-black/45 px-3 py-1.5 rounded-lg">
            {zone.title}
          </span>
        </button>
      ))}

      {selectedGame && (
        <div className="absolute inset-0 z-30 flex items-center justify-center">
          <img
            src={gamesAreaImg}
            alt="Fond de la zone des jeux"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-90"
          />
          <div className="absolute inset-0" style={overlayBackgroundStyle} />
          <div className="w-[96vw] h-[98vh] rounded-2xl border border-white/25 bg-white/10 backdrop-blur-md text-white p-4 relative overflow-hidden shadow-2xl">
            <button
              onClick={() => {
                resetTicTacToe()
                resetMemory()
                resetTreasureHunt()
                setTreasureSelectStep('mode')
                setSelectedGame(null)
              }}
              aria-label="Fermer"
              className="absolute top-4 right-4 w-10 h-10 p-0 flex items-center justify-center bg-black/25 hover:bg-black/40 rounded-lg transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <h1 className="text-3xl font-bold mb-4">{selectedTitle}</h1>

            {selectedGame === 'tictactoe' && gamePhase === 'select' && (
              <div className="h-[calc(100%-4rem)] flex flex-col justify-center gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => startTicTacToe('random')}
                    className="rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 p-5 text-left transition-colors flex items-center gap-4"
                  >
                    <div className="w-40 h-40 shrink-0 rounded-xl overflow-hidden bg-white/15 border border-white/20 shadow-lg">
                      <img src={betachouImg} alt="Niveau 1" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-5xl font-black text-white">1 :  Facile</div>
                  </button>
                  <button
                    onClick={() => startTicTacToe('normal')}
                    className="rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 p-5 text-left transition-colors flex items-center gap-4"
                  >
                    <div className="w-40 h-40 shrink-0 rounded-xl overflow-hidden bg-white/15 border border-white/20 shadow-lg">
                      <img src={mollassonImg} alt="Niveau 2" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-5xl font-black text-white">2 :  Normal</div>
                  </button>
                  <button
                    onClick={() => startTicTacToe('optimized')}
                    className="rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 p-5 text-left transition-colors flex items-center gap-4"
                  >
                    <div className="w-40 h-40 shrink-0 rounded-xl overflow-hidden bg-white/15 border border-white/20 shadow-lg">
                      <img src={bobbyImg} alt="Niveau 3" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-5xl font-black text-white">3 :  Difficile</div>
                  </button>
                </div>
              </div>
            )}

            {selectedGame === 'tictactoe' && gamePhase === 'play' && (
              <div className="h-[calc(100%-4rem)] grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)_260px] items-center gap-6">
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4 flex flex-col items-center gap-3">
                  <div className="w-40 h-40 rounded-xl overflow-hidden bg-white/15 border border-white/20 shadow-lg">
                    <img src={currentLevelAvatar} alt="Avatar du niveau" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-white font-bold text-lg">Niveau {ticTacToeLevel === 'random' ? '1' : ticTacToeLevel === 'normal' ? '2' : '3'}</span>
                </div>

                <div className="flex flex-col items-center justify-center gap-6">
                  <div className="flex items-center gap-4 text-white/80">
                    <span>Tour: <strong className="text-white">{currentPlayer === 'X' ? 'Joueur' : 'Ordi'}</strong></span>
                    {isAiThinking && <span className="text-white/90 animate-pulse">L’IA réfléchit...</span>}
                  </div>

                  <div className="grid grid-cols-3 gap-3 w-full max-w-md">
                    {board.map((cell, index) => (
                      <button
                        key={index}
                        onClick={() => handleCellClick(index)}
                        disabled={!!winner || isAiThinking || cell !== null || currentPlayer !== 'X'}
                        className="aspect-square rounded-2xl border-2 border-white/25 bg-white/10 hover:bg-white/20 disabled:opacity-70 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-5xl font-black text-white shadow-lg"
                      >
                        <span
                          className={
                            cell === 'X'
                              ? 'text-8xl leading-none text-blue-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]'
                              : cell === 'O'
                                ? 'text-8xl leading-none text-red-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]'
                                : 'text-8xl leading-none'
                          }
                        >
                          {cell}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="min-h-10 text-center text-lg font-semibold">
                    {winner === 'draw' && 'Match nul.'}
                    {winner === 'X' && 'Tu as gagné.'}
                    {winner === 'O' && 'L’ordinateur a gagné.'}
                    {!winner && !isAiThinking && 'A toi de jouer.'}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => startTicTacToe(ticTacToeLevel)}
                      className="bg-white text-slate-900 font-bold px-4 py-2 rounded-xl hover:scale-105 transition-transform flex items-center gap-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 12a9 9 0 1 1-3.2-6.9" />
                        <polyline points="21 3 21 9 15 9" />
                      </svg>
                      Rejouer
                    </button>
                    <button
                      onClick={() => {
                        resetTicTacToe()
                        setGamePhase('select')
                      }}
                      className="bg-black/25 border border-white/20 text-white font-semibold px-4 py-2 rounded-xl hover:bg-black/40 transition-colors flex items-center gap-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="17 3 21 7 17 11" />
                        <line x1="21" y1="7" x2="3" y2="7" />
                        <polyline points="7 13 3 17 7 21" />
                        <line x1="3" y1="17" x2="21" y2="17" />
                      </svg>
                      Changer de niveau
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="relative flex flex-col items-center gap-3">
                    {winner === 'X' && (
                      <div className="relative w-44 h-44 animate-bounce">
                        <img src={patapamVictoryImg} alt="Victoire" className="w-full h-full object-contain" />
                        <span className="absolute -top-2 -right-2 text-4xl">🏆</span>
                      </div>
                    )}

                    {rewardCoins > 0 && (
                      <div className="bg-black/30 border border-white/20 rounded-xl px-4 py-2 text-white font-bold text-lg flex items-center gap-2">
                        <span>+{rewardCoins}</span>
                        <span className="text-yellow-300 text-xl">🪙</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedGame === 'memory' && gamePhase === 'select' && (
              <div className="h-[calc(100%-4rem)] flex items-center justify-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
                  {MEMORY_LEVELS.map((cfg) => (
                    <button
                      key={cfg.level}
                      onClick={() => startMemory(cfg.level)}
                      className="rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 p-5 transition-colors flex flex-col items-center gap-3"
                    >
                      <div className="text-5xl font-black text-white">{cfg.level}</div>
                      <div className="text-white/85 font-semibold">{cfg.cards} cartes</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedGame === 'memory' && gamePhase === 'play' && (
              <div className="h-[calc(100%-4rem)] grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)_260px] items-center gap-6">
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4 flex flex-col items-center gap-3">
                  <div className="w-40 h-40 rounded-xl overflow-hidden bg-white/15 border border-white/20 shadow-lg">
                    <img src={memoryImg} alt="Memory" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-white font-bold text-lg">Niveau {memoryLevel ?? '-'}</span>
                  <span className="text-white/80 text-sm">Paires: {matchedMemoryCards.length / 2}/{memoryCards.length / 2}</span>
                </div>

                <div className="flex flex-col items-center justify-center gap-5">
                  <div className="text-white/90 font-semibold min-h-7">
                    {memoryWon ? 'Bravo, toutes les paires sont trouvées.' : isMemoryLocked ? 'Observe bien les cartes...' : 'Trouve toutes les paires.'}
                  </div>

                  <div
                    className="grid gap-2 w-full max-w-4xl"
                    style={{ gridTemplateColumns: `repeat(${memoryGridColumns}, minmax(0, 1fr))` }}
                  >
                    {memoryCards.map((card, index) => {
                      const isMatched = matchedMemoryCards.includes(index)
                      const isOpen = flippedMemoryCards.includes(index) || isMatched
                      return (
                        <button
                          key={card.id}
                          onClick={() => handleMemoryCardClick(index)}
                          disabled={memoryWon || isMemoryLocked || isOpen}
                          className={`aspect-square rounded-xl border-2 transition-colors p-1 disabled:cursor-not-allowed ${
                            isMatched
                              ? 'border-transparent bg-transparent hover:bg-transparent'
                              : 'border-white/20 bg-white/10 hover:bg-white/20'
                          }`}
                        >
                          {isMatched ? (
                            <div className="w-full h-full" />
                          ) : isOpen ? (
                            <img src={card.image} alt="Carte memory" className="w-full h-full object-contain rounded-lg" />
                          ) : (
                            <div className="w-full h-full rounded-lg bg-black/35 border border-white/10 flex items-center justify-center text-2xl font-black text-white/80">?</div>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => memoryLevel && startMemory(memoryLevel)}
                      className="bg-white text-slate-900 font-bold px-4 py-2 rounded-xl hover:scale-105 transition-transform flex items-center gap-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 12a9 9 0 1 1-3.2-6.9" />
                        <polyline points="21 3 21 9 15 9" />
                      </svg>
                      Rejouer
                    </button>
                    <button
                      onClick={() => {
                        resetMemory()
                        setGamePhase('select')
                      }}
                      className="bg-black/25 border border-white/20 text-white font-semibold px-4 py-2 rounded-xl hover:bg-black/40 transition-colors flex items-center gap-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="17 3 21 7 17 11" />
                        <line x1="21" y1="7" x2="3" y2="7" />
                        <polyline points="7 13 3 17 7 21" />
                        <line x1="3" y1="17" x2="21" y2="17" />
                      </svg>
                      Changer de niveau
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="relative flex flex-col items-center gap-3">
                    {memoryWon && (
                      <div className="relative w-44 h-44 animate-bounce">
                        <img src={patapamVictoryImg} alt="Victoire" className="w-full h-full object-contain" />
                        <span className="absolute -top-2 -right-2 text-4xl">🏆</span>
                      </div>
                    )}

                    {rewardCoins > 0 && (
                      <div className="bg-black/30 border border-white/20 rounded-xl px-4 py-2 text-white font-bold text-lg flex items-center gap-2">
                        <span>+{rewardCoins}</span>
                        <span className="text-yellow-300 text-xl">🪙</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedGame === 'treasure' && gamePhase === 'select' && (
              <div className="h-[calc(100%-4rem)] flex items-center justify-center">
                <div className="bg-white/15 border border-white/20 rounded-2xl p-8 flex flex-col items-center gap-5 max-w-6xl w-full">
                  <img src={treasureHuntImg} alt="Chasse au Tresor" className="w-36 h-36 object-contain" />
                  {treasureSelectStep === 'mode' && (
                    <>
                      <h2 className="text-3xl font-black text-white">Choisir un type de partie</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                        <button
                          onClick={() => selectTreasureMode('pvp')}
                          className="rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 p-5 transition-colors flex items-center gap-4"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/15 border border-white/20">
                              <img src={miniPatapamImg} alt="Patapam" className="w-full h-full object-contain" />
                            </div>
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/15 border border-white/20">
                              <img src={bobbyImg} alt="Bobby" className="w-full h-full object-contain" />
                            </div>
                          </div>
                          <div className="text-3xl font-black text-white">Joueur vs Joueur</div>
                        </button>

                        <button
                          onClick={() => selectTreasureMode('ai')}
                          className="rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 p-5 transition-colors flex items-center gap-4"
                        >
                          <div className="w-16 h-16 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white" aria-hidden="true">
                              <rect x="3" y="11" width="18" height="10" rx="2" />
                              <circle cx="12" cy="5" r="2" />
                              <path d="M12 7v4" />
                              <circle cx="8" cy="16" r="1" />
                              <circle cx="16" cy="16" r="1" />
                            </svg>
                          </div>
                          <div className="text-3xl font-black text-white">Joueur vs IA</div>
                        </button>
                      </div>
                    </>
                  )}

                  {treasureSelectStep === 'pvp-opponent' && (
                    <>
                      <h2 className="text-3xl font-black text-white">Choisir l'adversaire</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-5xl">
                        {suggestedPvpOpponents.map((profile) => {
                          const characterName = characterNameById[profile.character_id ?? ''] ?? ''
                          const avatar = PROFILE_CHARACTER_IMAGES[characterName] ?? miniPatapamImg
                          const isSelected = treasurePvpOpponentProfileId === profile.id

                          return (
                            <button
                              key={profile.id}
                              onClick={() => setTreasurePvpOpponentProfileId(profile.id)}
                              className={`rounded-2xl border p-3 transition-colors flex flex-col items-center gap-2 ${
                                isSelected
                                  ? 'bg-white/30 border-white/60'
                                  : 'bg-white/15 hover:bg-white/25 border-white/20'
                              }`}
                            >
                              <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/15 border border-white/20">
                                <img src={avatar} alt={profile.name} className="w-full h-full object-contain" />
                              </div>
                              <div className="text-white font-bold text-base">{profile.name}</div>
                            </button>
                          )
                        })}

                        <button
                          onClick={() => setTreasurePvpOpponentProfileId(null)}
                          className={`rounded-2xl border p-3 transition-colors flex flex-col items-center gap-2 ${
                            treasurePvpOpponentProfileId === null
                              ? 'bg-white/30 border-white/60'
                              : 'bg-white/15 hover:bg-white/25 border-white/20'
                          }`}
                        >
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/15 border border-white/20">
                            <img src={patapamExplorateurImg} alt="Invite" className="w-full h-full object-contain" />
                          </div>
                          <div className="text-white font-bold text-base">Invite</div>
                        </button>
                      </div>
                      {suggestedPvpOpponents.length === 0 && (
                        <div className="text-white/85 text-sm">Aucun autre profil trouve. Choisis Invite pour jouer en duel.</div>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => setTreasureSelectStep('mode')}
                          className="bg-black/25 border border-white/20 text-white font-semibold px-4 py-2 rounded-xl hover:bg-black/40 transition-colors"
                        >
                          Retour
                        </button>
                        <button
                          onClick={() => startTreasureHunt('pvp', treasureAiLevel)}
                          className="bg-white text-slate-900 font-bold px-6 py-2 rounded-xl hover:scale-105 transition-transform"
                        >
                          Lancer la partie
                        </button>
                      </div>
                    </>
                  )}

                  {treasureSelectStep === 'ai-level' && (
                    <>
                      <h2 className="text-3xl font-black text-white">Choisir le niveau IA</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-4xl">
                        {TREASURE_AI_LEVELS.map((lvl) => (
                          <button
                            key={lvl.level}
                            onClick={() => startTreasureHunt('ai', lvl.level)}
                            className="rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 p-4 text-left transition-colors flex items-center gap-3"
                          >
                            <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-white/15 border border-white/20 shadow-lg">
                              <img src={lvl.image} alt={`Niveau ${lvl.level}`} className="w-full h-full object-contain" />
                            </div>
                            <div className="text-2xl font-black text-white">Niveau {lvl.level}: {lvl.label}</div>
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setTreasureSelectStep('mode')}
                        className="bg-black/25 border border-white/20 text-white font-semibold px-4 py-2 rounded-xl hover:bg-black/40 transition-colors mt-2"
                      >
                        Retour
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {selectedGame === 'treasure' && gamePhase === 'play' && (
              <div className="h-[calc(100%-3.2rem)] -mt-2 flex flex-col gap-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 items-stretch">
                  <div className="bg-white/12 border border-white/20 rounded-xl p-1.5 flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      <div className="text-lg font-black text-white leading-none">{treasureCollectedCounts[0]} cartes</div>
                      <div className="text-[11px] text-white/70">Betachou: {treasureBetachouCounts[0]}</div>
                    </div>

                    <div className="flex flex-col items-center gap-1 min-w-0 px-1">
                      <div className="text-base md:text-lg font-black text-white text-center leading-none truncate max-w-[130px]">
                        {getTreasurePlayerLabel(0)}
                      </div>
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-white/15 border border-white/20 shrink-0">
                        <img src={activeProfileAvatar} alt={getTreasurePlayerLabel(0)} className="w-full h-full object-contain" />
                      </div>
                    </div>

                    <div className="relative w-11 h-14 shrink-0">
                      <div className="absolute inset-0 rounded-md border border-white/20 bg-black/25 overflow-hidden">
                        <img src={treasureCardBackImg} alt="Dos de carte" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute top-0.5 left-0.5 right-0.5 bottom-0.5 rounded-md border border-white/20 bg-black/25 overflow-hidden">
                        <img src={treasureCardBackImg} alt="Dos de carte" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute top-1 left-1 right-1 bottom-1 rounded-md border border-white/20 bg-black/25 overflow-hidden animate-pulse">
                        <img src={treasureCardBackImg} alt="Dos de carte" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/12 border border-white/20 rounded-xl p-1.5 flex flex-col items-center justify-center gap-0.5">
                    <button
                      onClick={handleTreasureCollect}
                      disabled={
                        treasureCollectableIndices.length === 0
                        || isTreasureLocked
                        || treasureGameOver
                        || (treasureMode === 'ai' && currentTreasurePlayer === 1)
                      }
                      className="bg-white text-slate-900 text-[11px] font-bold px-3.5 py-1 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Ramasser
                    </button>
                    <div className="text-xs text-white/85 text-center min-h-4">{treasureMessage}</div>
                    {!treasureGameOver && (
                      <div className="text-[11px] text-white/75">
                        Tour actif: {getTreasurePlayerLabel(currentTreasurePlayer)}
                        {treasureMode === 'ai' && currentTreasurePlayer === 1 && isTreasureAiThinking && ' (reflexion...)'}
                      </div>
                    )}
                    {treasureGameOver && (
                      <div className="text-xs font-bold text-white">
                        {treasureWinner === null ? 'Egalite' : `Victoire ${getTreasurePlayerLabel(treasureWinner)}`}
                      </div>
                    )}
                  </div>

                  <div className="bg-white/12 border border-white/20 rounded-xl p-1.5 flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-0.5 text-right">
                      <div className="text-lg font-black text-white leading-none">{treasureCollectedCounts[1]} cartes</div>
                      <div className="text-[11px] text-white/70">Betachou: {treasureBetachouCounts[1]}</div>
                    </div>

                    <div className="flex flex-col items-center gap-1 min-w-0 px-1">
                      <div className="text-base md:text-lg font-black text-white text-center leading-none truncate max-w-[130px]">
                        {getTreasurePlayerLabel(1)}
                      </div>
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-white/15 border border-white/20 shrink-0">
                        <img src={opponentProfileAvatar} alt={getTreasurePlayerLabel(1)} className="w-full h-full object-contain" />
                      </div>
                    </div>

                    <div className="relative w-11 h-14 shrink-0">
                      <div className="absolute inset-0 rounded-md border border-white/20 bg-black/25 overflow-hidden">
                        <img src={treasureCardBackImg} alt="Dos de carte" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute top-0.5 left-0.5 right-0.5 bottom-0.5 rounded-md border border-white/20 bg-black/25 overflow-hidden">
                        <img src={treasureCardBackImg} alt="Dos de carte" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute top-1 left-1 right-1 bottom-1 rounded-md border border-white/20 bg-black/25 overflow-hidden animate-pulse">
                        <img src={treasureCardBackImg} alt="Dos de carte" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-h-0 w-full max-w-[min(96vw,1400px)] mx-auto mt-3 p-0.5 flex flex-col gap-1 justify-center">
                  {treasureRows.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      className={`grid gap-1 ${rowIndex < 4 ? 'grid-cols-10' : 'grid-cols-9 w-[90%] mx-auto'}`}
                    >
                      {row.map(({ tile, index }) => {
                        const isHidden = !tile.revealed && tile.collectedBy === null
                        const isCollected = tile.collectedBy !== null
                        const isAiTurn = treasureMode === 'ai' && currentTreasurePlayer === 1
                        return (
                          <button
                            key={tile.id}
                            onClick={() => {
                              if (isAiTurn) return
                              handleTreasureCardClick(index)
                            }}
                            disabled={isTreasureLocked || treasureGameOver || tile.revealed || isCollected || isAiTurn}
                            className={`aspect-square rounded-lg border transition-colors p-0.5 ${
                              isCollected
                                ? 'border-transparent bg-transparent hover:bg-transparent'
                                : 'border-white/20 bg-white/10 hover:bg-white/20'
                            }`}
                          >
                            {isCollected && <div className="w-full h-full" />}
                            {isHidden && !isCollected && (
                              <div className="w-full h-full rounded-md border border-white/10 overflow-hidden">
                                <img src={treasureCardBackImg} alt="Dos de carte" className="w-full h-full object-cover" />
                              </div>
                            )}
                            {!isHidden && !isCollected && (
                              <div className="relative w-full h-full rounded-lg overflow-hidden">
                                <img src={tile.image} alt={tile.type} className="w-full h-full object-contain" />
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedGame !== 'tictactoe' && selectedGame !== 'memory' && selectedGame !== 'treasure' && (
              <p className="text-white/75">Espace pret: ici on branchera le jeu du hackathon.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
