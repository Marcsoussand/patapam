import type { Direction, HeroId } from '../types/game'
import mollassonFront from '../../img/coding/mollasson_front.png'
import mollassonBack from '../../img/coding/mollasson_back.png'
import mollassonLeft from '../../img/coding/mollasson_left.png'
import mollassonRight from '../../img/coding/mollasson_right.png'
import dauphinouSwim from '../../img/coding/dauphinou_swim.png'
import dauphinouJump from '../../img/coding/dauphinou_jump.png'
import dauphinouDive from '../../img/coding/dauphinou_dive.png'

type SpriteMap = Record<Direction, string>

const MOLLASSON_SPRITES: SpriteMap = {
  up: mollassonBack,
  down: mollassonFront,
  left: mollassonLeft,
  right: mollassonRight,
}

const DAUPHINOU_SPRITES: SpriteMap = {
  up: dauphinouJump,
  down: dauphinouDive,
  left: dauphinouSwim,
  right: dauphinouSwim,
}

const HERO_SPRITES: Record<HeroId, SpriteMap> = {
  mollasson: MOLLASSON_SPRITES,
  dauphinou: DAUPHINOU_SPRITES,
}

interface HeroProps {
  hero: HeroId
  direction: Direction
  isSuccess: boolean
  isFailure: boolean
}

export default function Hero({ hero, direction, isSuccess, isFailure }: HeroProps) {
  const className = [
    'coding-hero-sprite',
    isSuccess ? 'coding-hero-success' : '',
    isFailure ? 'coding-hero-failure' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const sprites = HERO_SPRITES[hero]
  return <img src={sprites[direction]} alt="" className={className} draggable={false} />
}
