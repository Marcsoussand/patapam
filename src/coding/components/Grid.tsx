import { useMemo, type CSSProperties } from 'react'
import { useGame } from '../context/GameContext'
import Hero from './Hero'
import redFlower from '../../img/coding/obstacles/mollasson/red_flower.png'
import orangeFlower from '../../img/coding/obstacles/mollasson/orange_flower.png'
import node from '../../img/coding/obstacles/mollasson/node.png'
import betachouObstacle from '../../img/coding/obstacles/mollasson/betachou_obstacle.png'
import rockSurface from '../../img/coding/obstacles/dauphinou/rock_surface.png'
import palmTree from '../../img/coding/obstacles/dauphinou/palm_tree.png'
import dauphinouMer from '../../img/coding/dauphinou_mer.png'
import { executeStep, isBetachouHome } from '../engine/gameEngine'
import { borderObstacles } from '../utils/gridObstacles'
import type { ActionId, CellType, HeroPos, ObstacleId } from '../types/game'

const OBSTACLE_IMAGES: Record<ObstacleId, string> = {
  red_flower: redFlower,
  orange_flower: orangeFlower,
  node,
}

function simulateGhost(
  sequence: ActionId[],
  heroStart: HeroPos,
  grid: CellType[][],
  surfaceRow?: number,
): HeroPos {
  let pos = { ...heroStart }
  let collectedKeys: string[] = []
  for (const actionId of sequence) {
    const result = executeStep(pos, actionId, grid, collectedKeys, surfaceRow)
    if (!result.valid) break
    if (result.collectedKey) collectedKeys = [...collectedKeys, result.collectedKey]
    pos = result.heroPos
    if (grid[pos.row]?.[pos.col] === 'end') break
  }
  return pos
}

const CELL_SIZE = 104

export default function Grid() {
  const { state, currentLevel } = useGame()
  const { heroPos, status, collectedKeys, sequence, betachouBlocking } = state
  const { grid, hero, obstacles: levelObstacles = [], betachou } = currentLevel
  const isShaking = status === 'failure'

  const obstacleMap = useMemo(() => {
    const map = borderObstacles(grid, currentLevel.id)
    for (const { row, col, type } of levelObstacles) {
      map.set(`${row},${col}`, type)
    }
    return map
  }, [grid, levelObstacles, currentLevel.id])

  const ghostPos =
    status === 'idle' && sequence.length > 0
      ? simulateGhost(sequence, currentLevel.heroStart, grid, currentLevel.surfaceRow)
      : null
  const showGhost =
    ghostPos !== null &&
    (ghostPos.row !== currentLevel.heroStart.row || ghostPos.col !== currentLevel.heroStart.col)

  if (currentLevel.viewMode === 'sidescroll') {
    const SIDE_W = 64
    const SIDE_H = 64
    const cols = grid[0]?.length ?? 10
    const rows = grid.length
    return (
      <div
        className="coding-grid coding-grid--sidescroll"
        style={{
          width: cols * SIDE_W,
          height: rows * SIDE_H,
          backgroundImage: `url(${dauphinouMer})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {grid.flatMap((row, rowIdx) =>
          row.map((cell, colIdx) => {
            const isPalmAnchor =
              cell === 'palm_tree' &&
              grid[rowIdx - 1]?.[colIdx] !== 'palm_tree' &&
              grid[rowIdx][colIdx - 1] !== 'palm_tree'
            if (cell === 'palm_tree' && !isPalmAnchor) return null

            const isHero = heroPos.row === rowIdx && heroPos.col === colIdx
            const isEnd = cell === 'end'
            const isGhost =
              showGhost && ghostPos!.row === rowIdx && ghostPos!.col === colIdx && !isHero
            const obstacleImg = cell === 'wall' && rowIdx < rows - 1 ? rockSurface : null
            const rowClass =
              rowIdx <= 1
                ? 'coding-cell-side-sky'
                : rowIdx === rows - 1
                  ? 'coding-cell-side-floor'
                  : rowIdx === 2
                    ? 'coding-cell-side-surface'
                    : 'coding-cell-side-water'

            return (
              <div
                key={`${rowIdx}-${colIdx}`}
                className={`coding-cell-side ${rowClass}`}
                style={{
                  position: 'absolute',
                  left: colIdx * SIDE_W,
                  top: rowIdx * SIDE_H,
                  width: isPalmAnchor ? SIDE_W * 2 : SIDE_W,
                  height: isPalmAnchor ? SIDE_H * 2 : SIDE_H,
                }}
              >
                {isPalmAnchor && (
                  <img src={palmTree} alt="" className="coding-obstacle-img coding-palm-tree" />
                )}
                {obstacleImg && !isPalmAnchor && (
                  <img src={obstacleImg} alt="" className="coding-obstacle-img" />
                )}
                {isEnd && !isHero && <span className="coding-end-flag">🏆</span>}
                {isGhost && (
                  <div className="coding-hero-cell">
                    <Hero hero={hero} direction={ghostPos!.direction} isSuccess={false} isFailure={false} />
                  </div>
                )}
                {isHero && (
                  <div className={`coding-hero-cell ${isShaking ? 'coding-shake' : ''}`}>
                    <Hero
                      hero={hero}
                      direction={heroPos.direction}
                      isSuccess={status === 'success'}
                      isFailure={status === 'failure'}
                    />
                  </div>
                )}
              </div>
            )
          }),
        )}
      </div>
    )
  }

  const betachouCell =
    betachou &&
    (() => {
      const heroOnHome = isBetachouHome(heroPos.row, heroPos.col, betachou.home)
      if (betachouBlocking === false || heroOnHome) return betachou.side
      return betachou.home
    })()

  const gridStyle = {
    '--cell-size': `${CELL_SIZE}px`,
    gridTemplateColumns: `repeat(${grid[0].length}, ${CELL_SIZE}px)`,
    gridTemplateRows: `repeat(${grid.length}, ${CELL_SIZE}px)`,
  } as CSSProperties

  return (
    <div className="coding-grid coding-grid--topdown" style={gridStyle}>
      {grid.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          const isHero = heroPos.row === rowIdx && heroPos.col === colIdx
          const isEnd = cell === 'end'
          const isGhost =
            showGhost && ghostPos!.row === rowIdx && ghostPos!.col === colIdx && !isHero
          const obstacleType = obstacleMap.get(`${rowIdx},${colIdx}`)
          const obstacleImg = obstacleType ? OBSTACLE_IMAGES[obstacleType] : null

          const isBetachou =
            betachouCell &&
            betachouCell.row === rowIdx &&
            betachouCell.col === colIdx &&
            !isHero

          return (
            <div key={`${rowIdx}-${colIdx}`} className="coding-cell">
              {obstacleImg && <img src={obstacleImg} alt="" className="coding-obstacle-img" />}
              {isBetachou && (
                <img src={betachouObstacle} alt="" className="coding-obstacle-img coding-betachou" />
              )}
              {cell === 'key_red' && !collectedKeys.includes('red') && (
                <span className="coding-key">🗝️</span>
              )}
              {cell === 'key_yellow' && !collectedKeys.includes('yellow') && (
                <span className="coding-key">🗝️</span>
              )}
              {cell === 'door_red' && (
                <span className="coding-door">{collectedKeys.includes('red') ? '🔓' : '🔒'}</span>
              )}
              {cell === 'door_yellow' && (
                <span className="coding-door">{collectedKeys.includes('yellow') ? '🔓' : '🔒'}</span>
              )}
              {isEnd && !isHero && <span className="coding-end-flag">🏁</span>}
              {isGhost && (
                <div className="coding-hero-cell coding-hero-cell--ghost">
                  <Hero hero={hero} direction={ghostPos!.direction} isSuccess={false} isFailure={false} />
                </div>
              )}
              {isHero && (
                <div className={`coding-hero-cell ${isShaking ? 'coding-shake' : ''}`}>
                  <Hero
                    hero={hero}
                    direction={heroPos.direction}
                    isSuccess={status === 'success'}
                    isFailure={status === 'failure'}
                  />
                </div>
              )}
            </div>
          )
        }),
      )}
    </div>
  )
}
