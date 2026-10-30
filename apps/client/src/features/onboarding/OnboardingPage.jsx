import { useCallback, useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/react';
import { useNavigate } from 'react-router-dom';
import {
  CURRENT_STATUS_OPTIONS,
  EDUCATION_OPTIONS,
  EXPERIENCE_OPTIONS,
} from '@talentbridge/contracts';
import { InlineError, PageLoader } from '../../components/Feedback.jsx';
import { apiRequest } from '../../lib/api.js';

const initialForm = {
  preferredName: '',
  currentStatus: '',
  highestEducation: '',
  experienceLevel: '',
  location: '',
  targetInterest: '',
  constraints: '',
  weeklyAvailabilityHours: '',
  careerPreferences: '',
  profilePersonalizationConsent: false,
};

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

function SelectField({ id, label, value, options, onChange, required = true }) {
  return (
    <label className="field" htmlFor={id}>
      <span>
        {label}
        {required ? <i> *</i> : null}
      </span>
      <select
        id={id}
        value={value}
        required={required}
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

export default function OnboardingPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    ...initialForm,
    preferredName: user?.firstName || '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (signal) => {
    try {
      const token = await getToken();
      const result = await apiRequest('/me', { token, signal });

      if (result.onboardingCompleted) {
        navigate('/dashboard', { replace: true });
        return;
      }

      if (result.profile) {
        setForm(editableProfile(result.profile));
      } else {
        setForm((current) => ({
          ...current,
          preferredName: user?.firstName || '',
        }));
      }
    } catch (requestError) {
      if (requestError.name !== 'AbortError') {
        setError(requestError.message);
      }
    } finally {
      setLoading(false);
    }
  }, [getToken, navigate, user?.firstName]);

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

    try {
      const token = await getToken();
      const payload = {
        ...form,
        weeklyAvailabilityHours:
          form.weeklyAvailabilityHours === ''
            ? undefined
            : Number(form.weeklyAvailabilityHours),
      };

      await apiRequest('/onboarding', {
        token,
        method: 'PUT',
        body: payload,
      });
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <PageLoader label="Preparing your profile" />;
  }

  return (
    <div className="onboarding-wrap">
      <div className="onboarding-progress">
        <span className="progress-active" />
      </div>

      <div className="onboarding-head">
        <div className="eyebrow">YOUR FOUNDATION · PROFILE SETUP</div>
        <h1>
          Let's start with <span>you.</span>
        </h1>
        <p>
          Share the context that will help personalize your career journey. You
          can update these details later in your profile.
        </p>
      </div>

      <form className="form-card onboarding-form" onSubmit={submit}>
        <div className="form-card-head">
          <div className="form-step-icon">01</div>
          <div>
            <h2>Tell us about yourself</h2>
            <p>
              Share your current situation, broad interests, practical
              constraints, and preferences. Formal industry and role selection
              comes next.
            </p>
          </div>
        </div>

        <div className="form-grid">
          <label className="field" htmlFor="preferredName">
            <span>What should we call you?</span>
            <input
              id="preferredName"
              name="preferredName"
              autoComplete="given-name"
              maxLength="80"
              value={form.preferredName}
              onChange={(event) => update('preferredName', event.target.value)}
              placeholder="Your preferred name"
            />
          </label>

          <label className="field" htmlFor="location">
            <span>
              Where are you based? <small>(optional)</small>
            </span>
            <input
              id="location"
              name="location"
              autoComplete="address-level2"
              maxLength="120"
              value={form.location}
              onChange={(event) => update('location', event.target.value)}
              placeholder="City or region"
            />
          </label>

          <SelectField
            id="currentStatus"
            label="Which best describes you today?"
            value={form.currentStatus}
            options={CURRENT_STATUS_OPTIONS}
            onChange={(value) => update('currentStatus', value)}
          />

          <SelectField
            id="highestEducation"
            label="What is your highest education level?"
            value={form.highestEducation}
            options={EDUCATION_OPTIONS}
            onChange={(value) => update('highestEducation', value)}
          />

          <div className="form-grid-full">
            <SelectField
              id="experienceLevel"
              label="How much professional experience do you have?"
              value={form.experienceLevel}
              options={EXPERIENCE_OPTIONS}
              onChange={(value) => update('experienceLevel', value)}
            />
          </div>

          <div className="form-grid-full">
            <label className="field" htmlFor="targetInterest">
              <span>
                What kind of work or career direction interests you?{' '}
                <small>(optional; no role selection yet)</small>
              </span>
              <textarea
                id="targetInterest"
                rows="2"
                maxLength="300"
                value={form.targetInterest}
                onChange={(event) => update('targetInterest', event.target.value)}
                placeholder="Broad interests or a direction you are exploring"
              />
            </label>
          </div>

          <label className="field" htmlFor="weeklyAvailabilityHours">
            <span>
              How many hours per week could you dedicate to career development?{' '}
              <small>(optional)</small>
            </span>
            <input
              id="weeklyAvailabilityHours"
              type="number"
              inputMode="numeric"
              min="0"
              max="168"
              step="1"
              value={form.weeklyAvailabilityHours}
              onChange={(event) => update('weeklyAvailabilityHours', event.target.value)}
              placeholder="Hours per week"
            />
          </label>

          <label className="field" htmlFor="careerPreferences">
            <span>
              Any preferences we should consider? <small>(optional)</small>
            </span>
            <textarea
              id="careerPreferences"
              rows="2"
              maxLength="500"
              value={form.careerPreferences}
              onChange={(event) => update('careerPreferences', event.target.value)}
              placeholder="For example, preferred learning or work setup"
            />
          </label>

          <div className="form-grid-full">
            <label className="field" htmlFor="constraints">
              <span>
                Are there practical constraints we should keep in mind?{' '}
                <small>(optional)</small>
              </span>
              <textarea
                id="constraints"
                rows="2"
                maxLength="1000"
                value={form.constraints}
                onChange={(event) => update('constraints', event.target.value)}
                placeholder="For example, schedule, location, or equipment access. Avoid sensitive personal or health details."
              />
            </label>
          </div>
        </div>

        <label className="consent-row" htmlFor="profilePersonalizationConsent">
          <input
            id="profilePersonalizationConsent"
            type="checkbox"
            checked={form.profilePersonalizationConsent}
            onChange={(event) => update('profilePersonalizationConsent', event.target.checked)}
          />
          <span>
            <strong>Profile personalization (optional)</strong>
            <small>
              I agree that TalentBridge may use the career context I provide to
              personalize future recommendations. I can change this choice later
              in my profile.
            </small>
          </span>
        </label>

        <div className="form-privacy-note">
          <span className="privacy-shield">⌑</span>
          <span>
            Share only what is useful for your career journey. Your broad
            interest is not a formal role selection. The personalization choice
            is saved as a preference; privacy notice wording must be reviewed
            before production launch.
          </span>
        </div>

        <InlineError message={error} />

        <div className="form-actions">
          <span className="required-note">
            <i>*</i> Required fields. Personalization is optional.
          </span>
          <button className="button button-primary" type="submit" disabled={saving}>
            {saving ? 'Saving your profile…' : 'Save and continue'}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </form>
    </div>
  );
}
