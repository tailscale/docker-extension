import { Suspense, useEffect } from "react"
import Tooltip from "src/components/tooltip"
import useTailscale, { State, BackendState, shallow } from "src/tailscale"
import useInterval from "src/hooks/interval"
import ContainerView from "src/views/container-view"
import LoadingView from "src/views/loading-view"
import NeedsAuthView from "src/views/needs-auth-view"
import OnboardingView from "src/views/onboarding-view"

export default function App() {
  return (
    <Tooltip.Provider>
      <div className="text-sm h-full">
        <Suspense fallback={<LoadingView />}>
          <Router />
        </Suspense>
      </div>
    </Tooltip.Provider>
  )
}

const selector = (state: State) => ({
  initialized: state.initialized,
  backendState: state.backendState,
  loginUser: state.loginUser,
  fetchHostname: state.fetchHostname,
  fetchStatus: state.fetchStatus,
  fetchHostStatus: state.fetchHostStatus,
})

function Router() {
  const {
    initialized,
    backendState,
    loginUser,
    fetchHostname,
    fetchStatus,
    fetchHostStatus,
  } = useTailscale(selector, shallow)

  useEffect(() => {
    fetchHostname()
  }, [fetchHostname])

  useInterval(fetchStatus, 5000)
  useInterval(fetchHostStatus, 10000)

  if (!initialized) {
    return <LoadingView />
  }
  if (backendState === "NeedsMachineAuth") {
    return <NeedsAuthView />
  }
  if (showOnboarding(backendState, loginUser)) {
    return <OnboardingView />
  }
  return <ContainerView />
}

const showOnboarding = (state: BackendState, user?: object) => {
  if (state === "NoState" || state === "NeedsLogin") {
    return true
  }
  if (state === "Stopped" && user === undefined) {
    return true
  }
  return false
}
