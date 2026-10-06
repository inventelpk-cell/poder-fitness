import type { ReactElement } from 'react';

export function HeroRings({
  flexiones,
  abdominales,
  sentadillas,
  km,
}: {
  flexiones: number;
  abdominales: number;
  sentadillas: number;
  km: number;
}): ReactElement {
  return (
    <div className="bar-list">
      <Meter label="Flexiones" value={flexiones} goal={100} />
      <Meter label="Abdominales" value={abdominales} goal={100} />
      <Meter label="Sentadillas" value={sentadillas} goal={100} />
      <Meter label="Km" value={km} goal={10} km />
    </div>
  );
}

function Meter({ label, value, goal, km = false }: { label: string; value: number; goal: number; km?: boolean }): ReactElement {
  const ratio = Math.max(0, Math.min(1, goal === 0 ? 0 : value / goal));
  const shown = km ? (Number.isInteger(value) ? String(value) : value.toFixed(1)) : String(Math.round(value));
  return (
    <div className="meter">
      <span className="meter-label">{label}</span>
      <span className="meter-num">
        {shown}
        <small>/{goal}</small>
      </span>
      <div className="bar meter-bar" aria-hidden="true">
        <span style={{ width: `${Math.round(ratio * 100)}%` }} />
      </div>
    </div>
  );
}
