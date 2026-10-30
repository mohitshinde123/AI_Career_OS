import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import App from './app/App.jsx';
import './styles/global.css';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const root = createRoot(document.getElementById('root'));

function ClerkRouterProvider() {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/onboarding"
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      <App />
    </ClerkProvider>
  );
}

root.render(
  <React.StrictMode>
    <BrowserRouter>
      {publishableKey ? (
        <ClerkRouterProvider />
      ) : (
        <App
          configurationError={
            'VITE_CLERK_PUBLISHABLE_KEY is missing. Copy .env.example to .env, add your Clerk publishable key, and restart the development server.'
          }
        />
      )}
    </BrowserRouter>
  </React.StrictMode>,
);
