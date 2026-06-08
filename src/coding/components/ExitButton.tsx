interface ExitButtonProps {
  onClick: () => void
  label?: string
}

export default function ExitButton({ onClick, label = 'Fermer' }: ExitButtonProps) {
  return (
    <button
      type="button"
      className="coding-exit-btn"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      ✕
    </button>
  )
}
