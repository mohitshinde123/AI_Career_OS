import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { InlineError, PageLoader } from '../../components/Feedback.jsx';
import { apiRequest } from '../../lib/api.js';

const INDUSTRY_GLYPHS = {
  code: '</>',
  database: '▤',
  brain: '✧',
  shield: '⬟',
  cloud: '☁',
  infinity: '∞',
  product: '◇',
  design: '✎',
};

const WHY_ITEMS = [
  { icon: '↗', tone: 'cyan', title: 'Understand industry trends', description: 'Review published growth and opportunity information.' },
  { icon: '♧', tone: 'violet', title: 'Discover relevant roles', description: 'Explore reviewed roles and their required skills.' },
  { icon: '◎', tone: 'blue', title: 'Make informed decisions', description: 'Compare directions before choosing a career goal.' },
  { icon: '☆', tone: 'gold', title: 'Build a future-ready skill set', description: 'See which skills are connected to roles you explore.' },
];

const TREND_TYPES = [
  { key: 'growth', title: 'Industry growth', icon: '↗' },
  { key: 'compensation', title: 'Compensation outlook', icon: '♧' },
  { key: 'skills', title: 'Skills in demand', icon: '♧' },
];

function IndustryGlyph({ iconKey }) {
  return <span className={`tb-industry-glyph tb-industry-glyph-${iconKey || 'code'}`} aria-hidden="true">{INDUSTRY_GLYPHS[iconKey] || '◇'}</span>;
}

function WhyExplorePanel() {
  return (
    <aside className="tb-industry-why-panel" aria-labelledby="why-industries-heading">
      <h2 id="why-industries-heading">Why Explore Industries?</h2>
      <div className="tb-industry-why-list">
        {WHY_ITEMS.map((item) => (
          <div className="tb-industry-why-item" key={item.title}>
            <span className={`tb-industry-why-icon ${item.tone}`} aria-hidden="true">{item.icon}</span>
            <span><strong>{item.title}</strong><small>{item.description}</small></span>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default function IndustryLibraryPage() {
  const { getToken } = useAuth();
  const [industries, setIndustries] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async (signal, search = '') => {
    try {
      const token = await getToken();
      const suffix = new URLSearchParams({ page: '1', limit: '24', ...(search ? { q: search } : {}) });
      const [result, trendResult] = await Promise.all([
        apiRequest(`/industries?${suffix.toString()}`, { token, signal }),
        apiRequest('/industry-trends?limit=6', { token, signal }),
      ]);
      setIndustries(result.items || []);
      setTrends(trendResult.items || []);
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

  async function searchIndustries(event) {
    event.preventDefault();
    setLoading(true);
    await load(undefined, query.trim());
  }

  if (loading) return <PageLoader label="Loading the industry library" />;

  return (
    <div className="tb-industry-page">
      <div className="tb-industry-breadcrumb"><Link to="/dashboard">Home</Link><span>›</span><strong>Industry Library</strong></div>
      <div className="tb-industry-top-grid">
        <div className="tb-industry-main-column">
          <header className="tb-industry-heading">
            <h1>Industry Library</h1>
            <p>Explore different industries, understand their work, and discover the roles and skills connected to each direction.</p>
            <p>Find an industry that matches your interests and career goals.</p>
          </header>

          <section className="tb-industry-feature" aria-labelledby="industry-feature-heading">
            <div className="tb-industry-feature-copy">
              <span className="tb-industry-feature-tag">FEATURED</span>
              <h2 id="industry-feature-heading">Discover Your Future Industry</h2>
              <p>Explore eight industry areas, learn about related roles, and find a direction that fits your goals.</p>
              <a className="tb-industry-feature-button" href="#industry-catalogue">Explore Industries <span aria-hidden="true">→</span></a>
            </div>
            <img src="/assets/industry-library/industry-future-illustration.png" alt="A person exploring a city of technology and industry symbols" />
          </section>

          <section className="tb-industry-catalogue" id="industry-catalogue" aria-labelledby="industry-catalogue-heading">
            <div className="tb-industry-section-heading">
              <h2 id="industry-catalogue-heading">Featured Industries</h2>
              <span>{industries.length} industries available</span>
            </div>
            {error ? <InlineError message={error} onRetry={() => { setLoading(true); setReloadKey((value) => value + 1); }} /> : null}
            <form className="tb-industry-search" onSubmit={searchIndustries}>
              <span aria-hidden="true">⌕</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search industries..." aria-label="Search industries" />
              <button type="submit">Search</button>
            </form>
            {industries.length ? (
              <div className="tb-industry-card-grid">
                {industries.map((industry) => (
                  <Link className="tb-industry-card" to={`/roles?industryId=${encodeURIComponent(industry.industryId)}`} key={industry.industryId}>
                    <IndustryGlyph iconKey={industry.iconKey} />
                    <h3>{industry.name}</h3>
                    <p>{industry.summary}</p>
                    <span className="tb-industry-card-link">{industry.roleCount > 0 ? `${industry.roleCount} reviewed roles` : 'Explore roles'} <i aria-hidden="true">→</i></span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="tb-industry-empty">No published industries match this search. Try another term.</div>
            )}
          </section>

          <section className="tb-industry-trends" aria-labelledby="industry-trends-heading">
            <div className="tb-industry-section-heading">
              <h2 id="industry-trends-heading">Industry Trends</h2>
              <span>Reviewed information only</span>
            </div>
            <div className="tb-industry-trend-grid">
              {trends.length ? trends.map((item, index) => (
                <article className="tb-industry-trend-card" key={`${item.industryId}-${item.trendType}-${item.checkedAt}`}>
                  <span className={`tb-industry-trend-icon tone-${(index % 3) + 1}`} aria-hidden="true">{TREND_TYPES.find((trend) => trend.key === item.trendType)?.icon || '↗'}</span>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <span className="tb-industry-trend-status">{item.industryName} · Source reviewed</span>
                </article>
              )) : TREND_TYPES.map((item, index) => (
                <article className="tb-industry-trend-card" key={item.key}>
                  <span className={`tb-industry-trend-icon tone-${index + 1}`} aria-hidden="true">{item.icon}</span>
                  <h3>{item.title}</h3>
                  <p>No reviewed trend snapshot is currently published. Verified source-backed information will appear here when available.</p>
                  <span className="tb-industry-trend-status">Awaiting reviewed data</span>
                </article>
              ))}
            </div>
          </section>
        </div>
        <WhyExplorePanel />
      </div>

      <section className="tb-industry-next-step">
        <span className="tb-industry-next-icon" aria-hidden="true">◎</span>
        <div>
          <h2>Ready to take the next step?</h2>
          <p>Once you've explored the industries, head to the Role Marketplace to discover published roles and their reviewed career information.</p>
        </div>
        <Link to="/roles">Go to Role Marketplace <span aria-hidden="true">→</span></Link>
      </section>
    </div>
  );
}
