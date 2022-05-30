import { Suspense, useEffect } from "react"
import Tooltip from "src/components/tooltip"
import useTailscale, {
  State,
  BackendState,
  shallow,
  subscribeToContainers,
} from "src/tailscale"
import { debounce } from "src/utils"
import useInterval from "src/hooks/interval"
import ContainerView from "src/views/container-view"
import LoadingView from "src/views/loading-view"
import NeedsAuthView from "src/views/needs-auth-view"
import OnboardingView from "src/views/onboarding-view"

export default function App() {
  useRemoveDockerStyles()

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

  useEffect(() => {
    // Fetch containers whenever Docker tells us they change.

    // We debounce the fetch call to avoid requesting too many times when
    // containers start up or shut down. There's usually 3–5 events in quick
    // succession, but we only need to fetch once.
    const fetch = debounce((event) => {
      // console.log(
      //   "fetching because of event",
      //   event.Type,
      //   event.Action,
      //   event.time,
      // )
      fetchContainers()
    }, 600)
    const watcher = subscribeToContainers({
      onEvent: (event) => fetch(event),
      onError: (err) => {
        console.error("Docker error:", err)
      },
    })
    fetchContainers()
    if (typeof watcher === "undefined" || typeof watcher.close !== "function") {
      // Older versions of Docker don't have a close function.
      return
    }
    return () => {
      watcher.close()
    }
  }, [fetchContainers])

  useInterval(fetchStatus, 5000)
  useInterval(fetchHostStatus, 10000)

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

/**
 * useRemoveDockerStyles removes the `dockerDesktopTheme` classname that gets
 * injected by Docker Desktop. These styles seem like they may change regularly,
 * so opting out lets us control our UI better, and only make changes when
 * necessary.
 */
function useRemoveDockerStyles() {
  useEffect(() => {
    const dockerThemeClass = "dockerDesktopTheme"
    const $body = document.body;
    if ($body && $body.classList.contains(dockerThemeClass)) {
      $body.classList.remove(dockerThemeClass)
    }
  }, [])
}
