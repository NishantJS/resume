import { useLocation } from "react-router-dom"
import Router from "./components/router/Routes"
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from "@vercel/analytics/react"

// Only inject Vercel telemetry when actually running on Vercel to avoid
// 404 console errors in local / non-Vercel environments (hurts Lighthouse
// Best Practices score due to "browser errors logged to console")
const onVercel = typeof window !== 'undefined' &&
  !['localhost', '127.0.0.1'].includes(window.location.hostname);

/** An app's privacy policy is the page a Play reviewer opens to check
    the app collects nothing. Loading a third-party analytics script over
    that claim is a bad look at best and a contradiction at worst, so the
    policy routes are the one place on the site that measures nobody. */
const isPolicy = (path: string) => /^\/apps\/[^/]+\/privacy\/?$/.test(path);

const App = () => {
  const { pathname } = useLocation();
  const measure = onVercel && !isPolicy(pathname);

  return (
    <>
      {measure && <SpeedInsights />}
      {measure && <Analytics />}
      <Router />
    </>
  );
};

export default App;
