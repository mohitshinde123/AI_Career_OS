import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { InlineError, PageLoader } from '../../components/Feedback.jsx';
import { apiRequest } from '../../lib/api.js';

export default function RoleMarketplacePage() {
  const { getToken } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialIndustry = searchParams.get('industryId') || '';
  const initialQuery = searchParams.get('q') || '';
  const [industries, setIndustries] = useState([]);
  const [roles, setRoles] = useState([]);
  const [query, setQuery] = useState(initialQuery);
  const [industryId, setIndustryId] = useState(initialIndustry);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async (signal, nextQuery = query, nextIndustry = industryId) => {
    try {
      const token = await getToken();
      const [industryResult, roleResult] = await Promise.all([
        apiRequest('/industries?page=1&limit=24', { token, signal }),
        apiRequest(`/roles?${new URLSearchParams({ page: '1', limit: '24', ...(nextQuery.trim() ? { q: nextQuery.trim() } : {}), ...(nextIndustry ? { industryId: nextIndustry } : {}) })}`, { token, signal }),
      ]);
      setIndustries(industryResult.items || []);
      setRoles(roleResult.items || []);
      setError('');
    } catch (requestError) {
      if (requestError.name !== 'AbortError') setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [getToken, query, industryId]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    load(controller.signal, initialQuery, initialIndustry);
    return () => controller.abort();
  }, [load, reloadKey]);

  async function applyFilters(event) {
    event.preventDefault();
    setLoading(true);
    setSearchParams({ ...(query.trim() ? { q: query.trim() } : {}), ...(industryId ? { industryId } : {}) });
    await load(undefined, query, industryId);
  }

  if (loading) return <PageLoader label="Loading the role marketplace" />;

  return (
    <div className="tb-role-directory-page">
      <div className="tb-role-directory-breadcrumb"><Link to="/dashboard">Workspace</Link><span>/</span><strong>Career directory</strong></div>
      <header className="tb-role-directory-heading">
        <div>
          <span className="tb-role-directory-eyebrow">YOUR NEXT DIRECTION</span>
          <h1>Explore what your future could look like.</h1>
          <p>Discover roles, understand their requirements, and choose a direction that fits your goals.</p>
        </div>
        <Link className="tb-role-directory-compare" to="/career-selection">Review career selection</Link>
      </header>

      <form className="tb-role-directory-filters" onSubmit={applyFilters}>
        <label className="tb-role-search-field">
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search roles and titles..." aria-label="Search roles" />
        </label>
        <label className="tb-role-filter-select">
          <span>Industry</span>
          <select value={industryId} onChange={(event) => setIndustryId(event.target.value)}>
            <option value="">All industries</option>
            {industries.map((industry) => <option key={industry.industryId} value={industry.industryId}>{industry.name}</option>)}
          </select>
        </label>
        <button type="submit" className="tb-role-filter-button">Apply filters</button>
      </form>

      <section className="tb-role-directory-feature" aria-label="Career direction">
        <div><span>CAREER DIRECTORY</span><h2>From craft to strategic influence.</h2><p>Explore role directions and compare the reviewed skills and outcomes associated with each one.</p></div>
        <Link to="/industries">Explore industries <span aria-hidden="true">→</span></Link>
      </section>

      <section className="tb-role-directory-results" aria-labelledby="role-results-heading">
        <div className="tb-role-directory-section-heading">
          <div><h2 id="role-results-heading">Roles aligned with your interests</h2><p>Only published roles with a reviewed career path are shown.</p></div>
          <span>{roles.length} results</span>
        </div>
        {error ? <InlineError message={error} onRetry={() => { setLoading(true); setReloadKey((value) => value + 1); }} /> : null}
        {roles.length ? (
          <div className="tb-role-card-grid">
            {roles.map((role) => (
              <article className="tb-role-market-card" key={role.roleId}>
                <div className="tb-role-market-card-icon" aria-hidden="true">◇</div>
                <div className="tb-role-market-industries">{role.industries.map((industry) => industry.name).join(' · ')}</div>
                <h3>{role.title}</h3>
                <p>{role.summary}</p>
                <div className="tb-role-market-card-footer">
                  <span>Reviewed career path available</span>
                  <Link to={`/career-selection?${new URLSearchParams({ roleId: role.roleId, ...(industryId ? { industryId } : {}) }).toString()}`} aria-label={`Select ${role.title}`}>Explore role <span aria-hidden="true">→</span></Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="tb-role-directory-empty">
            <span aria-hidden="true">⌕</span>
            <h3>No published roles are available yet</h3>
            <p>The catalogue only shows roles with reviewed source information and a published career path. No prototype salaries, match percentages or example roles are displayed as real data.</p>
            <Link to="/industries">Explore the Industry Library</Link>
          </div>
        )}
      </section>

      <section className="tb-role-directory-bottom-callout">
        <div><h2>Not sure which direction is right for you?</h2><p>Explore the industry areas first, then return to compare roles.</p></div>
        <Link to="/industries">Explore the Industry Library <span aria-hidden="true">→</span></Link>
      </section>
    </div>
  );
}
