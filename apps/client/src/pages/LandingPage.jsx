import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/react';

const valueCards = [
  {
    icon: '◇',
    title: 'Find your direction',
    description: 'Discover roles that fit your strengths, interests, and ambitions.',
  },
  {
    icon: '⌘',
    title: 'Close the right gaps',
    description: 'Turn career goals into practical, personalized learning milestones.',
  },
  {
    icon: '✧',
    title: 'Show your best self',
    description: 'Build an evidence-backed story and tell it with confidence.',
  },
  {
    icon: '▱',
    title: 'Make your next move',
    description: 'Meet opportunities aligned with what makes you, you.',
  },
];

const solutionCards = [
  {
    eyebrow: 'ATS OPTIMIZED',
    title: 'A resume that tells your story',
    visual: 'resume',
    description: 'Build, analyze, and tailor your resume with feedback that goes beyond keywords.',
    action: "Meet your resume's potential →",
  },
  {
    eyebrow: 'ROLE-SPECIFIC PRACTICE',
    title: 'Practice with a purpose',
    visual: 'interview',
    description: 'Role-specific interviews. Actionable feedback. Confidence that comes from preparation.',
    action: 'Find your interview confidence →',
  },
  {
    eyebrow: 'BETTER FIT',
    title: 'Better fit. Less endless searching.',
    visual: 'jobs',
    description: 'Go beyond job titles. Find opportunities that align with your skills and your future.',
    action: 'Find where you belong →',
  },
];

const faqs = [
  {
    question: 'What is a career operating system?',
    answer: 'One connected place to understand your skills, plan your growth, build your story, and find the right opportunities. No more juggling disconnected tools.',
  },
  {
    question: 'Do I need to know my next career move?',
    answer: 'Not at all. Your AI career guide helps you explore options based on your experience, strengths, and interests.',
  },
  {
    question: 'Is my career data private?',
    answer: 'Yes. You control your visibility, and your resume is never shared without your permission.',
  },
  {
    question: 'Can I use TalentBridge while I’m employed?',
    answer: 'Absolutely. Build skills and plan your next chapter privately, at your own pace.',
  },
];

const plans = [
  {
    name: 'Explorer',
    price: '$0',
    description: 'Build your foundation.',
    features: ['Career profile & goal setting', '3 resume analyses per month', 'Personalized job recommendations'],
    action: 'Start for free',
    style: 'light',
  },
  {
    name: 'Career Pro',
    price: '$24',
    description: 'Your complete career advantage.',
    features: ['Unlimited resume intelligence', 'Personal AI career guide', 'Roadmaps & interview coaching'],
    action: 'Explore Career Pro',
    style: 'featured',
  },
  {
    name: 'Teams',
    price: '$149',
    description: 'Find your next exceptional hire.',
    features: ['Skills-first candidate matching', 'Collaborative hiring pipelines', 'Scheduling & hiring analytics'],
    action: 'Talk to sales',
    style: 'light',
  },
];

export default function LandingPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const startPath = isLoaded && isSignedIn ? '/dashboard' : '/sign-up';

  return (
    <main className="figma-landing-page">
      <section className="figma-hero" aria-labelledby="landing-title">
        <div className="figma-hero-copy">
          <div className="figma-eyebrow figma-eyebrow-hero">
            <span aria-hidden="true">✧</span>
            Meet your AI-powered career operating system
            <span aria-hidden="true">→</span>
          </div>
          <h1 id="landing-title">
            Your potential.<br />
            A clearer path.<br />
            An extraordinary<br />
            career.
          </h1>
          <p>
            Turn ambition into your next opportunity. Connect your skills,
            story, and goals in one intelligent workspace built to move you
            forward.
          </p>
          <div className="figma-hero-actions">
            <Link className="figma-button figma-button-primary" to={startPath}>
              Build my career plan <span aria-hidden="true">✧</span>
            </Link>
            <a className="figma-button figma-button-hero-secondary" href="#how-it-works">
              <span aria-hidden="true">▷</span> See how it works
            </a>
          </div>
          <div className="figma-hero-community" aria-label="Community rating shown in approved Figma design">
            <div className="figma-avatar-stack" aria-hidden="true">
              <span>AC</span><span>SM</span><span>JL</span><span>RK</span>
            </div>
            <div>
              <strong>Join 50,000+ ambitious professionals</strong>
              <span className="figma-stars">★★★★★ <small>4.9/5 from our community</small></span>
            </div>
          </div>
        </div>

        <div className="figma-hero-visual" aria-label="Career workspace preview">
          <div className="figma-orbit figma-orbit-one" />
          <div className="figma-orbit figma-orbit-two" />
          <div className="figma-preview-badge">✧ &nbsp; Built around you</div>
          <article className="figma-career-preview">
            <div className="figma-preview-user">
              <span className="figma-preview-avatar">AC</span>
              <div>
                <strong>Alex Chen</strong>
                <span>Product Designer → Senior Product Designer</span>
              </div>
              <span className="figma-preview-check" aria-label="Verified">♧</span>
            </div>
            <div className="figma-preview-score-row">
              <div className="figma-score-ring"><span>82</span><small>Career score</small></div>
              <div className="figma-preview-summary">
                <span className="figma-up-pill">↑ 18 points this month</span>
                <strong>Your next chapter<br />is taking shape.</strong>
                <span>3 high-impact steps to get you there.</span>
              </div>
            </div>
            <div className="figma-preview-progress-heading">
              <strong>Senior Designer roadmap</strong><span>68%</span>
            </div>
            <div className="figma-progress-track"><span /></div>
            <div className="figma-preview-next">
              <span>✧</span>
              <div><strong>Make your experience stand out</strong><small>Add measurable impact to your resume</small></div>
              <span>→</span>
            </div>
          </article>
          <div className="figma-preview-match">
            <span className="figma-match-icon">▱</span>
            <div><strong>A better-fit opportunity, found.</strong><small>Senior Product Designer · 96% match</small></div>
          </div>
        </div>
      </section>

      <section className="figma-trust-strip" aria-label="Companies">
        <div className="figma-trust-caption">HELPING PEOPLE BUILD CAREERS AT COMPANIES THEY LOVE</div>
        <div className="figma-company-logos">
          <span className="logo-stripe">stripe</span>
          <span className="logo-notion">Notion</span>
          <span className="logo-linear">Linear</span>
          <span className="logo-google">Google</span>
          <span className="logo-figma">figma</span>
          <span className="logo-microsoft">Microsoft</span>
        </div>
      </section>

      <section className="figma-value-section" id="platform">
        <div className="figma-section-kicker">ONE WORKSPACE. EVERY NEXT STEP.</div>
        <h2>Less career guesswork. More forward momentum.</h2>
        <p className="figma-section-subtitle">
          Your skills, story, and opportunities—finally connected in one intelligent career workspace.
        </p>
        <div className="figma-value-grid">
          {valueCards.map((card) => (
            <article className="figma-value-card" key={card.title}>
              <span className="figma-line-icon" aria-hidden="true">{card.icon}</span>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="figma-intelligence-section" id="how-it-works">
        <article className="figma-roadmap-preview">
          <div className="figma-roadmap-heading">
            <strong>Your path to Senior Designer</strong>
            <span>12-week plan</span>
          </div>
          <div className="figma-roadmap-item">
            <span className="figma-roadmap-status">✓</span>
            <div><strong>Build your product foundation</strong><small>Product thinking · Research synthesis</small></div>
          </div>
          <div className="figma-roadmap-item">
            <span className="figma-roadmap-status">✓</span>
            <div><strong>Design for complex systems</strong><small>Scalability · Accessibility</small></div>
          </div>
          <div className="figma-roadmap-current">
            <span className="figma-current-label">YOU ARE HERE · WEEK 7</span>
            <h3>Lead with evidence,<br />not assumptions.</h3>
            <p>Create a metrics-driven case study that shows how your design moved the business forward.</p>
            <div className="figma-roadmap-progress-label"><span>Strategic storytelling</span><strong>68%</strong></div>
            <div className="figma-progress-track"><span /></div>
            <a href="#career-intelligence">Continue milestone →</a>
          </div>
          <div className="figma-roadmap-item figma-roadmap-next">
            <span className="figma-roadmap-next-icon">↗</span>
            <div><strong>Become opportunity-ready</strong><small>Portfolio review · Interview confidence</small></div>
          </div>
        </article>
        <div className="figma-intelligence-copy" id="career-intelligence">
          <div className="figma-section-kicker">CAREER INTELLIGENCE, NOT GENERIC ADVICE</div>
          <h2>A path that's yours.<br />Not everyone else's.</h2>
          <p>
            Start with where you are. Set where you want to go. Your AI guide maps the skills,
            experiences, and actions that will actually make a difference.
          </p>
          <ul>
            <li>✓ &nbsp; A living roadmap shaped by your strengths</li>
            <li>✓ &nbsp; Skill gaps backed by real market demand</li>
            <li>✓ &nbsp; Achievable steps with visible progress</li>
          </ul>
          <a href="#tools">Explore career intelligence →</a>
        </div>
      </section>

      <section className="figma-tools-section" id="tools">
        <div className="figma-section-inner">
          <div className="figma-section-kicker">FROM POTENTIAL TO PROOF</div>
          <h2>The tools to turn “someday” into “next.”</h2>
          <div className="figma-solutions-grid">
            {solutionCards.map((card) => (
              <article className="figma-solution-card" key={card.title}>
                <h3>{card.title}</h3>
                <div className={`figma-solution-visual ${card.visual}`}>
                  {card.visual === 'resume' ? (
                    <>
                      <div className="figma-mini-score"><strong>86</strong><span>Career score</span></div>
                      <div className="figma-mini-resume-copy"><strong>ATS optimized.</strong><span>Evidence-led impact.</span></div>
                    </>
                  ) : null}
                  {card.visual === 'interview' ? <div className="figma-waveform" aria-hidden="true">▂▃▅▇▅▃▆█▆▃▅▇▅▂▃▆▇▅▃▅</div> : null}
                  {card.visual === 'jobs' ? (
                    <div className="figma-mini-job">
                      <span>✦ &nbsp; BEST FIT FOR YOU</span>
                      <strong>Senior Product Designer</strong>
                      <small>Linear · Remote</small>
                      <b>96% match</b>
                    </div>
                  ) : null}
                </div>
                <p>{card.description}</p>
                <a href="#pricing">{card.action}</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="figma-employer-section" id="employers">
        <div className="figma-employer-copy">
          <div className="figma-section-kicker">FOR FORWARD-THINKING TEAMS</div>
          <h2>See the potential.<br />Hire the person.</h2>
          <p>
            Build exceptional teams with skills-first matching, structured interviews,
            and a workspace that brings everyone together.
          </p>
          <Link to="/sign-up" className="figma-button figma-button-primary">Explore TalentBridge for teams →</Link>
          <span>Trusted by 1,200+ growing companies</span>
        </div>
        <div className="figma-employer-preview">
          <h3>Your next great hire is closer.</h3>
          {[
            ['AC', 'Alex Chen', 'Senior Product Designer · Verified skills', '96%'],
            ['SP', 'Sofia Patel', 'Senior Product Designer · Verified skills', '93%'],
            ['MJ', 'Marcus Johnson', 'Senior Product Designer · Verified skills', '91%'],
          ].map(([initials, name, description, score]) => (
            <div className="figma-candidate-row" key={initials}>
              <span className="figma-candidate-avatar">{initials}</span>
              <div><strong>{name}</strong><small>{description}</small></div>
              <b>{score}</b>
            </div>
          ))}
        </div>
      </section>

      <section className="figma-outcomes-section" id="community">
        <div className="figma-section-kicker">REAL PROGRESS. REAL PEOPLE.</div>
        <h2>Better careers aren't built alone.</h2>
        <div className="figma-outcome-grid">
          <div><strong>50k+</strong><span>careers moving forward</span></div>
          <div><strong>2.4×</strong><span>more interview invitations</span></div>
          <div><strong>89%</strong><span>feel more career-confident</span></div>
          <div><strong>1,200+</strong><span>companies finding potential</span></div>
        </div>
        <p className="figma-outcome-note">Based on member survey data, January–September 2026. Individual outcomes vary.</p>
        <div className="figma-testimonial-grid">
          <article className="figma-testimonial-card">
            <strong>A clearer direction</strong>
            <p>“For the first time, I could see the gap between where I was and where I wanted to be. TalentBridge made it feel achievable.”</p>
            <span className="figma-stars">★★★★★</span>
            <div className="figma-testimonial-person"><b>SP</b><span><strong>Sofia Patel</strong><small>Product Designer at Notion</small></span></div>
          </article>
          <article className="figma-testimonial-card">
            <strong>A stronger story</strong>
            <p>“My resume finally told the story of my impact. Three weeks later, I was interviewing for roles I thought were out of reach.”</p>
            <span className="figma-stars">★★★★★</span>
            <div className="figma-testimonial-person"><b>MJ</b><span><strong>Marcus Johnson</strong><small>Data Analyst at Stripe</small></span></div>
          </article>
          <article className="figma-testimonial-card">
            <strong>A confident next step</strong>
            <p>“The interview feedback was specific, thoughtful, and genuinely useful. I walked into my final round feeling prepared, not rehearsed.”</p>
            <span className="figma-stars">★★★★★</span>
            <div className="figma-testimonial-person"><b>ER</b><span><strong>Emma Rodriguez</strong><small>Engineering Manager at Linear</small></span></div>
          </article>
        </div>
      </section>

      <section className="figma-pricing-section" id="pricing">
        <div className="figma-section-kicker">PLANS THAT MOVE WITH YOU</div>
        <h2>Start free. Grow on your terms.</h2>
        <p>Invest in what's next with a plan that meets you where you are.</p>
        <div className="figma-pricing-grid">
          {plans.map((plan) => (
            <article className={`figma-plan-card ${plan.style === 'featured' ? 'featured' : ''}`} key={plan.name}>
              <h3>{plan.name}</h3>
              <div className="figma-plan-price">{plan.price}<span> / month</span></div>
              <p>{plan.description}</p>
              <ul>{plan.features.map((feature) => <li key={feature}>✓ &nbsp; {feature}</li>)}</ul>
              <Link className={plan.style === 'featured' ? 'figma-button figma-button-primary' : 'figma-button figma-button-outline'} to={startPath}>
                {plan.action}
              </Link>
            </article>
          ))}
        </div>
        <a className="figma-pricing-compare" href="#faq">Compare all plans and features →</a>
      </section>

      <section className="figma-faq-section" id="faq">
        <h2>A little clarity before you start.</h2>
        <div className="figma-faq-list">
          {faqs.map((faq, index) => (
            <details key={faq.question} open={index === 0}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="figma-final-cta">
        <span aria-hidden="true">✧</span>
        <h2>Your next chapter starts with one step.</h2>
        <p>Bring your ambition. We'll help you build the bridge.</p>
        <Link className="figma-button figma-button-final" to={startPath}>Start building your future →</Link>
        <small>Free to start · No credit card required · Built around you</small>
      </section>
    </main>
  );
}

