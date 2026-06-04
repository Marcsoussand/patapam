import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useProfileStore } from '../store/profileStore'
import LanguageSelector from './LanguageSelector'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { activeProfile, setActiveProfile } = useProfileStore()
  const [open, setOpen] = useState(false)
  const hideTopOverlay = location.pathname === '/games'

  function switchUser() {
    setOpen(false)
    setActiveProfile(null)
    navigate('/profiles')
  }

  return (
    <>
      {children}
      {!hideTopOverlay && (
      <div className="fixed top-3 right-3 z-50 flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-lg">
        <LanguageSelector />
        {activeProfile && (
          <>
            <div className="w-px h-5 bg-white/40" />
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
              <span className="text-yellow-300 text-base">🪙</span>
              <span className="text-white font-bold text-sm">{activeProfile.coins}</span>
            </div>
            <div className="w-px h-5 bg-white/40" />
            <div className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-base"
              >
                👤
              </button>
              {open && (
                <>
                  {/* Backdrop pour fermer au clic extérieur */}
                  <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                  <div className="absolute right-0 top-10 z-20 bg-white rounded-2xl shadow-xl overflow-hidden min-w-max">
                    <button
                      onClick={switchUser}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 w-full transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Changer de joueur
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
      )}
    </>
  )
}
