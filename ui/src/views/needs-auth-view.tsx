import Button from "src/components/button"
import Link from "src/components/link"
import useTailscale, { State, shallow } from "src/tailscale"
import useInterval from "src/hooks/interval"
import LoadingView from "src/views/loading-view"

const selector = (state: State) => ({
  isAdmin: state.loginUser?.isAdmin || false,
  hostname: state.hostname,
  tailscaleIPs: state.tailscaleIPs,
  fetchStatus: state.fetchStatus,
  logout: state.logout,
})

/**
 * NeedsAuthView handles the case where the device authorization is turned on
 * for a tailnet and the Docker client needs to be authorized before they
 * can continue.
 */
export default function NeedsAuthView() {
  const { isAdmin, hostname, fetchStatus, tailscaleIPs, logout } = useTailscale(
    selector,
    shallow,
  )

  useInterval(fetchStatus, 2500)

  const authorizeIP = tailscaleIPs.find((ip) => ip.startsWith("100."))
  const authorizeUrl = authorizeIP
    ? `https://login.tailscale.com/admin/machines/${authorizeIP}`
    : `https://login.tailscale.com/admin/machines`

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
              href={authorizeUrl}
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
