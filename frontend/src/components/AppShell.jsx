import { Link, useLocation } from 'react-router-dom';

const navigationLinks = [
  ['dashboard', 'Overview', '⌂'],
  ['inventory', 'Inventory', '▤'],
  ['categories', 'Categories', '▦'],
  ['wishlist', 'Bucket list', '♡'],
  ['reminders', 'Reminders', '◷'],
  ['profile', 'Profile', '◎'],
];

export default function AppShell({ children, username, onLogout }) {
  const location = useLocation();
  const page = location.pathname.split('/')[1] || 'dashboard';
  const currentPage = navigationLinks.find(link => link[0] === page)?.[1];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">H</span>
          <span>
            HomeKeeper
            <small>Personal inventory</small>
          </span>
        </div>

        <div className="nav-label">WORKSPACE</div>
        <nav>
          {navigationLinks.map(([key, name, icon]) => (
            <Link
              key={key}
              to={`/${key}`}
              className={page === key ? 'nav-link selected' : 'nav-link'}
            >
              <span>{icon}</span>
              {name}
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="avatar">{username.slice(0, 1).toUpperCase()}</div>
          <div className="user-meta">
            <b>{username}</b>
            <small>Personal account</small>
          </div>
          <button className="logout" title="Sign out" onClick={onLogout}>
            ↗
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="mobile-brand">HomeKeeper</div>
          <div className="crumb">
            My home <span>/</span> {currentPage}
          </div>
          <span className="top-user">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </header>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}

