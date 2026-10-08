import { useState, type ReactElement } from 'react';
import { useNavigate } from 'react-router';
import { unlockAudio } from '../audio/tones';
import { liveSession, saveSession } from '../db/db';
import type { WorkoutSession } from '../domain/model';
import { useApp } from './app-state';
import { Dialog } from '../ui/Dialog';

export function useWorkoutLauncher(): {
  launch: (factory: () => Promise<string>) => Promise<void>;
  dialog: ReactElement | null;
} {
  const navigate = useNavigate();
  const { refresh } = useApp();
  const [live, setLive] = useState<WorkoutSession | null>(null);
  const [factory, setFactory] = useState<(() => Promise<string>) | null>(null);

  async function launch(next: () => Promise<string>): Promise<void> {
    unlockAudio();
    const current = await liveSession();
    if (current) {
      setLive(current);
      setFactory(() => next);
      return;
    }
    const id = await next();
    await refresh();
    navigate(`/entreno/${id}`);
  }

  async function discard(): Promise<void> {
    if (!live || !factory) return;
    const now = new Date().toISOString();
    await saveSession({
      ...live,
      status: 'abandonada',
      finishedAt: now,
      date: live.date,
      xpAwarded: 0,
      xpParts: null,
      restEndsAt: null,
    });
    const id = await factory();
    setLive(null);
    setFactory(null);
    await refresh();
    navigate(`/entreno/${id}`);
  }

  const dialog = live ? (
    <Dialog title="Hay un entreno a medias" onClose={() => setLive(null)}>
      <p>Solo puede haber un entreno abierto.</p>
      <div className="row">
        <button type="button" className="btn btn-primary" onClick={() => navigate(`/entreno/${live.id}`)}>
          Seguir el entreno a medias
        </button>
        <button type="button" className="btn btn-danger" onClick={() => void discard()}>
          Descartarlo
        </button>
      </div>
    </Dialog>
  ) : null;

  return { launch, dialog };
}
