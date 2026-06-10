import './gameRulesPopup.css'

interface GameRulesInfoButtonProps {
  onClick: () => void
  legend?: string
  ariaLabel?: string
}

export default function GameRulesInfoButton({
  onClick,
  legend = 'Règles du jeu',
  ariaLabel = 'Règles du jeu',
}: GameRulesInfoButtonProps) {
  return (
    <div className="game-rules-info">
      <button
        type="button"
        className="game-rules-info__btn"
        onClick={onClick}
        aria-label={ariaLabel}
      >
        ℹ
      </button>
      {legend ? <span className="game-rules-info__legend">{legend}</span> : null}
    </div>
  )
}
