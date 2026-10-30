import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/react';
import { CAREER_GOAL_OPTIONS, WORK_PREFERENCE_OPTIONS } from '@talentbridge/contracts';
import { InlineError, PageLoader } from '../../components/Feedback.jsx';
import { apiRequest } from '../../lib/api.js';

const GOAL_DESCRIPTIONS = {
  senior_growth: { description: 'Level up your skills, scope, and impact.', icon: '↗' },
  next_opportunity: { description: 'Discover a role that better fits your ambitions.', icon: '▱' },
  career_direction: { description: 'Find where your strengths could take you next.', icon: '⇄' },
};

export default function CareerSelectionPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedRoleId = searchParams.get('roleId') || '';
  const requestedIndustryId = searchParams.get('industryId') || '';
  const [roles, setRoles] = useState([]);
  const [profile, setProfile] = useState(null);
  const [goalType, setGoalType] = useState('');
  const [roleId, setRoleId] = useState(requestedRoleId);
  const [industryId, setIndustryId] = useState(requestedIndustryId);
  const [targetTimeline, setTargetTimeline] = useState('');
  const [workPreferences, setWorkPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async (signal) => {
    try {
      const token = await getToken();
      const [roleResult, profileResult, goalResult] = await Promise.all([
        apiRequest('/roles?page=1&limit=24', { token, signal }),
        apiRequest('/profile', { token, signal }),
        apiRequest('/career-goals/current', { token, signal }),
      ]);
      const availableRoles = roleResult.items || [];
      setRoles(availableRoles);
      setProfile(profileResult.profile || null);
      setGoalType(goalResult.goal?.goalType || profileResult.profile?.mainGoal || '');
      setTargetTimeline(goalResult.goal?.targetTimeline || profileResult.profile?.targetTimeline || '');
      setWorkPreferences(Array.isArray(profileResult.profile?.workPreferences) ? profileResult.profile.workPreferences : []);
      const currentRoleId = goalResult.goal?.roleId || profileResult.profile?.selectedRoleId || profileResult.profile?.targetRole || '';
      const chosen = requestedRoleId || currentRoleId;
      const matchingRole = availableRoles.find((role) => role.roleId === chosen || role.title.toLowerCase() === String(chosen).toLowerCase());
      setRoleId(matchingRole?.roleId || '');
      const currentIndustryId = requestedIndustryId || goalResult.goal?.industryId || profileResult.profile?.selectedIndustryId || '';
      const matchingIndustry = matchingRole?.industries?.find((industry) => industry.industryId === currentIndustryId);
      setIndustryId(matchingIndustry?.industryId || (matchingRole?.industries?.length === 1 ? matchingRole.industries[0].industryId : ''));
      setError('');
    } catch (requestError) {
      if (requestError.name !== 'AbortError') setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [getToken, requestedRoleId, requestedIndustryId]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const selectedRole = useMemo(() => roles.find((role) => role.roleId === roleId) || null, [roles, roleId]);
  const displayName = profile?.preferredName || user?.firstName || 'there';

  function handleRoleChange(nextRoleId) {
    setRoleId(nextRoleId);
    const nextRole = roles.find((role) => role.roleId === nextRoleId);
    const currentIndustry = nextRole?.industries?.find((industry) => industry.industryId === industryId);
    setIndustryId(currentIndustry?.industryId || (nextRole?.industries?.length === 1 ? nextRole.industries[0].industryId : ''));
  }

  function toggleWorkPreference(value) {
    setWorkPreferences((previous) => {
      if (previous.includes(value)) return previous.filter((item) => item !== value);
      if (value === 'Open to anything') return [value];
      return [...previous.filter((item) => item !== 'Open to anything'), value];
    });
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!goalType || !selectedRole) {
      setError('Choose your main goal and a published role to continue.');
      return;
    }
    if (!industryId || !selectedRole.industries?.some((industry) => industry.industryId === industryId)) {
      setError('Choose the industry you want to associate with this role.');
      return;
    }
    setSaving(true);
    try {
      const token = await getToken();
      const pathResult = await apiRequest(`/roles/${encodeURIComponent(selectedRole.roleId)}/path`, { token });
      if (!pathResult.path?.rolePathVersionId) {
        throw new Error('This role does not have a complete published industry and career path reference yet.');
      }
      await apiRequest('/career-goals/current', {
        token,
        method: 'PUT',
        body: {
          industryId,
          roleId: selectedRole.roleId,
          rolePathVersionId: pathResult.path.rolePathVersionId,
          goalType,
          targetTimeline,
          workPreferences,
          selectionSource: 'career_selection',
        },
      });
      setNotice('Your career selection has been saved.');
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoader label="Loading career selection" />;

  return (
    <main className="tb-onboarding-page tb-career-selection-page">
      <aside className="tb-onboarding-aside">
        <Link className="tb-onboarding-brand" to="/dashboard" aria-label="TalentBridge workspace">
          <img src="/assets/talentbridge-mark.png" alt="" /><span>TalentBridge</span>
        </Link>
        <div className="tb-onboarding-aside-copy">
          <div className="tb-onboard-aside-eyebrow">YOUR NEXT CHAPTER STARTS HERE</div>
          <h2>Choose a direction that feels right for you, {displayName}.</h2>
          <p>Your choice becomes the starting point for the next parts of your TalentBridge career workspace.</p>
        </div>
        <div className="tb-onboarding-privacy"><span aria-hidden="true">♧</span><strong>Your career. Your data. Your choice.</strong><p>You can change your career direction later. Your previous selections are retained in your career history.</p></div>
      </aside>

      <section className="tb-onboarding-main">
        <div className="tb-onboarding-topline"><span>Career selection</span><Link to="/roles">Explore roles</Link></div>
        <div className="tb-onboarding-progress"><span style={{ width: '100%' }} /></div>
        <form className="tb-onboarding-content" onSubmit={submit}>
          <div className="tb-onboard-heading">
            <div className="tb-onboard-eyebrow">YOUR DIRECTION</div>
            <h1>Where would you like to go, {displayName}?</h1>
            <p>Choose your main goal and a reviewed role from the TalentBridge catalogue. You can change these details later.</p>
          </div>

          <div className="tb-onboard-field-label">What's your main goal right now?</div>
          <div className="tb-onboard-goals" role="radiogroup" aria-label="Main career goal">
            {CAREER_GOAL_OPTIONS.map(([value, title]) => (
              <button key={value} type="button" role="radio" aria-checked={goalType === value} className={`tb-onboard-goal ${goalType === value ? 'selected' : ''}`} onClick={() => setGoalType(value)}>
                <span className="tb-onboard-goal-icon">{GOAL_DESCRIPTIONS[value]?.icon || '◇'}</span>
                <span><strong>{title}</strong><small>{GOAL_DESCRIPTIONS[value]?.description}</small></span>
                <span className="tb-onboard-radio" />
              </button>
            ))}
          </div>

          <div className="tb-onboard-grid tb-onboard-direction-fields">
            <label className="field tb-onboard-field tb-onboard-span" htmlFor="careerSelectionRole">
              <span>Which role are you working toward? *</span>
              <select id="careerSelectionRole" value={roleId} required onChange={(event) => handleRoleChange(event.target.value)} disabled={!roles.length}>
                <option value="">{roles.length ? 'Choose a published role' : 'No published roles available yet'}</option>
                {roles.map((role) => <option key={role.roleId} value={role.roleId}>{role.title} — {role.industries.map((industry) => industry.name).join(', ')}</option>)}
              </select>
              {selectedRole ? <small className="tb-career-selection-role-summary">{selectedRole.summary}</small> : null}
            </label>
            <label className="field tb-onboard-field tb-onboard-span" htmlFor="careerSelectionIndustry">
              <span>Which industry best describes this direction? *</span>
              <select id="careerSelectionIndustry" value={industryId} required onChange={(event) => setIndustryId(event.target.value)} disabled={!selectedRole?.industries?.length}>
                <option value="">{selectedRole ? (selectedRole.industries.length ? 'Choose an industry' : 'No published industry available') : 'Choose a role first'}</option>
                {(selectedRole?.industries || []).map((industry) => <option key={industry.industryId} value={industry.industryId}>{industry.name}</option>)}
              </select>
            </label>
            <label className="field tb-onboard-field tb-onboard-span" htmlFor="careerSelectionTimeline">
              <span>When would you like to work toward this direction?</span>
              <input id="careerSelectionTimeline" value={targetTimeline} maxLength="80" onChange={(event) => setTargetTimeline(event.target.value)} placeholder="For example: In the next 3–6 months" />
            </label>
          </div>

          <div className="tb-onboard-work-preferences">
            <div className="tb-onboard-field-label">How do you like to work?</div>
            <div className="tb-onboard-choice-row">
              {WORK_PREFERENCE_OPTIONS.map(([value, label]) => (
                <button key={value} type="button" className={`tb-onboard-choice ${workPreferences.includes(value) ? 'selected' : ''}`} aria-pressed={workPreferences.includes(value)} onClick={() => toggleWorkPreference(value)}>{label}</button>
              ))}
            </div>
          </div>

          {!roles.length ? (
            <div className="tb-career-selection-catalogue-note">
              <strong>Role catalogue preparation is in progress.</strong>
              <span>Only roles with reviewed source information and a published career path can be selected. Browse the Industry Library while the catalogue is being curated.</span>
              <Link to="/industries">Explore industries →</Link>
            </div>
          ) : null}
          <InlineError message={error} />
          {notice ? <div className="form-success" role="status">{notice}</div> : null}
          <div className="tb-onboarding-actions">
            <Link className="tb-onboarding-back" to="/roles">Back to roles</Link>
            <button className="tb-onboarding-primary" type="submit" disabled={saving || !roles.length}>{saving ? 'Saving…' : 'Save career selection'} <span>→</span></button>
          </div>
          <p className="tb-onboarding-bottom-note">Role information is based on published catalogue content. Availability and hiring outcomes are not guaranteed.</p>
        </form>
      </section>
    </main>
  );
}
