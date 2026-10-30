import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/react';

function MobileNavigationIcon({ name }) {
  const common = {
    className: 'figma-mobile-nav-icon',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  switch (name) {
    case 'home':
      return <svg {...common}><rect x="3.5" y="3.5" width="7" height="7" rx="1" /><rect x="13.5" y="3.5" width="7" height="7" rx="1" /><rect x="3.5" y="13.5" width="7" height="7" rx="1" /><rect x="13.5" y="13.5" width="7" height="7" rx="1" /></svg>;
    case 'jobs':
      return <svg {...common}><rect x="3" y="7.5" width="18" height="13" rx="2" /><path d="M8.5 7.5V5.8A1.8 1.8 0 0 1 10.3 4h3.4a1.8 1.8 0 0 1 1.8 1.8v1.7M3 12.5h18M10 12.5v2h4v-2" /></svg>;
    case 'resume':
      return <svg {...common}><path d="M6 3.5h8l4 4v13H6z" /><path d="M14 3.5v4h4M9 12h6M9 15.5h6" /></svg>;
    case 'guide':
      return <svg {...common}><path d="m12 2.8 1.8 6.1 6.1 1.8-6.1 1.8-1.8 6.1-1.8-6.1-6.1-1.8 6.1-1.8z" /><path d="m19 16 .9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9z" /></svg>;
    default:
      return <svg {...common}><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
  }
}

const memberNavigation = [
  { to: '/dashboard', label: 'Overview', icon: '⊞', active: true },
  { label: 'AI career guide', icon: '◇' },
  { label: 'Career roadmap', icon: '◇' },
  { label: 'Resume builder', icon: '◇' },
  { label: 'Resume analyzer', icon: '◇' },
  { label: 'Assessments', icon: '◇' },
  { label: 'Interview practice', icon: '◇' },
  { label: 'Job opportunities', icon: '◇' },
  { label: 'Community', icon: '◇' },
  { label: 'Career directory', icon: '◇' },
];

function Brand() {
  return (
    <Link className="figma-workspace-brand" to="/dashboard" aria-label="TalentBridge overview">
      <img className="brand-mark" src="/assets/talentbridge-mark.png" alt="" />
      <span>TalentBridge</span>
    </Link>
  );
}

function MemberNavigation() {
  return (
    <>
      <div className="figma-sidebar-section-label">YOUR CAREER</div>
      <nav className="figma-workspace-nav" aria-label="Your career">
        {memberNavigation.map((item) => item.active ? (
          <NavLink
            key={item.label}
            to={item.to}
            end
            className={({ isActive }) => `figma-workspace-nav-link${isActive ? ' active' : ''}`}
          >
            <span className="figma-nav-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ) : (
          <span className="figma-workspace-nav-link figma-nav-disabled" key={item.label} aria-disabled="true">
            <span className="figma-nav-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </span>
        ))}
      </nav>
    </>
  );
}

export default function WorkspaceLayout() {
  const { user } = useUser();
  const location = useLocation();
  const displayName = user?.fullName || user?.firstName || 'Your account';
  const roleLabel = user?.publicMetadata?.careerTitle || 'TalentBridge member';
  const pageTitle = {
    '/profile': 'Profile',
    '/onboarding': 'Onboarding',
    '/dashboard': 'Overview',
  }[location.pathname] || 'Workspace';

  return (
    <div className="figma-workspace-shell">
      <aside className="figma-workspace-sidebar">
        <Brand />
        <div className="figma-workspace-switcher">Personal workspace <span>⌄</span></div>
        <MemberNavigation />
        <div className="figma-sidebar-secondary">
          <span><b aria-hidden="true">⚙</b> Settings &amp; preferences</span>
          <span><b aria-hidden="true">?</b> Help &amp; resources</span>
        </div>
        <Link className="figma-sidebar-user" to="/profile" aria-label="Open your profile">
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="" />
          ) : (
            <span className="figma-sidebar-user-initials">{user?.firstName?.slice(0, 1) || '•'}</span>
          )}
          <span><strong>{displayName}</strong><small>{roleLabel}</small></span>
        </Link>
      </aside>

      <div className="figma-workspace-main">
        <header className="figma-workspace-topbar">
          <div className="figma-breadcrumbs"><span>Workspace</span><span>/</span><strong>{pageTitle}</strong></div>
          <div className="figma-topbar-actions">
            <label className="figma-global-search">
              <span aria-hidden="true">⌕</span>
              <input type="text" value="Search anything..." readOnly aria-label="Search anything (not available in this phase)" />
              <kbd>⌘ K</kbd>
            </label>
            <button className="figma-notification-button" type="button" disabled aria-label="Notifications not available yet">♧</button>
            <UserButton />
          </div>
        </header>

        <div className="figma-mobile-header">
          <Brand />
          <div><button type="button" disabled aria-label="Notifications not available yet">♧</button><UserButton /></div>
        </div>

        <main className="figma-workspace-content">
          <Outlet />
        </main>

        <nav className="figma-mobile-bottom-nav" aria-label="Mobile workspace navigation">
          <NavLink to="/dashboard" end className={({ isActive }) => isActive ? 'active' : ''}><MobileNavigationIcon name="home" /><small>Home</small></NavLink>
          <span aria-disabled="true"><MobileNavigationIcon name="jobs" /><small>Jobs</small></span>
          <span aria-disabled="true"><MobileNavigationIcon name="resume" /><small>Resume</small></span>
          <span aria-disabled="true"><MobileNavigationIcon name="guide" /><small>AI guide</small></span>
          <Link to="/profile"><MobileNavigationIcon name="more" /><small>More</small></Link>
        </nav>
      </div>
    </div>
  );
}
