import type { ActionDef, ActionId } from '../types/game'

export const ACTIONS: Record<ActionId, ActionDef> = {
  up: { id: 'up', label: 'Haut', icon: '⬆️', iconBg: false },
  down: { id: 'down', label: 'Bas', icon: '⬇️', iconBg: false },
  left: { id: 'left', label: 'Gauche', icon: '⬅️', iconBg: false },
  right: { id: 'right', label: 'Droite', icon: '➡️', iconBg: false },
  wait: { id: 'wait', label: 'Zzzz', icon: '💤', iconBg: false },
  swim: { id: 'swim', label: 'Nager', icon: '➡️', iconBg: false },
  jump: { id: 'jump', label: 'Sauter', icon: '↱', iconBg: false },
  dive: { id: 'dive', label: 'Plonger', icon: '↴', iconBg: false },
  super_jump: { id: 'super_jump', label: 'Super saut', icon: '⤴️', iconBg: false },
}
