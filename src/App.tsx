import Router from "./components/router/Routes"
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from "@vercel/analytics/react"

// Only inject Vercel telemetry when actually running on Vercel to avoid
// 404 console errors in local / non-Vercel environments (hurts Lighthouse
// Best Practices score due to "browser errors logged to console")
const onVercel = typeof window !== 'undefined' &&
  !['localhost', '127.0.0.1'].includes(window.location.hostname);

const App = () => (
  <>
    {onVercel && <SpeedInsights />}
    {onVercel && <Analytics />}
    <Router />
  </>
);

export default App;
