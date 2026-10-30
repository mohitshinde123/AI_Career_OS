import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/react';
import { InlineError, PageLoader } from '../../components/Feedback.jsx';
import { apiRequest } from '../../lib/api.js';

function greetingForHour(hour) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function dashboardDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).toUpperCase();
}

function MetricCard({ label, value = '—', note }) {
  return (
    <article className="figma-metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {note ? <small>{note}</small> : null}
    </article>
  );
}

function EmptyContent({ children }) {
  return <div className="figma-dashboard-empty">{children}</div>;
}

export default function DashboardPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async (signal) => {
    try {
      const token = await getToken();
      if (!token) throw new Error('Your signed-in session is not ready. Please try again.');
      const data = await apiRequest('/me', { token, signal });
      setAccount(data);
      setError('');
    } catch (requestError) {
      if (requestError.name !== 'AbortError') setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    load(controller.signal);
    return () => controller.abort();
  }, [load, reloadKey]);

  const now = useMemo(() => new Date(), []);

  if (loading) return <PageLoader label="Loading your career workspace" />;

  if (!account) {
    return (
      <div className="figma-dashboard-error">
        <InlineError message={error || 'Your career workspace could not be loaded.'} />
        <button className="figma-button figma-button-outline" type="button" onClick={() => setReloadKey((value) => value + 1)}>
          Try again
        </button>
      </div>
    );
  }

  if (!account.onboardingCompleted) return <Navigate to="/onboarding" replace />;

  const profile = account.profile || {};
  const displayName = profile.preferredName || user?.firstName || 'there';
  const careerDirection = profile.targetInterest?.trim() || 'No career direction added yet';

  return (
    <div className="figma-dashboard-page">
      <div className="figma-dashboard-heading-row">
        <div>
          <span className="figma-dashboard-date">{dashboardDate(now)}</span>
          <h1>{greetingForHour(now.getHours())}, {displayName} ☀</h1>
          <p>Your next chapter is taking shape. Let's keep the momentum going.</p>
        </div>
        <button className="figma-period-select" type="button" disabled>
          <span aria-hidden="true">▦</span> This week <span aria-hidden="true">⌄</span>
        </button>
      </div>

      {error ? <InlineError message={error} /> : null}

      <section className="figma-dashboard-top-grid" aria-label="Your career pulse">
        <article className="figma-career-pulse-card">
          <div className="figma-pulse-ring"><strong>—</strong><span>Career score</span></div>
          <div className="figma-pulse-copy">
            <span className="figma-pulse-kicker">✦ YOUR CAREER PULSE</span>
            <h2>You're closer to your next role.</h2>
          </div>
          <p className="figma-pulse-description">Let's keep the momentum going.</p>
          <Link className="figma-pulse-link" to="/profile">See your growth insights →</Link>
        </article>
        <MetricCard label="Resume score" value="— / 100" note="Available after resume analysis" />
        <MetricCard label="Strong-fit opportunities" value="—" note="Available when job matching is connected" />
      </section>

      <section className="figma-dashboard-middle-grid">
        <article className="figma-dashboard-panel figma-momentum-panel">
          <div className="figma-panel-heading">
            <h2>Your career momentum</h2>
            <span>Last 6 weeks <b>⌄</b></span>
          </div>
          <p>Steady progress across the skills that matter.</p>
          <div className="figma-chart-legend">
            <span><i className="legend-dot readiness" /> Your readiness</span>
            <span><i className="legend-dot benchmark" /> Target-role benchmark</span>
          </div>
          <div className="figma-chart-empty" aria-label="Progress chart awaits recorded activity">
            <div className="figma-chart-gridline"><span>100</span></div>
            <div className="figma-chart-gridline"><span>75</span></div>
            <div className="figma-chart-gridline"><span>50</span></div>
            <div className="figma-chart-gridline"><span>25</span></div>
          </div>
          <div className="figma-chart-dates"><span>Progress history will appear as career activity is recorded.</span></div>
        </article>

        <div className="figma-dashboard-right-stack">
          <article className="figma-dashboard-panel figma-growth-panel">
            <div className="figma-panel-heading"><h2>Your growth plan</h2></div>
            <p className="figma-growth-role">{careerDirection}</p>
            <div className="figma-progress-heading"><span>Roadmap progress</span><strong>—</strong></div>
            <div className="figma-progress-empty" />
            <p className="figma-growth-count">Milestone progress will appear when your roadmap is connected.</p>
            <Link className="figma-panel-outline-button" to="/profile">Review your profile →</Link>
          </article>

          <article className="figma-dashboard-panel figma-upcoming-panel">
            <div className="figma-panel-heading"><h2>Coming up next</h2><span aria-hidden="true">▦</span></div>
            <EmptyContent>No upcoming sessions are scheduled.</EmptyContent>
            <button className="figma-panel-outline-button" type="button" disabled>View interview details</button>
          </article>
        </div>

        <article className="figma-dashboard-panel figma-next-steps-panel">
          <div className="figma-panel-heading">
            <h2>Your next best steps</h2>
            <span>View roadmap →</span>
          </div>
          <p>Small moves. Meaningful progress.</p>
          <EmptyContent>Your recommended next steps will appear when your career plan is connected.</EmptyContent>
          <button className="figma-mobile-roadmap-button" type="button" disabled>View your roadmap →</button>
        </article>
      </section>

      <section className="figma-opportunities-section">
        <div className="figma-panel-heading">
          <h2><span className="figma-desktop-opportunity-title">Opportunities picked for you</span><span className="figma-mobile-opportunity-title">Picked for you</span></h2>
          <span>View all matches →</span>
        </div>
        <div className="figma-opportunity-empty">
          <EmptyContent>Personalized opportunities will appear when job discovery is available.</EmptyContent>
        </div>
      </section>
    </div>
  );
}
