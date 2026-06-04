import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../store/profileStore'
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
import betachouNightImg from '../img/patapam_collection/betachou_night.png'
import reneLePoneyImg from '../img/patapam_collection/rene_le_poney.png'

type GameKey = 'tictactoe' | 'memory' | 'treasure'
type TicTacToeLevel = 'random' | 'normal' | 'optimized'
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
  const [currentTreasurePlayer, setCurrentTreasurePlayer] = useState<0 | 1>(0)
  const [isTreasureLocked, setIsTreasureLocked] = useState(false)
  const [treasureGameOver, setTreasureGameOver] = useState(false)
  const [treasureWinner, setTreasureWinner] = useState<0 | 1 | null>(null)
  const [treasureMessage, setTreasureMessage] = useState('')
  const aiTimeoutRef = useRef<number | null>(null)
  const memoryTimeoutRef = useRef<number | null>(null)
  const treasureTimeoutRef = useRef<number | null>(null)

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
    setTreasureTiles([])
    setCurrentTreasurePlayer(0)
    setIsTreasureLocked(false)
    setTreasureGameOver(false)
    setTreasureWinner(null)
    setTreasureMessage('')
    setRewardCoins(0)
    setRewardApplied(false)
  }

  function startTreasureHunt() {
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
    setTreasureMessage('Tour du Joueur 1')
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
    setTreasureMessage(`Tour du Joueur ${nextPlayer + 1}`)
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

    const target = treasureTiles[index]
    if (!target || target.collectedBy !== null || target.revealed) return

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

  const overlayBackgroundStyle = useMemo(() => ({
    background: 'rgba(255, 255, 255, 0.05)',
  }), [])

  const currentLevelAvatar =
    ticTacToeLevel === 'random'
      ? betachouImg
      : ticTacToeLevel === 'normal'
        ? mollassonImg
        : bobbyImg

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
    const rowSizes = [10, 10, 10, 10, 9]
    const rows: Array<Array<{ tile: TreasureTile; index: number }>> = []
    let start = 0

    for (const size of rowSizes) {
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
    }
  }, [])

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
                      const isOpen = flippedMemoryCards.includes(index) || matchedMemoryCards.includes(index)
                      return (
                        <button
                          key={card.id}
                          onClick={() => handleMemoryCardClick(index)}
                          disabled={memoryWon || isMemoryLocked || isOpen}
                          className="aspect-square rounded-xl border-2 border-white/20 bg-white/10 hover:bg-white/20 disabled:cursor-not-allowed transition-colors p-1"
                        >
                          {isOpen ? (
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
                <div className="bg-white/15 border border-white/20 rounded-2xl p-8 flex flex-col items-center gap-5 max-w-xl w-full">
                  <img src={treasureHuntImg} alt="Chasse au Tresor" className="w-36 h-36 object-contain" />
                  <h2 className="text-3xl font-black text-white">Mode 2 Joueurs</h2>
                  <button
                    onClick={startTreasureHunt}
                    className="bg-white text-slate-900 font-bold px-6 py-3 rounded-xl hover:scale-105 transition-transform"
                  >
                    Lancer la partie
                  </button>
                </div>
              </div>
            )}

            {selectedGame === 'treasure' && gamePhase === 'play' && (
              <div className="h-[calc(100%-3.2rem)] -mt-2 flex flex-col gap-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 items-stretch">
                  <div className="bg-white/12 border border-white/20 rounded-xl p-1.5 flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      <div className="text-[11px] text-white/80">Joueur 1</div>
                      <div className="text-lg font-black text-white leading-none">{treasureCollectedCounts[0]} cartes</div>
                      <div className="text-[11px] text-white/70">Betachou: {treasureBetachouCounts[0]}</div>
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
                      disabled={treasureCollectableIndices.length === 0 || isTreasureLocked || treasureGameOver}
                      className="bg-white text-slate-900 text-[11px] font-bold px-3.5 py-1 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Ramasser
                    </button>
                    <div className="text-xs text-white/85 text-center min-h-4">{treasureMessage}</div>
                    {!treasureGameOver && (
                      <div className="text-[11px] text-white/75">Tour actif: Joueur {currentTreasurePlayer + 1}</div>
                    )}
                    {treasureGameOver && (
                      <div className="text-xs font-bold text-white">
                        {treasureWinner === null ? 'Egalite' : `Victoire Joueur ${treasureWinner + 1}`}
                      </div>
                    )}
                  </div>

                  <div className="bg-white/12 border border-white/20 rounded-xl p-1.5 flex items-center justify-between gap-2 md:flex-row-reverse">
                    <div className="flex flex-col gap-0.5 md:items-end">
                      <div className="text-[11px] text-white/80">Joueur 2</div>
                      <div className="text-lg font-black text-white leading-none">{treasureCollectedCounts[1]} cartes</div>
                      <div className="text-[11px] text-white/70">Betachou: {treasureBetachouCounts[1]}</div>
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
                        return (
                          <button
                            key={tile.id}
                            onClick={() => handleTreasureCardClick(index)}
                            disabled={isTreasureLocked || treasureGameOver || tile.revealed || isCollected}
                            className={`aspect-square rounded-lg border transition-colors p-0.5 ${
                              isCollected
                                ? tile.collectedBy === 0
                                  ? 'border-blue-300/70 bg-blue-500/20'
                                  : 'border-rose-300/70 bg-rose-500/20'
                                : 'border-white/20 bg-white/10 hover:bg-white/20'
                            }`}
                          >
                            {isHidden && (
                              <div className="w-full h-full rounded-md border border-white/10 overflow-hidden">
                                <img src={treasureCardBackImg} alt="Dos de carte" className="w-full h-full object-cover" />
                              </div>
                            )}
                            {!isHidden && (
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
