import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Exercise } from '../catalog';
import {
  advanceArcIfNeeded,
  ensureSeed,
  getActiveArc,
  getActivePlan,
  getHero,
  getProfile,
  listAchievements,
  listExercises,
  listRoutines,
  liveSession,
  syncAchievements,
} from '../db/db';
import { localDateISO } from '../domain/dates';
import type { Arc, HeroLog, Plan, Profile, Routine, StoredAchievement, WorkoutSession } from '../domain/model';

interface AppValue {
  ready: boolean;
  profile: Profile | null;
  exercises: Exercise[];
  routines: Routine[];
  arc: Arc | null;
  plan: Plan | null;
  live: WorkoutSession | null;
  heroToday: HeroLog | null;
  achievements: StoredAchievement[];
  notice: string | null;
  setNotice: (notice: string | null) => void;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }): ReactNode {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [arc, setArc] = useState<Arc | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [live, setLive] = useState<WorkoutSession | null>(null);
  const [heroToday, setHeroToday] = useState<HeroLog | null>(null);
  const [achievements, setAchievements] = useState<StoredAchievement[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  async function refresh(): Promise<void> {
    await ensureSeed();
    if (await getProfile()) {
      await advanceArcIfNeeded();
      await syncAchievements();
    }
    const [nextProfile, nextExercises, nextRoutines, nextArc, nextPlan, nextLive, nextHero, nextAchievements] = await Promise.all([
      getProfile(),
      listExercises(),
      listRoutines(),
      getActiveArc(),
      getActivePlan(),
      liveSession(),
      getHero(localDateISO()),
      listAchievements(),
    ]);
    setProfile(nextProfile);
    setExercises(nextExercises);
    setRoutines(nextRoutines);
    setArc(nextArc);
    setPlan(nextPlan);
    setLive(nextLive);
    setHeroToday(nextHero ?? null);
    setAchievements(nextAchievements);
    setReady(true);
  }

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.intensity = profile?.theme ?? 'media';
  }, [profile?.theme]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = (): void => {
      document.documentElement.dataset.motion = media.matches ? 'reduce' : 'ok';
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  const value = useMemo<AppValue>(
    () => ({
      ready,
      profile,
      exercises,
      routines,
      arc,
      plan,
      live,
      heroToday,
      achievements,
      notice,
      setNotice,
      refresh,
    }),
    [ready, profile, exercises, routines, arc, plan, live, heroToday, achievements, notice],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppValue {
  const value = useContext(AppContext);
  if (!value) throw new Error('Falta el proveedor de la app.');
  return value;
}
