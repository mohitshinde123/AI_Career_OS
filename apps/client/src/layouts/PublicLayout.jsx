import { Link, Outlet, useLocation } from 'react-router-dom';
import { UserButton, useAuth } from '@clerk/react';

function TalentBridgeMark() {
  return <img className="brand-mark" src="/assets/talentbridge-mark.png" alt="" />;
}

function LandingHeader() {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <header className="figma-public-nav">
      <div className="figma-public-nav-inner">
        <Link className="figma-public-brand" to="/" aria-label="TalentBridge home">
          <TalentBridgeMark />
          <span>TalentBridge</span>
        </Link>
        <nav className="figma-public-links" aria-label="Main navigation">
          <a href="#platform">Platform</a>
          <a href="#employers">For employers</a>
          <a href="#community">Community</a>
          <a href="#resources">Resources</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className="figma-public-actions">
          {isLoaded && isSignedIn ? (
            <>
              <Link className="figma-nav-signin" to="/dashboard">Workspace</Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link className="figma-nav-signin" to="/sign-in">Sign in</Link>
              <Link className="figma-button figma-button-primary figma-nav-cta" to="/sign-up">
                Start your journey →
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function LandingFooter() {
  return (
    <footer className="figma-public-footer">
      <div className="figma-footer-main">
        <div className="figma-footer-brand-column">
          <Link className="figma-public-brand" to="/">
            <TalentBridgeMark />
            <span>TalentBridge</span>
          </Link>
          <p>The career operating system for people moving forward.<br />Built for potential. Powered by intelligence.</p>
        </div>
        <div className="figma-footer-link-column">
          <h3>Platform</h3>
          <a href="#platform">Career intelligence</a>
          <a href="#tools">Resume studio</a>
          <a href="#tools">Interview practice</a>
          <a href="#tools">Job opportunities</a>
        </div>
        <div className="figma-footer-link-column">
          <h3>Company</h3>
          <a href="#about">About us</a>
          <a href="#employers">For employers</a>
          <a href="#careers">Careers</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="figma-footer-link-column">
          <h3>Resources</h3>
          <a href="#career-intelligence">Career directory</a>
          <a href="#community">Community</a>
          <a href="#faq">Help center</a>
          <a href="#trust">Trust &amp; security</a>
        </div>
      </div>
      <div className="figma-footer-bottom">
        <span>© 2026 TalentBridge. All rights reserved.</span>
        <div><a href="#privacy">Privacy policy</a><a href="#terms">Terms of service</a><a href="#cookies">Cookie preferences</a></div>
        <span className="figma-system-status"><i /> All systems operational</span>
      </div>
    </footer>
  );
}

function AuthPublicLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <div className="site-frame">
      <header className="public-nav">
        <Link className="brand" to="/" aria-label="TalentBridge home">
          <img className="brand-mark" src="/assets/talentbridge-mark.png" alt="" /><span>TalentBridge</span>
        </Link>
        <nav className="public-nav-links" aria-label="Main navigation">
          <a href="/#platform">Platform</a>
          <a href="/#how-it-works">How it works</a>
        </nav>
        <div className="nav-actions">
          {isLoaded && isSignedIn ? (
            <><Link className="button button-quiet button-small" to="/dashboard">Dashboard</Link><UserButton /></>
          ) : (
            <><Link className="button button-quiet button-small" to="/sign-in">Sign in</Link><Link className="button button-primary button-small" to="/sign-up">Get started <span aria-hidden="true">↗</span></Link></>
          )}
        </div>
      </header>
      <Outlet />
      <footer className="public-footer">
        <Link className="brand brand-footer" to="/"><img className="brand-mark" src="/assets/talentbridge-mark.png" alt="" /><span>TalentBridge</span></Link>
        <span>One connected journey from learning to meaningful work.</span>
        <span>© {new Date().getFullYear()} TalentBridge</span>
      </footer>
    </div>
  );
}

export default function PublicLayout() {
  const { pathname } = useLocation();
  const isLandingPage = pathname === '/';

  if (!isLandingPage) return <AuthPublicLayout />;

  return (
    <div className="figma-public-frame">
      <LandingHeader />
      <Outlet />
      <LandingFooter />
    </div>
  );
}
