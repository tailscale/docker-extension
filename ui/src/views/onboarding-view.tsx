import { useCallback, useEffect, useState } from "react"
import { ReactComponent as TailscaleLogo } from "src/assets/tailscale-logo.svg"
import Dialog from "src/components/dialog"
import Button from "src/components/button"
import Link from "src/components/link"
import useInterval from "src/hooks/interval"
import useTailscale, { State, shallow } from "src/tailscale"
import { openBrowser } from "src/utils"
import LoadingView from "src/views/loading-view"

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
  const [showDialog, setShowDialog] = useState(false)
  const [pendingButton, setPendingButton] = useState("none")

  const handleLogInClick = useCallback(async () => {
    if (!loginInfo) {
      setPendingButton("browser")
      return
    }
    await openBrowser(loginInfo.authUrl)
  }, [loginInfo])

  const handleLogInQRClick = useCallback(() => {
    if (!loginInfo) {
      setPendingButton("qr")
      return
    }
    setShowDialog(true)
  }, [loginInfo])

  useEffect(() => {
    if (loginInfo === undefined) {
      fetchLoginInfo()
    }
  }, [fetchLoginInfo, loginInfo])

  useEffect(() => {
    if (loginInfo !== undefined && pendingButton !== "none") {
      if (pendingButton === "browser") {
        handleLogInClick()
      } else if (pendingButton === "qr") {
        handleLogInQRClick()
      }
      setPendingButton("none")
    }
  }, [pendingButton, handleLogInClick, handleLogInQRClick, loginInfo])

  useInterval(fetchStatus, 750)

  if (backendState === "NeedsMachineAuth") {
    return <NeedsAuthView />
  }

  return (
    <div>
      <Dialog
        className="max-w-md"
        title="Log in to Tailscale"
        open={showDialog}
        cancel="Done"
        onOpenChange={setShowDialog}
        onConfirm={() => setShowDialog(false)}
      >
        <div className="flex flex-col items-center">
          <div className="rounded bg-white px-4 py-4 inline-flex mt-8 mb-8">
            <img
              src={loginInfo?.qrUrl}
              className="mix-blend-multiply rendering-pixelated"
              width="170"
              height="170"
              alt="QR code"
            />
          </div>
          <p className="text-base text-center mb-4">
            Scan this QR code from another device
            <br />
            to log in from there.
          </p>
        </div>
      </Dialog>
      <div className="flex flex-col items-center py-24 text-center">
        <div className="mx-auto max-w-xl">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <TailscaleLogo />
            <h1 className="text-3xl font-medium">Tailscale</h1>
          </div>
          <h2 className="text-lg mb-12">
            Share exposed container ports onto your private Tailscale network.
            Tailscale makes it easy to collaborate on services with teammates,
            SSH into containers, and more.
          </h2>
        </div>
        <div className="flex space-x-3 mb-6">
          <Button
            variant="primary"
            onClick={handleLogInClick}
            loading={pendingButton === "browser"}
            size="lg"
          >
            Log in with browser
          </Button>
          <Button
            onClick={handleLogInQRClick}
            loading={pendingButton === "qr"}
            size="lg"
          >
            Log in from another device
          </Button>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          Logging in exposes your containers’ public ports to your private
          Tailscale network.
        </p>
      </div>
      <div className="fixed bottom-8 left-12 right-12 flex px-5 py-4 bg-white dark:bg-docker-gray-700 shadow-popover dark:shadow-2xl rounded-lg">
        <div>
          <h3 className="font-semibold">New to Tailscale?</h3>
          <p>
            Learn how Tailscale works and how to use it with Docker in our docs.
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

const needsAuthSelector = (state: State) => ({
  isAdmin: state.loginUser?.isAdmin || false,
  hostname: state.hostname,
  logout: state.logout,
})

function NeedsAuthView() {
  const { isAdmin, hostname, logout } = useTailscale(needsAuthSelector, shallow)

  return (
    <div className="py-24 text-center">
      <div className="flex flex-col items-center mx-auto max-w-2xl">
        <div className="mb-16">
          <LoadingView />
        </div>
        <h2 className="text-xl font-semibold mb-6">
          Waiting for an admin to approve this device…
        </h2>
        {isAdmin ? (
          <p className="text-base">
            You can approve this device from{" "}
            <Link
              className="underline underline-offset-1 decoration-blue-400 text-blue-400"
              href="https://login.tailscale.com/admin"
            >
              Tailscale’s admin console
            </Link>
            .<br />
            The extension will automatically update when the device is approved.
          </p>
        ) : (
          <p className="text-base">
            Ask the admin of your Tailscale network to approve “{hostname}
            -docker-desktop”
            <br />
            This page will automatically update when the device is approved.
          </p>
        )}
        <Button className="mt-16" onClick={logout}>
          Log in to a different account
        </Button>
      </div>
    </div>
  )
}
