// import Preloader from "./components/router/Loader"
import Router from "./components/router/Routes"
import { SpeedInsights } from '@vercel/speed-insights/react';

const App = () => {
  return (
    // <Preloader>
    <>
      <SpeedInsights />
      <Router />
    </>
  )

}

export default App