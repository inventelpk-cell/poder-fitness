import type { ReactElement } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { assertNever } from '../domain/assert';
import { rankForXp } from '../domain/ranks';
import { useApp } from '../state/app-state';
import { Avatar } from './Avatar';

type TabId = 'hoy' | 'plan' | 'historial' | 'tu';

function TabGlyph({ id }: { id: TabId }): ReactElement {
  const common = {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };
  switch (id) {
    case 'hoy':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2" />
        </svg>
      );
    case 'plan':
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M8 3.5v3M16 3.5v3M4 10h16" />
        </svg>
      );
    case 'historial':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4.5l3 2" />
        </svg>
      );
    case 'tu':
      return (
        <svg {...common}>
          <circle cx="12" cy="9" r="3" />
          <path d="M6.5 18.5c1.2-2.3 3-3.5 5.5-3.5s4.3 1.2 5.5 3.5" />
        </svg>
      );
    default:
      return assertNever(id, 'tab');
  }
}

function tabId(to: string): TabId {
  switch (to) {
    case '/':
      return 'hoy';
    case '/plan':
      return 'plan';
    case '/historial':
      return 'historial';
    case '/tu':
      return 'tu';
    default:
      return 'hoy';
  }
}

const LINKS = [
  { to: '/', label: 'Hoy', end: true, wide: false },
  { to: '/plan', label: 'Plan', end: false, wide: false },
  { to: '/biblioteca', label: 'Biblioteca', end: false, wide: true },
  { to: '/historial', label: 'Historial', end: false, wide: false },
  { to: '/reto', label: 'Reto', end: false, wide: true },
  { to: '/poder', label: 'Poder', end: false, wide: true },
  { to: '/tu', label: 'Tú', end: false, wide: false },
] as const;

export function Shell(): ReactElement {
  const { pathname } = useLocation();
  const { notice, setNotice, profile } = useApp();
  return (
    <div className="shell">
      <aside className="sidebar">
        <img className="wordmark-img" src="/design/brand/logo-horizontal.svg" alt="Poder Fitness" />
        {profile ? <Avatar gender={profile.avatar} rank={rankForXp(profile.xpTotal).id} className="sidebar-avatar" /> : null}
        <nav aria-label="Secciones">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="shell-main">
        {notice ? (
          <p className="banner" role="status">
            {notice}
            <button type="button" onClick={() => setNotice(null)}>
              Cerrar
            </button>
          </p>
        ) : null}
        <Outlet />
      </div>
      <nav className="tabbar" aria-label="Principal">
        {LINKS.filter((link) => !link.wide).map((link) => {
          const active =
            link.to === '/tu'
              ? pathname.startsWith('/tu') || pathname.startsWith('/ajustes') || pathname.startsWith('/poder')
              : link.to === '/historial'
                ? pathname.startsWith('/historial')
                : link.to === '/plan'
                  ? pathname.startsWith('/plan') || pathname.startsWith('/biblioteca')
                  : pathname === '/';
          return (
            <NavLink key={link.to} to={link.to} end={link.end} className={active ? 'tab is-active' : 'tab'} aria-current={active ? 'page' : undefined}>
              <TabGlyph id={tabId(link.to)} />
              <span>{link.label}</span>
              <i className={active ? 'tab-dot' : 'tab-dot is-off'} aria-hidden="true" />
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
