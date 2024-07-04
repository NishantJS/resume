// import Preloader from "./components/router/Loader"
import Router from "./components/router/Routes"
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from "@vercel/analytics/react"

const App = () => {
  return (
    // <Preloader>
    <>
      <SpeedInsights />
      <Router />
      <Analytics />
    </>
  )

}

export default App