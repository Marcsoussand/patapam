import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useProfileStore } from './store/profileStore'
import AppLayout from './components/AppLayout'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import ProfileSelect from './pages/ProfileSelect'
import Clearing from './pages/Clearing'
import ZoneDauphinou from './pages/zones/ZoneDauphinou'
import ZoneTartuffe from './pages/zones/ZoneTartuffe'
import ZoneMollasson from './pages/zones/ZoneMollasson'
import ZoneBobby from './pages/zones/ZoneBobby'
import Cabin from './pages/Cabin'
import Games from './pages/Games'
import Collection from './pages/Collection'
import Market from './pages/Market'
import Library from './pages/Library'
import Beach from './pages/Beach'
import Education from './pages/Education'
import FlagsMap from './pages/education/FlagsMap'
import FlagsLevel from './pages/education/FlagsLevel'
import MathMap from './pages/education/MathMap'
import MathLevel from './pages/education/MathLevel'
import ParentDashboard from './pages/ParentDashboard'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    // onAuthStateChange émet INITIAL_SESSION dès que la session est connue
    // (y compris après échange du code OAuth PKCE) — plus fiable que getSession()
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session)
      setChecked(true)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (!checked) return null
  return loggedIn ? <>{children}</> : <Navigate to="/login" replace />
}

function RequireProfile({ children }: { children: React.ReactNode }) {
  const activeProfile = useProfileStore((s) => s.activeProfile)
  return activeProfile ? <>{children}</> : <Navigate to="/profiles" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Sélection profil */}
        <Route path="/profiles" element={
          <RequireAuth><ProfileSelect /></RequireAuth>
        } />

        {/* App principale */}
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
        <Route path="/market" element={
          <RequireAuth><RequireProfile><Market /></RequireProfile></RequireAuth>
        } />
        <Route path="/library" element={
          <RequireAuth><RequireProfile><Library /></RequireProfile></RequireAuth>
        } />
        <Route path="/beach" element={
          <RequireAuth><RequireProfile><Beach /></RequireProfile></RequireAuth>
        } />
        <Route path="/games" element={
          <RequireAuth><RequireProfile><Games /></RequireProfile></RequireAuth>
        } />
        <Route path="/education" element={
          <RequireAuth><RequireProfile><Education /></RequireProfile></RequireAuth>
        } />
        <Route path="/education/math" element={
          <RequireAuth><RequireProfile><MathMap /></RequireProfile></RequireAuth>
        } />
        <Route path="/education/math/:levelNum" element={
          <RequireAuth><RequireProfile><MathLevel /></RequireProfile></RequireAuth>
        } />
        <Route path="/education/flags" element={
          <RequireAuth><RequireProfile><FlagsMap /></RequireProfile></RequireAuth>
        } />
        <Route path="/education/flags/:levelNum" element={
          <RequireAuth><RequireProfile><FlagsLevel /></RequireProfile></RequireAuth>
        } />
        <Route path="/parent" element={
          <RequireAuth><ParentDashboard /></RequireAuth>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}
