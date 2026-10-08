import { useState, type ReactElement } from 'react';
import { Link } from 'react-router';
import { listSessions, performedFrom, regenerateActivePlan, saveSession } from '../db/db';
import { arcTitle } from '../domain/arc';
import { labelArcWeek, labelDayKind, labelWeekday } from '../domain/labels';
import { rankForXp } from '../domain/ranks';
import { buildSession } from '../domain/session';
import { useApp } from '../state/app-state';
import { useWorkoutLauncher } from '../state/launch';
import { Avatar } from '../ui/Avatar';
import { Dialog } from '../ui/Dialog';
import { ExerciseThumb } from '../ui/ExerciseThumb';

export function PlanPage(): ReactElement {
  const { profile, plan, arc, exercises, routines, refresh } = useApp();
  const { launch, dialog } = useWorkoutLauncher();
  const [selected, setSelected] = useState(0);
  const [confirm, setConfirm] = useState(false);
  if (!profile || !plan || !arc) return <main className="screen"><p>Preparando el plan…</p></main>;
  const day = plan.days[selected] ?? plan.days[0];

  return (
    <main className="screen">
      {dialog}
      <header className="page-hero">
        <Avatar gender={profile.avatar} rank={rankForXp(profile.xpTotal).id} pose="idle" />
        <div>
          <p className="kicker">{arcTitle(arc.number)}</p>
          <h1>
            Semana {arc.weekInArc} · {labelArcWeek(arc.weekInArc)}
          </h1>
        </div>
      </header>
      {arc.weekInArc === 4 ? <p>Semana templo: menos carga, el poder se asienta.</p> : null}
      {arc.repeatNotice ? <p>Repites esta semana del arco para asentar el poder.</p> : null}
      <div className="row">
        <Link className="btn" to="/biblioteca">Biblioteca</Link>
        <Link className="btn" to="/plan/rutina/nueva">Nueva rutina</Link>
        <button type="button" className="btn" onClick={() => setConfirm(true)}>Regenerar semana</button>
      </div>
      <div className="plan-layout">
        <ol className="day-list">
          {plan.days.map((item, index) => (
            <li key={item.id}>
              <button type="button" className={day?.id === item.id ? 'day-btn is-on' : 'day-btn'} onClick={() => setSelected(index)}>
                <strong>{labelWeekday(item.weekday)}</strong>
                <span>{labelDayKind(item.kind)}{item.pinned ? ' · clavado' : ''}</span>
              </button>
            </li>
          ))}
        </ol>
        {day ? (
          <section className="card">
            <h2>{labelWeekday(day.weekday)} · {labelDayKind(day.kind)}</h2>
            <ol>
              {day.items.map((item) => {
                const exercise = exercises.find((entry) => entry.id === item.exerciseId);
                const nombre = exercise?.nombre ?? item.exerciseId;
                return (
                  <li key={`${item.slot}-${item.exerciseId}`} className="plan-exercise">
                    {exercise ? <ExerciseThumb exercise={exercise} nombre={nombre} /> : null}
                    <span>
                      {nombre}
                      <span className="muted"> · {item.series} × {item.repMin}–{item.repMax}{item.medida === 'segundos' ? ' s' : ''} · {item.descansoSegundos} s</span>
                    </span>
                  </li>
                );
              })}
            </ol>
            <div className="row">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  void launch(async () => {
                    const history = await listSessions();
                    const session = buildSession({
                      profile,
                      exercises,
                      nombre: `${labelWeekday(day.weekday)} · ${labelDayKind(day.kind)}`,
                      planDay: day,
                      weekInArc: arc.weekInArc,
                      performed: performedFrom(history),
                    });
                    await saveSession(session);
                    return session.id;
                  })
                }
              >
                Empezar entreno
              </button>
              <Link className="btn" to={`/plan/rutina/dia_${day.id}`}>Editar día</Link>
            </div>
          </section>
        ) : null}
      </div>
      <section>
        <h2>Rutinas</h2>
        {routines.length === 0 ? <p className="muted">Todavía no hay rutinas propias.</p> : null}
        <ul className="plain">
          {routines.map((routine) => (
            <li key={routine.id} className="split">
              <span>{routine.name}</span>
              <span className="row">
                <Link to={`/plan/rutina/${routine.id}`}>Editar</Link>
                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    void launch(async () => {
                      const history = await listSessions();
                      const session = buildSession({
                        profile,
                        exercises,
                        nombre: routine.name,
                        routine,
                        weekInArc: arc.weekInArc,
                        performed: performedFrom(history),
                      });
                      await saveSession(session);
                      return session.id;
                    })
                  }
                >
                  Empezar rutina libre
                </button>
              </span>
            </li>
          ))}
        </ul>
      </section>
      {confirm ? (
        <Dialog title="Regenerar semana" onClose={() => setConfirm(false)}>
          <p>Se rehacen los días no clavados. El historial se queda.</p>
          <div className="row">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                void regenerateActivePlan({ futureOnly: false }).then(() => refresh());
                setConfirm(false);
              }}
            >
              Regenerar
            </button>
            <button type="button" className="btn" onClick={() => setConfirm(false)}>Volver</button>
          </div>
        </Dialog>
      ) : null}
    </main>
  );
}
