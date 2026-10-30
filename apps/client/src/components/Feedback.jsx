import { Link } from 'react-router-dom';

export function PageLoader({ label = 'Loading' }) {
  return (
    <div className="full-page-state" role="status">
      <span className="spinner" />
      <p>{label}…</p>
    </div>
  );
}

export function InlineError({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="inline-error" role="alert">
      <span>{message}</span>
      {onRetry ? (
        <button className="text-button" type="button" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function EmptyPanel({ eyebrow, title, description, actionLabel, actionTo }) {
  return (
    <section className="empty-panel">
      <div className="empty-symbol">✦</div>
      {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
      <h2>{title}</h2>
      <p>{description}</p>
      {actionLabel && actionTo ? (
        <Link className="button button-primary" to={actionTo}>
          {actionLabel} <span aria-hidden="true">→</span>
        </Link>
      ) : null}
    </section>
  );
}

export function ConfigurationPage({ message }) {
  return (
    <main className="config-page">
      <div className="config-mark">tb</div>
      <div className="eyebrow">SETUP REQUIRED</div>
      <h1>Connect your TalentBridge environment</h1>
      <p>
        The app will not fall back to demo accounts or fake data. Configure the
        required services to continue.
      </p>
      <pre>{message}</pre>
      <ol>
        <li>Copy <code>.env.example</code> to <code>.env</code>.</li>
        <li>Add your Clerk publishable key and secret key.</li>
        <li>Configure MongoDB, install dependencies, and restart the app.</li>
      </ol>
      <p>After adding the keys and restarting the app, reload the page to continue.</p>
    </main>
  );
}
