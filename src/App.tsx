import { useEffect, useState } from 'react'
import { NavLink, Navigate, Outlet, Route, Routes, useLocation } from 'react-router'
import { useReducedMotion } from 'motion/react'
import { rankForLevel, RANKS } from './domain/ranks'
import { TransformationScreen } from './visual'
import { usePoder } from './state/store'
import { asset } from './ui/asset'
import { Onboarding } from './screens/Onboarding'
import { Home } from './screens/Home'
import { Plan } from './screens/Plan'
import { RoutineBuilder } from './screens/RoutineBuilder'
import { Library } from './screens/Library'
import { ExerciseCard } from './screens/ExerciseCard'
import { Player } from './screens/Player'
import { Summary } from './screens/Summary'
import { History } from './screens/History'
import { SessionDetail } from './screens/SessionDetail'
import { Poder } from './screens/Poder'
import { Hero } from './screens/Hero'
import { Settings } from './screens/Settings'
import { DataScreen } from './screens/DataScreen'
import { About } from './screens/About'

const NAV = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/plan', label: 'Plan', end: false },
  { to: '/biblioteca', label: 'Biblioteca', end: false },
  { to: '/poder', label: 'Poder', end: false },
  { to: '/historial', label: 'Historial', end: false },
  { to: '/ajustes', label: 'Ajustes', end: false },
]

function RankOverlay() {
  const poder = usePoder()
  const reduced = useReducedMotion()
  const reveal = poder.rankReveal ?? poder.replay
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!reveal) {
      setReady(false)
      return
    }
    if (reduced) {
      setReady(true)
      return
    }
    const timer = window.setTimeout(() => setReady(true), 400)
    return () => window.clearTimeout(timer)
  }, [reveal, reduced])
  if (!reveal) return null
  const dest = RANKS.find((rank) => rank.id === reveal.to) ?? rankForLevel(poder.streaks.level)
  const continueRank = poder.rankReveal ? () => { void poder.dismissRank() } : poder.dismissReplay
  return (
    <div className="rank-overlay">
      <TransformationScreen
        rankName={dest.name}
        rankTitle={dest.title}
        fromRank={reveal.from}
        toRank={reveal.to}
        onContinue={ready ? continueRank : undefined}
      />
    </div>
  )
}

function AchievementToast() {
  const poder = usePoder()
  const current = poder.achievementQueue[0]
  if (!current || poder.rankReveal) return null
  return (
    <div className="modal-back">
      <div className="modal stack" role="dialog" aria-modal="true" aria-label={current.name}>
        <p className="pf-kicker">Logro</p>
        <h2 className="screen-title">{current.name}</h2>
        <p className="muted">+{current.xp} XP</p>
        <button className="btn primary" type="button" onClick={poder.dismissAchievement}>Seguir</button>
      </div>
    </div>
  )
}

function Frame() {
  const poder = usePoder()
  const location = useLocation()
  const player = location.pathname.startsWith('/entreno/')
  const onboard = location.pathname.startsWith('/onboarding')
  const rank = rankForLevel(poder.streaks.level)
  const myth = rank.id === 'mito'
  useEffect(() => {
    document.documentElement.dataset.intensity = poder.settings.themeIntensity
  }, [poder.settings.themeIntensity])
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') void poder.refresh()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [poder])
  return (
    <div className="app-shell pf-surface">
      <div className="pf-layer-grid" />
      <div className={myth ? 'pf-layer-aura pf-layer-aura-myth pf-aura-live' : 'pf-layer-aura pf-aura-live'} />
      <div className="pf-layer-vignette" />
      {!player && !onboard ? (
        <aside className="shell-bar">
          <NavLink to="/" end><img className="brand" src={asset('brand/logo.svg')} alt="Poder Fitness" /></NavLink>
          <nav aria-label="Secciones">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className="nav-link">{item.label}</NavLink>
            ))}
          </nav>
        </aside>
      ) : null}
      <main className={player ? 'shell-main player-main' : 'shell-main'}>
        <Outlet />
      </main>
      {!player && !onboard ? (
        <nav className="tabbar" aria-label="Destinos">
          {NAV.slice(0, 4).map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="tab-link">{item.label}</NavLink>
          ))}
        </nav>
      ) : null}
      <RankOverlay />
      <AchievementToast />
      {poder.toast ? (
        <button className="toast" type="button" onClick={poder.clearToast}>{poder.toast}</button>
      ) : null}
    </div>
  )
}

function Gate() {
  const poder = usePoder()
  const location = useLocation()
  if (!poder.profile && location.pathname !== '/onboarding') return <Navigate to="/onboarding" replace />
  if (poder.profile && location.pathname === '/onboarding') return <Navigate to="/" replace />
  return <Frame />
}

export function App() {
  return (
    <Routes>
      <Route element={<Gate />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/" element={<Home />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/plan/rutina/nueva" element={<RoutineBuilder />} />
        <Route path="/plan/rutina/:id" element={<RoutineBuilder />} />
        <Route path="/biblioteca" element={<Library />} />
        <Route path="/biblioteca/:exerciseId" element={<ExerciseCard />} />
        <Route path="/entreno/:sessionId" element={<Player />} />
        <Route path="/entreno/:sessionId/resumen" element={<Summary />} />
        <Route path="/historial" element={<History />} />
        <Route path="/historial/:sessionId" element={<SessionDetail />} />
        <Route path="/poder" element={<Poder />} />
        <Route path="/poder/reto" element={<Hero />} />
        <Route path="/ajustes" element={<Settings />} />
        <Route path="/ajustes/datos" element={<DataScreen />} />
        <Route path="/ajustes/acerca" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
