import { useLayoutEffect, useState } from 'react'
import { motion } from 'motion/react'
import { HashRouter, Navigate, Route, Routes, useLocation, useNavigationType } from 'react-router-dom'
import { TabBar } from './shell/chrome'
import { DemoNavigator } from './shell/DemoNavigator'
import { NavTracker } from './shell/nav'
import { ToastProvider } from './shell/overlay'
import { PhoneFrame } from './shell/PhoneFrame'
import { SettingsProvider } from './shell/Screen'
import { StoreProvider } from './state/store'
import { Assistant } from './screens/Assistant'
import { CaseReview } from './screens/CaseReview'
import { GamesHub } from './screens/GamesHub'
import { HelpRelative } from './screens/HelpRelative'
import { History } from './screens/History'
import { RiskProfile } from './screens/RiskProfile'
import { SecurityCenter } from './screens/SecurityCenter'
import { TrustCircle } from './screens/TrustCircle'
import { BelieveOrNot } from './screens/games/BelieveOrNot'
import { CallRecord } from './screens/games/CallRecord'
import { DuoCase } from './screens/games/DuoCase'
import { FraudPatrol } from './screens/games/FraudPatrol'
import { OnCall } from './screens/games/OnCall'
import { WouldYouBelieve } from './screens/games/WouldYouBelieve'

/** Экраны в фокусе (чат, игры) показываются без таббара. */
const hideTabBar = (path: string) => path.startsWith('/assistant') || path.startsWith('/games/') || path.startsWith('/quiz')

/** Сколько длится въезд экрана; пока он идёт, тапы по новому экрану не проходят. */
const ENTER_MS = 220

function AnimatedRoutes() {
  const location = useLocation()
  const type = useNavigationType()
  // Тап «насквозь»: второй тап двойного нажатия иначе попадал бы по кнопке уже нового экрана.
  const [settling, setSettling] = useState(true)
  useLayoutEffect(() => {
    setSettling(true)
    const t = window.setTimeout(() => setSettling(false), ENTER_MS)
    return () => window.clearTimeout(t)
  }, [location.pathname])

  // POP — вернулись (экран приезжает слева), PUSH — вперёд (справа), REPLACE — без сдвига.
  const from = type === 'POP' ? -24 : type === 'PUSH' ? 24 : 0

  return (
    <>
      {/* Только анимация входа: прошлый экран размонтируется сразу и не копится в фоне. */}
      <motion.div
        key={location.pathname}
        className="absolute inset-0"
        style={{ pointerEvents: settling ? 'none' : 'auto' }}
        initial={{ opacity: 0, x: from }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: ENTER_MS / 1000, ease: 'easeOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={<SecurityCenter />} />
          <Route path="/risk" element={<RiskProfile />} />
          <Route path="/trust" element={<TrustCircle />} />
          <Route path="/trust/:personId" element={<HelpRelative />} />
          <Route path="/case/:caseId" element={<CaseReview />} />
          <Route path="/history" element={<History />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/games" element={<GamesHub />} />
          <Route path="/games/patrol" element={<FraudPatrol />} />
          <Route path="/games/on-call" element={<OnCall />} />
          <Route path="/games/duo" element={<DuoCase />} />
          <Route path="/games/believe" element={<BelieveOrNot />} />
          <Route path="/games/record" element={<CallRecord />} />
          <Route path="/quiz" element={<WouldYouBelieve />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
      {!hideTabBar(location.pathname) && <TabBar />}
    </>
  )
}

export default function App() {
  return (
    <HashRouter>
      <NavTracker />
      <StoreProvider>
        <ToastProvider>
          <SettingsProvider>
            <PhoneFrame side={<DemoNavigator />}>
              <AnimatedRoutes />
            </PhoneFrame>
          </SettingsProvider>
        </ToastProvider>
      </StoreProvider>
    </HashRouter>
  )
}
