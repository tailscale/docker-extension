import { useCallback, useEffect, useState } from "react"
import { ReactComponent as TailscaleLogo } from "src/assets/tailscale-logo.svg"
import Button from "src/components/button"
import Link from "src/components/link"
import useInterval from "src/hooks/interval"
import useTailscale, { State, shallow } from "src/tailscale"
import { openBrowser } from "src/utils"

const selector = (state: State) => ({
  hostname: state.hostname,
  backendState: state.backendState,
  loginInfo: state.loginInfo,
  fetchLoginInfo: state.fetchLoginInfo,
  fetchStatus: state.fetchStatus,
})

/**
 * OnboardingView is shown when users first install the Tailscale extension.
 * It explains Tailscale and asks them to sign in or create an account.
 */
export default function OnboardingView() {
  const { backendState, loginInfo, fetchLoginInfo, fetchStatus } = useTailscale(
    selector,
    shallow,
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (loginInfo === undefined) {
      fetchLoginInfo()
    }
  }, [fetchLoginInfo, loginInfo])
  useInterval(fetchStatus, 750)

  const handleLogInClick = useCallback(async () => {
    setLoading(true)
    if (!loginInfo) {
      return
    }
    await openBrowser(loginInfo.authUrl)
    setLoading(false)
  }, [loginInfo])

  const handleLogInQRClick = useCallback(() => {
    if (!loginInfo) {
      return
    }
    // TODO: Show QR code & URL dialog
  }, [loginInfo])

  if (backendState === "NeedsMachineAuth") {
    // TODO: refine the language for this state
    return (
      <div>
        <h4>This device needs to be approved by a Tailscale administrator.</h4>
        <p>
          If you are an admin of your tailnet, you can approve this device{" "}
          <Link href="https://login.tailscale.com/admin">
            from the admin console
          </Link>
          . Otherwise, ask an administrator to approve it.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col items-center py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <TailscaleLogo />
            <h1 className="text-3xl font-medium">Tailscale</h1>
          </div>
          <h2 className="text-base mb-8">
            Share exposed container ports onto your private Tailscale network.
            Tailscale makes it easy to collaborate on services with teammates,
            SSH into containers, and more.
          </h2>
        </div>
        <div className="flex space-x-3 mb-6">
          <Button
            variant="primary"
            onClick={handleLogInClick}
            disabled={loading}
            size="lg"
          >
            Log in with browser
          </Button>
          <Button onClick={handleLogInQRClick} disabled={loading} size="lg">
            Log in with another device
          </Button>
        </div>
        <p className="text-gray-300">
          Logging in will expose containers’ public ports to your private
          Tailscale network.
        </p>
      </div>
      <div className="fixed bottom-8 left-12 right-12 flex px-4 py-4 bg-docker-gray-700 shadow-2xl rounded-lg">
        <div>
          <h3 className="font-semibold">New to Tailscale?</h3>
          <p>
            Learn about how Tailscale works and how it works with Docker in our
            docs.
          </p>
        </div>
        <div className="ml-auto">
          <Button
            variant="primary"
            onClick={() => openBrowser("https://tailscale.com/kb/")}
          >
            Read docs
          </Button>
        </div>
      </div>
    </div>
  )
}
