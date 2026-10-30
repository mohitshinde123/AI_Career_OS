import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/react';
import { useNavigate } from 'react-router-dom';
import {
  CURRENT_STATUS_OPTIONS,
  EDUCATION_OPTIONS,
  EXPERIENCE_OPTIONS,
} from '@talentbridge/contracts';
import { InlineError, PageLoader } from '../../components/Feedback.jsx';
import { apiRequest } from '../../lib/api.js';

function editableProfile(profile = {}) {
  return {
    preferredName: profile.preferredName || '',
    currentStatus: profile.currentStatus || '',
    highestEducation: profile.highestEducation || '',
    experienceLevel: profile.experienceLevel || '',
    location: profile.location || '',
    targetInterest: profile.targetInterest || '',
    constraints: profile.constraints || '',
    weeklyAvailabilityHours: profile.weeklyAvailabilityHours ?? '',
    careerPreferences: profile.careerPreferences || '',
    profilePersonalizationConsent: Boolean(profile.profilePersonalizationConsent),
  };
}

function SelectField({ id, label, value, options, onChange }) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <select
        id={id}
        value={value || ''}
        required
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Choose an option</option>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function ProfilePage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async (signal) => {
    try {
      const token = await getToken();
      const data = await apiRequest('/profile', { token, signal });

      if (!data.onboardingCompleted) {
        navigate('/onboarding', { replace: true });
        return;
      }

      setForm(editableProfile(data.profile || {}));
    } catch (requestError) {
      if (requestError.name !== 'AbortError') {
        setError(requestError.message);
      }
    } finally {
      setLoading(false);
    }
  }, [getToken, navigate]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  function update(key, value) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');

    try {
      const token = await getToken();
      const payload = {
        ...form,
        weeklyAvailabilityHours:
          form.weeklyAvailabilityHours === ''
            ? undefined
            : Number(form.weeklyAvailabilityHours),
      };
      const result = await apiRequest('/profile', {
        token,
        method: 'PUT',
        body: payload,
      });
      setForm(editableProfile(result.profile));
      setNotice('Your profile has been saved.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <PageLoader label="Loading your profile" />;
  }

  if (!form) {
    return (
      <div className="content-column">
        <div className="page-heading">
          <div>
            <div className="eyebrow">YOUR CAREER FOUNDATION</div>
            <h1>My profile</h1>
            <p>Your profile could not be loaded. Your saved information has not been replaced.</p>
          </div>
        </div>
        <InlineError
          message={error || 'Profile data is unavailable.'}
          onRetry={() => {
            setLoading(true);
            setError('');
            load();
          }}
        />
      </div>
    );
  }

  return (
    <div className="content-column">
      <div className="page-heading">
        <div>
          <div className="eyebrow">YOUR CAREER FOUNDATION</div>
          <h1>My profile</h1>
          <p>
            Keep your starting-point information accurate. Your other career
            details will connect here in later phases.
          </p>
        </div>
        <span className="heading-icon">◎</span>
      </div>

      <form className="form-card profile-form" onSubmit={submit}>
        <div className="form-card-head">
          <div className="form-step-icon">01</div>
          <div>
            <h2>Personal and experience basics</h2>
            <p>These are the details saved during onboarding.</p>
          </div>
        </div>

        <div className="form-grid">
          <label className="field" htmlFor="profilePreferredName">
            <span>Preferred name</span>
            <input
              id="profilePreferredName"
              value={form.preferredName}
              maxLength="80"
              onChange={(event) => update('preferredName', event.target.value)}
              placeholder="Your preferred name"
            />
          </label>

          <label className="field" htmlFor="profileLocation">
            <span>
              Location <small>(optional)</small>
            </span>
            <input
              id="profileLocation"
              value={form.location}
              maxLength="120"
              onChange={(event) => update('location', event.target.value)}
              placeholder="City or region"
            />
          </label>

          <SelectField
            id="profileStatus"
            label="Current situation"
            value={form.currentStatus}
            options={CURRENT_STATUS_OPTIONS}
            onChange={(value) => update('currentStatus', value)}
          />

          <SelectField
            id="profileEducation"
            label="Highest education level"
            value={form.highestEducation}
            options={EDUCATION_OPTIONS}
            onChange={(value) => update('highestEducation', value)}
          />

          <div className="form-grid-full">
            <SelectField
              id="profileExperience"
              label="Professional experience"
              value={form.experienceLevel}
              options={EXPERIENCE_OPTIONS}
              onChange={(value) => update('experienceLevel', value)}
            />
          </div>

          <div className="form-grid-full">
            <label className="field" htmlFor="profileTargetInterest">
              <span>Broad career interest</span>
              <textarea
                id="profileTargetInterest"
                rows="2"
                maxLength="300"
                value={form.targetInterest}
                onChange={(event) => update('targetInterest', event.target.value)}
                placeholder="A direction you are exploring"
              />
            </label>
          </div>

          <label className="field" htmlFor="profileWeeklyHours">
            <span>Weekly career-development availability (hours)</span>
            <input
              id="profileWeeklyHours"
              type="number"
              min="0"
              max="168"
              step="1"
              value={form.weeklyAvailabilityHours}
              onChange={(event) => update('weeklyAvailabilityHours', event.target.value)}
              placeholder="Optional hours per week"
            />
          </label>

          <label className="field" htmlFor="profilePreferences">
            <span>Career preferences</span>
            <textarea
              id="profilePreferences"
              rows="2"
              maxLength="500"
              value={form.careerPreferences}
              onChange={(event) => update('careerPreferences', event.target.value)}
              placeholder="Preferences to consider"
            />
          </label>

          <div className="form-grid-full">
            <label className="field" htmlFor="profileConstraints">
              <span>Practical constraints</span>
              <textarea
                id="profileConstraints"
                rows="2"
                maxLength="1000"
                value={form.constraints}
                onChange={(event) => update('constraints', event.target.value)}
                placeholder="Schedule, location, or equipment access (avoid sensitive personal details)"
              />
            </label>
          </div>

          <div className="form-grid-full">
            <label className="consent-row profile-consent" htmlFor="profilePersonalizationConsent">
              <input
                id="profilePersonalizationConsent"
                type="checkbox"
                checked={form.profilePersonalizationConsent}
                onChange={(event) => update('profilePersonalizationConsent', event.target.checked)}
              />
              <span>
                <strong>Profile personalization (optional)</strong>
                <small>
                  Allow career context to be used for future personalized
                  recommendations. You can change this preference here. Privacy
                  notice wording requires review before production.
                </small>
              </span>
            </label>
          </div>
        </div>

        <InlineError message={error} />

        {notice ? (
          <div className="inline-success" role="status">
            ✓ {notice}
          </div>
        ) : null}

        <div className="form-actions">
          <span className="save-note">Changes are saved to your account.</span>
          <button className="button button-primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </form>

      <div className="privacy-card">
        <div className="privacy-card-icon">⌑</div>
        <div>
          <h3>Profile privacy</h3>
          <p>
            Your profile is accessible only to your authenticated account in
            this phase. Sharing, mentorship, and employer access are designed
            in later phases and are not enabled here.
          </p>
        </div>
      </div>
    </div>
  );
}
