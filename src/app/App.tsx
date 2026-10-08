import type { ReactElement } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router';
import { BuilderPage } from '../pages/BuilderPage';
import { ExercisePage } from '../pages/ExercisePage';
import { HeroHistoryPage, HeroPage } from '../pages/HeroPage';
import { CalendarPage, RecordsPage, VolumePage, WeightPage } from '../pages/HistoryPages';
import { LibraryPage } from '../pages/LibraryPage';
import { OnboardingPage } from '../pages/OnboardingPage';
import { PlanPage } from '../pages/PlanPage';
import { PlayerPage } from '../pages/PlayerPage';
import { PowerPage } from '../pages/PowerPage';
import { SettingsPage } from '../pages/SettingsPage';
import { SummaryPage } from '../pages/SummaryPage';
import { TodayPage } from '../pages/TodayPage';
import { YouPage } from '../pages/YouPage';
import { AppProvider, useApp } from '../state/app-state';
import { Shell } from '../ui/Shell';

function Gate(): ReactElement {
  const { ready, profile } = useApp();
  const location = useLocation();
  if (!ready) return <p className="boot">Cargando tu poder…</p>;
  if (!profile && location.pathname !== '/onboarding') return <Navigate to="/onboarding" replace />;
  if (profile && location.pathname === '/onboarding') return <Navigate to="/" replace />;
  return <Outlet />;
}

function Frame(): ReactElement {
  const { pathname } = useLocation();
  if (pathname.startsWith('/entreno')) return <Outlet />;
  return <Shell />;
}

export function App(): ReactElement {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Gate />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route element={<Frame />}>
              <Route path="/" element={<TodayPage />} />
              <Route path="/plan" element={<PlanPage />} />
              <Route path="/plan/rutina/:id" element={<BuilderPage />} />
              <Route path="/biblioteca" element={<LibraryPage />} />
              <Route path="/biblioteca/:id" element={<ExercisePage />} />
              <Route path="/historial" element={<CalendarPage />} />
              <Route path="/historial/volumen" element={<VolumePage />} />
              <Route path="/historial/records" element={<RecordsPage />} />
              <Route path="/historial/peso" element={<WeightPage />} />
              <Route path="/reto" element={<HeroPage />} />
              <Route path="/reto/historial" element={<HeroHistoryPage />} />
              <Route path="/poder" element={<PowerPage />} />
              <Route path="/tu" element={<YouPage />} />
              <Route path="/ajustes" element={<SettingsPage />} />
              <Route path="/entreno/:id" element={<PlayerPage />} />
              <Route path="/entreno/:id/resumen" element={<SummaryPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
