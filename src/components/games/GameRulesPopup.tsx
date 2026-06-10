import './gameRulesPopup.css'

interface GameRulesPopupProps {
  title: string
  html: string
  onClose: () => void
}

export default function GameRulesPopup({ title, html, onClose }: GameRulesPopupProps) {
  return (
    <div className="game-rules-overlay" onClick={onClose}>
      <div className="game-rules-popup" onClick={(e) => e.stopPropagation()}>
        <div className="game-rules-popup__header">
          <h3>{title}</h3>
          <button type="button" className="game-rules-popup__close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>
        <div className="game-rules-popup__body" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  )
}
