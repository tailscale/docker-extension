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
  fetchContainers: state.fetchContainers,
})

function Router() {
  const {
    initialized,
    backendState,
    loginUser,
    fetchHostname,
    fetchStatus,
    fetchHostStatus,
    fetchContainers,
  } = useTailscale(selector, shallow)

  const onboarding = showOnboarding(backendState, loginUser)

  useEffect(() => {
    fetchHostname()
  }, [fetchHostname])

  useInterval(fetchStatus, 5000)
  useInterval(fetchHostStatus, 10000)
  // We slowly fetch containers in the onboarding view to make sure we have some
  // preloaded data before users log in.
  useInterval(fetchContainers, onboarding ? 20000 : null)

  if (!initialized) {
    return <LoadingView />
  }
  if (backendState === "NeedsMachineAuth") {
    return <NeedsAuthView />
  }
  if (onboarding) {
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
