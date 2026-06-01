import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import ProfileSelect from './pages/ProfileSelect'
import Clearing from './pages/Clearing'
import ZoneDauphinou from './pages/zones/ZoneDauphinou'
import ZoneTartuffe from './pages/zones/ZoneTartuffe'
import ZoneMollasson from './pages/zones/ZoneMollasson'
import ZoneBobby from './pages/zones/ZoneBobby'
import Cabin from './pages/Cabin'
import Collection from './pages/Collection'
import ParentDashboard from './pages/ParentDashboard'

// Placeholder guard — remplacé par vrai auth Supabase en Phase 0 auth
function RequireAuth({ children }: { children: React.ReactNode }) {
  // TODO: remplacer par supabase.auth.getSession()
  const isLoggedIn = false
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />
}

function RequireProfile({ children }: { children: React.ReactNode }) {
  // TODO: remplacer par profileStore.activeProfile
  const hasProfile = false
  return hasProfile ? <>{children}</> : <Navigate to="/profiles" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Sélection profil (authentifié mais pas encore de profil choisi) */}
        <Route path="/profiles" element={
          <RequireAuth><ProfileSelect /></RequireAuth>
        } />

        {/* App principale (authentifié + profil choisi) */}
        <Route path="/" element={
          <RequireAuth><RequireProfile><Clearing /></RequireProfile></RequireAuth>
        } />
        <Route path="/zone/dauphinou" element={
          <RequireAuth><RequireProfile><ZoneDauphinou /></RequireProfile></RequireAuth>
        } />
        <Route path="/zone/tartuffe" element={
          <RequireAuth><RequireProfile><ZoneTartuffe /></RequireProfile></RequireAuth>
        } />
        <Route path="/zone/mollasson" element={
          <RequireAuth><RequireProfile><ZoneMollasson /></RequireProfile></RequireAuth>
        } />
        <Route path="/zone/bobby" element={
          <RequireAuth><RequireProfile><ZoneBobby /></RequireProfile></RequireAuth>
        } />
        <Route path="/cabin" element={
          <RequireAuth><RequireProfile><Cabin /></RequireProfile></RequireAuth>
        } />
        <Route path="/collection" element={
          <RequireAuth><RequireProfile><Collection /></RequireProfile></RequireAuth>
        } />
        <Route path="/parent" element={
          <RequireAuth><ParentDashboard /></RequireAuth>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
