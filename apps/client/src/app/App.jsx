import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { ConfigurationPage, PageLoader } from '../components/Feedback.jsx';
import AuthPage from '../features/auth/AuthPage.jsx';
import DashboardPage from '../features/dashboard/DashboardPage.jsx';
import OnboardingPage from '../features/onboarding/OnboardingPage.jsx';
import ProfilePage from '../features/profile/ProfilePage.jsx';
import IndustryLibraryPage from '../features/industries/IndustryLibraryPage.jsx';
import RoleMarketplacePage from '../features/career-directory/RoleMarketplacePage.jsx';
import CareerSelectionPage from '../features/career-selection/CareerSelectionPage.jsx';
import PublicLayout from '../layouts/PublicLayout.jsx';
import WorkspaceLayout from '../layouts/WorkspaceLayout.jsx';
import LandingPage from '../pages/LandingPage.jsx';

function RequireSession({ children }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <PageLoader label="Checking your session" />;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
}

export default function App({ configurationError }) {
  if (configurationError) {
    return <ConfigurationPage message={configurationError} />;
  }

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        {/* Clerk's path-based flows use nested URLs such as /sign-in/factor-one. */}
        <Route path="/sign-in/*" element={<AuthPage mode="sign-in" />} />
        <Route path="/sign-up/*" element={<AuthPage mode="sign-up" />} />
      </Route>

      {/* Onboarding and the Step-2-based career selection use the approved full-page form composition. */}
      <Route
        path="/onboarding"
        element={
          <RequireSession>
            <OnboardingPage />
          </RequireSession>
        }
      />

      <Route
        path="/career-selection"
        element={
          <RequireSession>
            <CareerSelectionPage />
          </RequireSession>
        }
      />

      <Route
        element={
          <RequireSession>
            <WorkspaceLayout />
          </RequireSession>
        }
      >
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/industries" element={<IndustryLibraryPage />} />
        <Route path="/roles" element={<RoleMarketplacePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
