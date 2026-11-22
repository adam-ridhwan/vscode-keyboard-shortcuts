import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { AppErrorBoundary } from '@/AppErrorBoundary';
import NoInternetPopup from '@/components/no-internet-popup/NoInternetPopup';
import { GA_ID } from '@/config';
import ModalRoot from '@/modals/ModalRoot';
import ProtectedRoutes from '@/routes/protected-routes/ProtectedRoutes';
import PublicRoutes from '@/routes/public-routes/PublicRoutes';

const SnackBar = lazy(() => import('@/components/SnackbarMsg'));
const BillingNotification = lazy(
  () => import('@/components/billing-notification/BillingNotification')
);
const FreeTrialBanner = lazy(
  () => import('@/components/free-trial-banner/FreeTrialBanner')
);
const TutorialPopoverContainer = lazy(
  () => import('@/components/TutorialPopover/TutorialPopoverContainer')
);
const NewFeaturesPopoverContainer = lazy(
  () => import('@/components/new-features-popover/NewFeaturesPopoverContainer')
);
const NotFound404Page = lazy(() => import('./routes/404'));

import('react-ga').then((ReactGA) => ReactGA.default.initialize(GA_ID));

export default function App() {
  return (
    <AppErrorBoundary>
      <Suspense>
        <SnackBar />
        <ModalRoot />
        <BillingNotification />
        <FreeTrialBanner />
        <NoInternetPopup />
        <TutorialPopoverContainer />
        <NewFeaturesPopoverContainer />
        <Routes>
          {ProtectedRoutes}
          {PublicRoutes}

          <Route path='*' element={<NotFound404Page />} />
        </Routes>
      </Suspense>
    </AppErrorBoundary>
  );
}
