import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth, useUser } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import {
  CURRENT_STATUS_OPTIONS,
  EDUCATION_OPTIONS,
  EXPERIENCE_OPTIONS,
  CAREER_GOAL_OPTIONS,
  WORK_PREFERENCE_OPTIONS,
} from "@talentbridge/contracts";
import { InlineError, PageLoader } from "../../components/Feedback.jsx";
import { apiRequest } from "../../lib/api.js";

const GOAL_DETAILS = {
  senior_growth: {
    description: "Level up your skills, scope, and impact.",
    icon: "↗",
  },
  next_opportunity: {
    description: "Discover a role that better fits your ambitions.",
    icon: "▱",
  },
  career_direction: {
    description: "Find where your strengths could take you next.",
    icon: "⇄",
  },
};
const MAIN_GOALS = CAREER_GOAL_OPTIONS.map(([value, title]) => ({
  value,
  title,
  ...GOAL_DETAILS[value],
}));
const WORK_OPTIONS = WORK_PREFERENCE_OPTIONS.map(([value]) => value);
const STEP_META = [
  { title: "Your starting point", subtitle: "Experience & background" },
  { title: "Your direction", subtitle: "Goals & preferences" },
  { title: "Your strengths", subtitle: "Skills & resume" },
  { title: "Your personal plan", subtitle: "Meet your career workspace" },
];

const initialForm = {
  preferredName: "",
  currentStatus: "",
  highestEducation: "",
  experienceLevel: "",
  location: "",
  mainGoal: "",
  targetRole: "",
  targetTimeline: "",
  workPreferences: [],
  strengths: [],
  strengthsNotes: "",
  targetInterest: "",
  constraints: "",
  weeklyAvailabilityHours: "",
  careerPreferences: "",
  profilePersonalizationConsent: false,
};

function editableProfile(profile = {}) {
  return {
    ...initialForm,
    preferredName: profile.preferredName || "",
    currentStatus: profile.currentStatus || "",
    highestEducation: profile.highestEducation || "",
    experienceLevel: profile.experienceLevel || "",
    location: profile.location || "",
    mainGoal: profile.mainGoal || "",
    targetRole: profile.targetRole || "",
    targetTimeline: profile.targetTimeline || "",
    workPreferences: Array.isArray(profile.workPreferences)
      ? profile.workPreferences
      : [],
    strengths: Array.isArray(profile.strengths) ? profile.strengths : [],
    strengthsNotes: profile.strengthsNotes || "",
    targetInterest: profile.targetInterest || "",
    constraints: profile.constraints || "",
    weeklyAvailabilityHours: profile.weeklyAvailabilityHours ?? "",
    careerPreferences: profile.careerPreferences || "",
    profilePersonalizationConsent: Boolean(
      profile.profilePersonalizationConsent,
    ),
  };
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
  required = false,
}) {
  return (
    <label className="field tb-onboard-field" htmlFor={id}>
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

function StepHeading({ eyebrow, title, description }) {
  return (
    <div className="tb-onboard-heading">
      <div className="tb-onboard-eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}

function FormStep({ number, title, description, children }) {
  return (
    <section className="tb-onboard-section">
      <div className="tb-onboard-section-head">
        <span className="tb-onboard-section-number">{number}</span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function SummaryRow({ label, value, onEdit }) {
  return (
    <div className="tb-onboard-summary-row">
      <div>
        <span>{label}</span>
        <strong>{value || "Not provided"}</strong>
      </div>
      <button type="button" className="tb-onboard-edit" onClick={onEdit}>
        Edit
      </button>
    </div>
  );
}

function formatOption(value, options) {
  return options.find(([key]) => key === value)?.[1] || value || "";
}

export default function OnboardingPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    ...initialForm,
    preferredName: user?.firstName || "",
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [skillInput, setSkillInput] = useState("");

  const load = useCallback(
    async (signal) => {
      try {
        const token = await getToken();
        const result = await apiRequest("/me", { token, signal });
        if (result.onboardingCompleted) {
          navigate("/dashboard", { replace: true });
          return;
        }
        if (result.profile) {
          setForm(editableProfile(result.profile));
          const savedStep = Number(result.profile.onboardingStep || 1);
          setStep(Math.min(4, Math.max(1, savedStep)));
        }
      } catch (requestError) {
        if (requestError.name !== "AbortError") setError(requestError.message);
      } finally {
        setLoading(false);
      }
    },
    [getToken, navigate],
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const displayName = useMemo(
    () => form.preferredName.trim() || user?.firstName || "there",
    [form.preferredName, user?.firstName],
  );

  function update(key, value) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function toggleWorkPreference(value) {
    setForm((previous) => {
      const selected = previous.workPreferences.includes(value);
      const next = selected
        ? previous.workPreferences.filter((item) => item !== value)
        : [
            ...previous.workPreferences.filter(
              (item) =>
                item !== "Open to anything" && value !== "Open to anything",
            ),
            value,
          ];
      return { ...previous, workPreferences: next };
    });
  }

  function addSkill(event) {
    event?.preventDefault();
    const value = skillInput.trim().replace(/,$/, "");
    if (!value) return;
    if (value.length > 60) {
      setError("Each strength must be 60 characters or fewer.");
      return;
    }
    if (
      form.strengths.some((item) => item.toLowerCase() === value.toLowerCase())
    ) {
      setSkillInput("");
      return;
    }
    if (form.strengths.length >= 30) {
      setError("You can add up to 30 strengths.");
      return;
    }
    update("strengths", [...form.strengths, value]);
    setSkillInput("");
    setError("");
  }

  function removeSkill(value) {
    update(
      "strengths",
      form.strengths.filter((item) => item !== value),
    );
  }

  function validateStep() {
    if (step === 1) {
      if (
        !form.currentStatus ||
        !form.highestEducation ||
        !form.experienceLevel
      ) {
        setError(
          "Complete your current situation, education and experience to continue.",
        );
        return false;
      }
    }
    if (step === 2) {
      if (!form.mainGoal || !form.targetRole.trim()) {
        setError("Choose your main goal and enter a target role to continue.");
        return false;
      }
    }
    setError("");
    return true;
  }

  function buildPayload(nextStep) {
    return {
      ...form,
      weeklyAvailabilityHours:
        form.weeklyAvailabilityHours === ""
          ? undefined
          : Number(form.weeklyAvailabilityHours),
      onboardingStep: nextStep,
    };
  }

  async function persistDraft(nextStep) {
    const token = await getToken();
    await apiRequest("/profile", {
      token,
      method: "PUT",
      body: buildPayload(nextStep),
    });
  }

  async function continueStep(event) {
    event.preventDefault();
    if (!validateStep()) return;
    setSaving(true);
    try {
      await persistDraft(Math.min(4, step + 1));
      setStep((current) => Math.min(4, current + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveAndExit() {
    setSaving(true);
    setError("");
    try {
      await persistDraft(step);
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function completeOnboarding(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const token = await getToken();
      const payload = buildPayload(4);
      await apiRequest("/onboarding", { token, method: "PUT", body: payload });
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoader label="Preparing your career workspace" />;

  const currentStep = STEP_META[step - 1];

  return (
    <main className="tb-onboarding-page">
      <aside className="tb-onboarding-aside">
        <a
          className="tb-onboarding-brand"
          href="/"
          aria-label="TalentBridge home"
        >
          <img src="/assets/talentbridge-mark.png" alt="" />
          <span>TalentBridge</span>
        </a>
        <div className="tb-onboarding-aside-copy">
          <div className="tb-onboard-aside-eyebrow">
            YOUR NEXT CHAPTER STARTS HERE
          </div>
          <h2>Let's build a career that feels like you.</h2>
          <p>A few thoughtful details. A much more personal path forward.</p>
        </div>
        <nav className="tb-onboarding-steps" aria-label="Onboarding progress">
          {STEP_META.map((item, index) => {
            const number = index + 1;
            const state =
              number < step
                ? "complete"
                : number === step
                  ? "current"
                  : "upcoming";
            return (
              <button
                key={item.title}
                type="button"
                className={`tb-onboarding-step ${state}`}
                onClick={() => number < step && setStep(number)}
                disabled={number > step}
                aria-current={number === step ? "step" : undefined}
              >
                <span className="tb-onboarding-step-number">
                  {state === "complete" ? "✓" : number}
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.subtitle}</small>
                </span>
              </button>
            );
          })}
        </nav>
        <div className="tb-onboarding-privacy">
          <span aria-hidden="true">♧</span>
          <strong>Your career. Your data. Your choice.</strong>
          <p>
            Your profile stays private until you decide to share it. You're
            always in control.
          </p>
        </div>
      </aside>

      <section className="tb-onboarding-main">
        <div className="tb-onboarding-topline">
          <span>
            Step {step} of 4 ·{" "}
            {step === 1
              ? "About 4 minutes"
              : step === 2
                ? "About 3 minutes"
                : step === 3
                  ? "About 2 minutes"
                  : "Almost there"}
          </span>
          <button type="button" onClick={saveAndExit} disabled={saving}>
            Save &amp; exit
          </button>
        </div>
        <div
          className="tb-onboarding-progress"
          aria-label={`Step ${step} of 4`}
        >
          <span style={{ width: `${step * 25}%` }} />
        </div>

        {step === 1 && (
          <form className="tb-onboarding-content" onSubmit={continueStep}>
            <StepHeading
              eyebrow="YOUR STARTING POINT"
              title={`Let's start with you, ${displayName}`}
              description="A little context helps us understand where you're starting from. You can update these details anytime."
            />
            <div className="tb-onboard-grid">
              <label
                className="field tb-onboard-field"
                htmlFor="onboardPreferredName"
              >
                <span>What should we call you?</span>
                <input
                  id="onboardPreferredName"
                  autoComplete="given-name"
                  maxLength="80"
                  value={form.preferredName}
                  onChange={(event) =>
                    update("preferredName", event.target.value)
                  }
                  placeholder="Your preferred name"
                />
              </label>
              <label
                className="field tb-onboard-field"
                htmlFor="onboardLocation"
              >
                <span>
                  Where are you based? <small>(optional)</small>
                </span>
                <input
                  id="onboardLocation"
                  autoComplete="address-level2"
                  maxLength="120"
                  value={form.location}
                  onChange={(event) => update("location", event.target.value)}
                  placeholder="City or region"
                />
              </label>
              <SelectField
                id="onboardCurrentStatus"
                label="Which best describes you today?"
                value={form.currentStatus}
                options={CURRENT_STATUS_OPTIONS}
                onChange={(value) => update("currentStatus", value)}
                required
              />
              <SelectField
                id="onboardEducation"
                label="What is your highest education level?"
                value={form.highestEducation}
                options={EDUCATION_OPTIONS}
                onChange={(value) => update("highestEducation", value)}
                required
              />
              <div className="tb-onboard-span">
                <SelectField
                  id="onboardExperience"
                  label="How much professional experience do you have?"
                  value={form.experienceLevel}
                  options={EXPERIENCE_OPTIONS}
                  onChange={(value) => update("experienceLevel", value)}
                  required
                />
              </div>
            </div>
            <InlineError message={error} />
            <div className="tb-onboarding-actions">
              <span>* Required fields</span>
              <button
                className="tb-onboarding-primary"
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving…" : "Continue to your direction"}{" "}
                <span>→</span>
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form className="tb-onboarding-content" onSubmit={continueStep}>
            <StepHeading
              eyebrow="YOUR DIRECTION"
              title={`Where would you like to go, ${displayName}?`}
              description="We'll use your goals to tailor your roadmap and opportunities. You can always change these later."
            />
            <div className="tb-onboard-field-label">
              What's your main goal right now?
            </div>
            <div
              className="tb-onboard-goals"
              role="radiogroup"
              aria-label="Main career goal"
            >
              {MAIN_GOALS.map((goal) => (
                <button
                  key={goal.value}
                  type="button"
                  role="radio"
                  aria-checked={form.mainGoal === goal.value}
                  className={`tb-onboard-goal ${form.mainGoal === goal.value ? "selected" : ""}`}
                  onClick={() => update("mainGoal", goal.value)}
                >
                  <span className="tb-onboard-goal-icon">{goal.icon}</span>
                  <span>
                    <strong>{goal.title}</strong>
                    <small>{goal.description}</small>
                  </span>
                  <span className="tb-onboard-radio" />
                </button>
              ))}
            </div>
            <div className="tb-onboard-grid tb-onboard-direction-fields">
              <label className="field tb-onboard-field" htmlFor="targetRole">
                <span>Target role *</span>
                <input
                  id="targetRole"
                  maxLength="120"
                  value={form.targetRole}
                  onChange={(event) => update("targetRole", event.target.value)}
                  placeholder="What role are you aiming for?"
                  required
                />
              </label>
              <label
                className="field tb-onboard-field"
                htmlFor="targetTimeline"
              >
                <span>Your timeline</span>
                <input
                  id="targetTimeline"
                  maxLength="80"
                  value={form.targetTimeline}
                  onChange={(event) =>
                    update("targetTimeline", event.target.value)
                  }
                  placeholder="e.g. In the next 3–6 months"
                />
              </label>
            </div>
            <div className="tb-onboard-work-preferences">
              <div className="tb-onboard-field-label">
                How do you like to work?
              </div>
              <div className="tb-onboard-choice-row">
                {WORK_OPTIONS.map((option) => (
                  <button
                    key={option}
                    className={`tb-onboard-choice ${form.workPreferences.includes(option) ? "selected" : ""}`}
                    type="button"
                    aria-pressed={form.workPreferences.includes(option)}
                    onClick={() => toggleWorkPreference(option)}
                  >
                    {form.workPreferences.includes(option) ? "✓ " : ""}
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <InlineError message={error} />
            <div className="tb-onboarding-actions">
              <button
                className="tb-onboarding-back"
                type="button"
                onClick={() => setStep(1)}
              >
                ← <span>Back</span>
              </button>
              <button
                className="tb-onboarding-primary"
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving…" : "Continue to your strengths"}{" "}
                <span>→</span>
              </button>
            </div>
            <p className="tb-onboarding-bottom-note">
              Your next step is a little closer than it was a minute ago.
            </p>
          </form>
        )}

        {step === 3 && (
          <form className="tb-onboarding-content" onSubmit={continueStep}>
            <StepHeading
              eyebrow="YOUR STRENGTHS"
              title={`What strengths do you bring, ${displayName}?`}
              description="Start with the skills and experience you already have. You can refine and add evidence as your career profile grows."
            />
            <FormStep
              number="01"
              title="Your skills"
              description="Add skills you feel comfortable claiming today. These are self-reported, not yet verified."
            >
              <div className="tb-onboard-skill-entry">
                <input
                  aria-label="Add a skill or strength"
                  value={skillInput}
                  maxLength="60"
                  onChange={(event) => setSkillInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") addSkill(event);
                  }}
                  placeholder="Type a skill and press Enter"
                />
                <button
                  type="button"
                  onClick={() => addSkill()}
                  disabled={!skillInput.trim()}
                >
                  Add skill
                </button>
              </div>
              {form.strengths.length > 0 ? (
                <div
                  className="tb-onboard-skill-list"
                  aria-label="Added skills"
                >
                  {form.strengths.map((skill) => (
                    <span key={skill} className="tb-onboard-skill-chip">
                      {skill}
                      <button
                        type="button"
                        aria-label={`Remove ${skill}`}
                        onClick={() => removeSkill(skill)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="tb-onboard-skill-empty">
                  Your added skills will appear here.
                </div>
              )}
            </FormStep>
            <FormStep
              number="02"
              title="Your experience and strengths"
              description="Add context that helps explain where these skills come from. This is optional."
            >
              <label
                className="field tb-onboard-field"
                htmlFor="strengthsNotes"
              >
                <span>
                  What have you worked on or learned so far?{" "}
                  <small>(optional)</small>
                </span>
                <textarea
                  id="strengthsNotes"
                  rows="4"
                  maxLength="800"
                  value={form.strengthsNotes}
                  onChange={(event) =>
                    update("strengthsNotes", event.target.value)
                  }
                  placeholder="Projects, coursework, independent learning, work experience, or other examples…"
                />
              </label>
            </FormStep>
            <div className="tb-onboard-resume-note">
              <span aria-hidden="true">▤</span>
              <div>
                <strong>Your resume</strong>
                <p>
                  Your resume workspace is part of Phase 4. For now, add the
                  skills and experience you want TalentBridge to know about. No
                  document is uploaded or analyzed in this step.
                </p>
              </div>
            </div>
            <FormStep
              number="03"
              title="A little more context"
              description="Optional details help keep future career guidance grounded in your situation."
            >
              <div className="tb-onboard-grid">
                <label
                  className="field tb-onboard-field"
                  htmlFor="onboardTargetInterest"
                >
                  <span>
                    Other career interests <small>(optional)</small>
                  </span>
                  <textarea
                    id="onboardTargetInterest"
                    rows="3"
                    maxLength="300"
                    value={form.targetInterest}
                    onChange={(event) =>
                      update("targetInterest", event.target.value)
                    }
                    placeholder="Other areas or types of work you're curious about…"
                  />
                </label>
                <label
                  className="field tb-onboard-field"
                  htmlFor="onboardConstraints"
                >
                  <span>
                    Practical constraints <small>(optional)</small>
                  </span>
                  <textarea
                    id="onboardConstraints"
                    rows="3"
                    maxLength="1000"
                    value={form.constraints}
                    onChange={(event) =>
                      update("constraints", event.target.value)
                    }
                    placeholder="Schedule, location, equipment access, or other practical limits. Avoid sensitive personal or health details."
                  />
                </label>
                <label
                  className="field tb-onboard-field"
                  htmlFor="weeklyAvailabilityHours"
                >
                  <span>Hours per week for career development</span>
                  <input
                    id="weeklyAvailabilityHours"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="168"
                    step="1"
                    value={form.weeklyAvailabilityHours}
                    onChange={(event) =>
                      update("weeklyAvailabilityHours", event.target.value)
                    }
                    placeholder="e.g. 8"
                  />
                </label>
                <label
                  className="field tb-onboard-field"
                  htmlFor="careerPreferences"
                >
                  <span>
                    Other preferences <small>(optional)</small>
                  </span>
                  <input
                    id="careerPreferences"
                    maxLength="500"
                    value={form.careerPreferences}
                    onChange={(event) =>
                      update("careerPreferences", event.target.value)
                    }
                    placeholder="Anything else we should consider?"
                  />
                </label>
              </div>
            </FormStep>
            <InlineError message={error} />
            <div className="tb-onboarding-actions">
              <button
                className="tb-onboarding-back"
                type="button"
                onClick={() => setStep(2)}
              >
                ← <span>Back</span>
              </button>
              <button
                className="tb-onboarding-primary"
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving…" : "Continue to your personal plan"}{" "}
                <span>→</span>
              </button>
            </div>
          </form>
        )}

        {step === 4 && (
          <form className="tb-onboarding-content" onSubmit={completeOnboarding}>
            <StepHeading
              eyebrow="YOUR PERSONAL PLAN"
              title={`Your career workspace starts here, ${displayName}.`}
              description="Review the information you've shared. You can update your profile later, and your career direction can evolve with you."
            />
            <div className="tb-onboard-plan-card">
              <div className="tb-onboard-plan-kicker">YOUR STARTING POINT</div>
              <h2>{displayName}</h2>
              <p>
                {formatOption(form.currentStatus, CURRENT_STATUS_OPTIONS)}
                {form.highestEducation
                  ? ` · ${formatOption(form.highestEducation, EDUCATION_OPTIONS)}`
                  : ""}
                {form.experienceLevel
                  ? ` · ${formatOption(form.experienceLevel, EXPERIENCE_OPTIONS)}`
                  : ""}
              </p>
              <div className="tb-onboard-plan-target">
                <span>YOUR DIRECTION</span>
                <strong>{form.targetRole || "No target role added"}</strong>
                <small>
                  {MAIN_GOALS.find((goal) => goal.value === form.mainGoal)
                    ?.title || "No main goal selected"}
                  {form.targetTimeline ? ` · ${form.targetTimeline}` : ""}
                </small>
              </div>
              <div className="tb-onboard-plan-skills">
                <span>YOUR STRENGTHS</span>
                {form.strengths.length ? (
                  form.strengths.map((skill) => <i key={skill}>{skill}</i>)
                ) : (
                  <small>No skills added yet</small>
                )}
              </div>
            </div>
            <div className="tb-onboard-review-list">
              <SummaryRow
                label="Starting point"
                value={`${formatOption(form.currentStatus, CURRENT_STATUS_OPTIONS)} · ${formatOption(form.experienceLevel, EXPERIENCE_OPTIONS)}`}
                onEdit={() => setStep(1)}
              />
              <SummaryRow
                label="Career direction"
                value={
                  MAIN_GOALS.find((goal) => goal.value === form.mainGoal)?.title
                }
                onEdit={() => setStep(2)}
              />
              <SummaryRow
                label="Work preferences"
                value={form.workPreferences.join(", ")}
                onEdit={() => setStep(2)}
              />
              <SummaryRow
                label="Strengths"
                value={form.strengths.join(", ")}
                onEdit={() => setStep(3)}
              />
            </div>
            <label
              className="tb-onboard-consent"
              htmlFor="profilePersonalizationConsent"
            >
              <input
                id="profilePersonalizationConsent"
                type="checkbox"
                checked={form.profilePersonalizationConsent}
                onChange={(event) =>
                  update("profilePersonalizationConsent", event.target.checked)
                }
              />
              <span>
                <strong>
                  Personalize my career experience <small>(optional)</small>
                </strong>
                <small>
                  Allow TalentBridge to use the career context I provided to
                  personalize future recommendations. You can change this choice
                  later.
                </small>
              </span>
            </label>
            <div className="tb-onboard-privacy-note">
              <span>♧</span>
              <p>
                Your information remains private in your personal workspace.
                Nothing is shared with employers unless you choose to share it.
              </p>
            </div>
            <InlineError message={error} />
            <div className="tb-onboarding-actions">
              <button
                className="tb-onboarding-back"
                type="button"
                onClick={() => setStep(3)}
              >
                ← <span>Back</span>
              </button>
              <button
                className="tb-onboarding-primary"
                type="submit"
                disabled={saving}
              >
                {saving ? "Setting up your workspace…" : "Complete onboarding"}{" "}
                <span>→</span>
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
