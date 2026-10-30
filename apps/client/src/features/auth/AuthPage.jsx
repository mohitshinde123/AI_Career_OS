import { SignIn, SignUp } from '@clerk/react';
import { Link } from 'react-router-dom';

export default function AuthPage({ mode }) {
  const isSignIn = mode === 'sign-in';

  return (
    <main className="auth-page">
      <div className="auth-story">
        <Link className="brand" to="/">
          <img className="brand-mark" src="/assets/talentbridge-mark.png" alt="" />
          <span>TalentBridge</span>
        </Link>

        <div className="auth-story-content">
          <div className="eyebrow eyebrow-light">YOUR CAREER. CONNECTED.</div>
          <h1>A clearer path from where you are to where you want to be.</h1>
          <p>
            Build a career journey around your goals, evidence, progress, and
            next steps—not a collection of disconnected tools.
          </p>
          <div className="auth-proofline">
            <span className="proof-spark">✦</span>
            <span>A career operating system designed around your progress.</span>
          </div>
        </div>

        <span className="auth-story-footer">
          One platform. Your complete career journey.
        </span>
      </div>

      <div className="auth-form-side">
        <Link className="back-home" to="/">
          ← Back to home
        </Link>

        <div className="auth-form-wrap">
          <div className="auth-heading">
            <div className="eyebrow">WELCOME TO TALENTBRIDGE</div>
            <h2>{isSignIn ? 'Welcome back' : 'Start your journey'}</h2>
            <p>
              {isSignIn
                ? 'Sign in to continue building your career foundation.'
                : 'Create your account to start your connected career journey.'}
            </p>
          </div>

          <div className="clerk-form-wrap">
            {isSignIn ? (
              <SignIn
                routing="path"
                path="/sign-in"
                signUpUrl="/sign-up"
                fallbackRedirectUrl="/dashboard"
              />
            ) : (
              <SignUp
                routing="path"
                path="/sign-up"
                signInUrl="/sign-in"
                fallbackRedirectUrl="/onboarding"
              />
            )}
          </div>

          <p className="auth-smallprint">
            Your account is securely managed by Clerk. TalentBridge does not
            store your password.
          </p>
        </div>
      </div>
    </main>
  );
}
