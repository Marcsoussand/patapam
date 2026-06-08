import type { ActionId } from '../types/game'
import type { ReactElement } from 'react'

const BG = '#2979d4'
const FG = '#ffffff'
const S = 32
const SW = 3

function ArrowIcon({ points, head }: { points: string; head: string }) {
  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ display: 'block' }}>
      <rect width={S} height={S} rx="6" fill={BG} />
      <polyline
        points={points}
        fill="none"
        stroke={FG}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={head}
        fill="none"
        stroke={FG}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function UpIcon() {
  return <ArrowIcon points="16,26 16,10" head="10,16 16,10 22,16" />
}

function DownIcon() {
  return <ArrowIcon points="16,6 16,22" head="10,16 16,22 22,16" />
}

function LeftIcon() {
  return <ArrowIcon points="26,16 10,16" head="16,10 10,16 16,22" />
}

function RightIcon() {
  return <ArrowIcon points="6,16 22,16" head="16,10 22,16 16,22" />
}

function SwimIcon() {
  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ display: 'block' }}>
      <rect width={S} height={S} rx="6" fill={BG} />
      <line x1="5" y1="16" x2="22" y2="16" stroke={FG} strokeWidth={SW} strokeLinecap="round" />
      <polyline
        points="15,9 22,16 15,23"
        fill="none"
        stroke={FG}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function JumpIcon() {
  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ display: 'block' }}>
      <rect width={S} height={S} rx="6" fill={BG} />
      <polyline
        points="10,26 10,10 26,10"
        fill="none"
        stroke={FG}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="20,4 26,10 20,16"
        fill="none"
        stroke={FG}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DiveIcon() {
  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ display: 'block' }}>
      <rect width={S} height={S} rx="6" fill={BG} />
      <polyline
        points="10,6 10,22 26,22"
        fill="none"
        stroke={FG}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="20,16 26,22 20,28"
        fill="none"
        stroke={FG}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function WaitIcon() {
  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ display: 'block' }}>
      <rect width={S} height={S} rx="6" fill={BG} />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fill={FG}
        fontSize="11"
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
      >
        Zzz
      </text>
    </svg>
  )
}

const SVG_ICONS: Partial<Record<ActionId, () => ReactElement>> = {
  up: UpIcon,
  down: DownIcon,
  left: LeftIcon,
  right: RightIcon,
  wait: WaitIcon,
  swim: SwimIcon,
  jump: JumpIcon,
  dive: DiveIcon,
}

interface ActionIconProps {
  actionId: ActionId
}

export default function ActionIcon({ actionId }: ActionIconProps) {
  const SvgComp = SVG_ICONS[actionId]
  if (SvgComp) return <SvgComp />
  return <span>{actionId}</span>
}
