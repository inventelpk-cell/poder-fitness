import type { ReactElement } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { useApp } from '../state/app-state';

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
  const { notice, setNotice } = useApp();
  return (
    <div className="shell">
      <aside className="sidebar">
        <img className="wordmark-img" src="/design/brand/logo-horizontal.svg" alt="Poder Fitness" />
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
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
