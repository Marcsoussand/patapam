/** 3 bonnes → 1★, 4 → 2★, 5/5 → 3★ */
export function starsFromCorrectCount(correct: number, total: number): 0 | 1 | 2 | 3 {
  if (correct >= total) return 3
  if (correct >= total - 1) return 2
  if (correct >= Math.ceil(total * 0.6)) return 1
  return 0
}

export function starLabel(count: 0 | 1 | 2 | 3): string {
  return '⭐'.repeat(count) || '—'
}
