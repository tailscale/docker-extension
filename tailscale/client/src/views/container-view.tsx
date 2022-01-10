import React, { useCallback, useEffect, useState } from "react"
import cx from "classnames"
import Avatar from "src/components/avatar"
import AlertDialog from "src/components/alert-dialog"
import Button from "src/components/button"
import DropdownMenu from "src/components/dropdown-menu"
import Tooltip from "src/components/tooltip"
import useTailscale, {
  State,
  shallow,
  openTailscaleOnHost,
} from "src/tailscale"
import copyToClipboard from "src/lib/clipboard"
import { openBrowser } from "src/utils"
import Icon from "src/components/icon"

type ConfirmLogoutAction = "switch-account" | "logout"

const selector = (state: State) => ({
  backendState: state.backendState,
  loginUser: state.loginUser,
  connect: state.connect,
  disconnect: state.disconnect,
  switchAccount: state.switchAccount,
  logout: state.logout,
})

/**
 * ContainerView is the main view of the Tailscale Docker extension. It shows
 * the list of containers and Tailscale URLs they can use to access them.
 */
export default function ContainerView() {
  const {
    backendState,
    loginUser,
    connect,
    disconnect,
    switchAccount,
    logout,
  } = useTailscale(selector, shallow)
  const [confirmLogoutAction, setConfirmLogoutAction] = useState<
    ConfirmLogoutAction | undefined
  >(undefined)

  const handleConfirmLogout = useCallback(() => {
    if (confirmLogoutAction === "switch-account") {
      switchAccount()
    } else if (confirmLogoutAction === "logout") {
      logout()
    }
    setConfirmLogoutAction(undefined)
  }, [confirmLogoutAction, switchAccount, logout])

  return (
    <div>
      <AlertDialog
        open={confirmLogoutAction !== undefined}
        onOpenChange={(open) =>
          open ? undefined : setConfirmLogoutAction(undefined)
        }
        onConfirm={handleConfirmLogout}
        title={
          confirmLogoutAction === "switch-account"
            ? "Switch account?"
            : "Log out?"
        }
        action={
          confirmLogoutAction === "switch-account"
            ? "Switch account"
            : "Log out"
        }
        destructive
      >
        {confirmLogoutAction === "switch-account" ? (
          <p>
            Switching Tailscale accounts will disconnect all exposed ports. Any
            members of your current Tailscale network using these Tailscale URLs
            will no longer be able to access your containers.
          </p>
        ) : (
          <p>
            Logging out of Tailscale will disconnect all exposed ports. Any
            members of your Tailscale network using these Tailscale URLs will no
            longer be able to access your containers.
          </p>
        )}
      </AlertDialog>
      <header className="flex items-center justify-between py-6 px-2">
        <div className="flex">
          <div className="flex items-center space-x-3">
            <DropdownMenu
              asChild
              trigger={
                <button className="flex items-center overflow-hidden rounded-full focus:outline-none focus:ring">
                  <Avatar
                    name={loginUser?.displayName || "Unknown"}
                    src={loginUser?.profilePicUrl}
                    className="w-8 h-8"
                  />
                </button>
              }
            >
              <DropdownMenu.Link href="https://tailscale.com/download">
                Tailscale Docs
              </DropdownMenu.Link>
              {loginUser?.isAdmin && (
                <DropdownMenu.Link href="https://login.tailscale.com/admin">
                  Admin console
                </DropdownMenu.Link>
              )}
              <DropdownMenu.Link href="https://tailscale.com/download">
                Download Tailscale
              </DropdownMenu.Link>
              <DropdownMenu.Separator />
              {/* TODO: make this log in as another user */}
              <DropdownMenu.Item
                onSelect={() => setConfirmLogoutAction("switch-account")}
              >
                Log in to a different account…
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => setConfirmLogoutAction("logout")}
              >
                Log out
              </DropdownMenu.Item>
            </DropdownMenu>
            <div className="font-medium">{loginUser?.loginName}</div>
          </div>
        </div>
        <div className="ml-auto">
          {backendState === "Stopped" ? (
            <Button onClick={connect}>Connect</Button>
          ) : (
            <Button onClick={disconnect}>Disconnect</Button>
          )}
        </div>
      </header>
      {backendState === "Stopped" ? (
        <div className="flex flex-col items-center text-center py-3">
          {/* TODO: refine the language in this state. */}
          <div className="mb-4">
            <Icon name="offline" />
          </div>
          <p className="mb-6">
            Tailscale is disconnected. Reconnect to your network to continue
            sharing your containers.
          </p>
          <Button variant="primary" onClick={connect}>
            Connect
          </Button>
        </div>
      ) : (
        <ContainerTable />
      )}
    </div>
  )
}

const containerSelector = (state: State) => ({
  containers: state.containers,
  tailscaleIPs: state.tailscaleIPs,
})

function ContainerTable() {
  const { containers, tailscaleIPs } = useTailscale(containerSelector, shallow)

  return (
    <>
      <HostWarning />
      {containers.length > 0 ? (
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className={tableHeaderClass}>Container</th>
              <th className={tableHeaderClass}>Tailscale URL</th>
            </tr>
          </thead>
          <tbody>
            {containers.map((c) => (
              <ContainerRow
                key={c.Id}
                container={c}
                tailscaleIP={tailscaleIPs[0]}
              />
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center">
          <p className="text-lg">
            No containers found. Go to the Containers tab to get started.
          </p>
        </div>
      )}
    </>
  )
}

function ContainerRow(props: { container: Container; tailscaleIP: string }) {
  const { container, tailscaleIP } = props

  if (container.Labels["com.docker.desktop.plugin"]) {
    // Don't show extension containers
    return null
  }

  const tailscaleIPPort =
    `${tailscaleIP}:${container.Ports[0].PublicPort}`.trim()
  const copyText = `http://${tailscaleIPPort}`

  return (
    <tr className="group hover:bg-[rgba(255,255,255,0.7)] dark:hover:bg-docker-dark-gray-700 transition">
      <td className={tableCellClass}>
        {container.Names.map((n) => n.slice(1).trim()).join(",")}
      </td>
      <td className={tableCellClass}>{tailscaleIPPort}</td>
      <td className={cx(tableCellClass, "space-x-4 text-right")}>
        <Tooltip asChild content="Open URL in browser">
          <button onClick={() => openBrowser(copyText)}>Open</button>
        </Tooltip>
        <Tooltip asChild content="Copy URL to clipboard">
          <button onClick={() => copyToClipboard(copyText)}>Copy</button>
        </Tooltip>
      </td>
    </tr>
  )
}

const tableHeaderClass =
  "uppercase tracking-wider text-gray-700 dark:text-gray-200 text-xs px-2 py-4"
const tableCellClass = "py-4 px-2 border-t border-gray-300 dark:border-gray-700"

const hostWarningSelector = (state: State) => ({
  hostStatus: state.hostStatus,
  loginName: state.loginUser?.loginName,
  switchAccount: state.switchAccount,
  fetchHostStatus: state.fetchHostStatus,
})

/**
 * HostWarning shows a warning when the state of the user's host device is
 * configured in a way that prevents access.
 */
function HostWarning() {
  const { loginName, hostStatus, switchAccount, fetchHostStatus } =
    useTailscale(hostWarningSelector, shallow)
  const [showHostWarning, setShowHostWarning] = useState(true) // TODO: replace with sticky "does host have Tailscale" condition

  useEffect(() => {
    fetchHostStatus()
  }, [fetchHostStatus])

  if (
    !showHostWarning ||
    !loginName ||
    hostStatus.status === "unknown" ||
    (hostStatus.status === "running" && hostStatus.loginName === loginName)
  ) {
    return null
  }

  const messages: { title: string; description: React.ReactNode } =
    hostStatus.status === "installed"
      ? {
          title: "Your host device is not running Tailscale",
          description:
            "Tailscale's private URLs are only accessible on devices running Tailscale. To access these URLs, install Tailscale on your host device and log in.",
        }
      : hostStatus.status === "running" && hostStatus.loginName !== loginName
      ? {
          title: "Logged in as different accounts",
          description: (
            <>
              Your host device is logged in as {hostStatus.loginName}, but
              Docker is logged in as {loginName}. You can't access private
              Tailscale URLs on your host machine unless you log in to the same
              network.
            </>
          ),
        }
      : {
          title: `Your host device is not running Tailscale`,
          description:
            "Tailscale is not installed on your host device. Please install it to access these container URLs.",
        }

  return (
    <div className="flex flex-col items-start px-4 py-4 mb-4 rounded-md bg-gray-200 dark:bg-docker-dark-gray-700">
      <h3 className="font-semibold text-base mb-2">{messages.title}</h3>
      <p className="mb-4 max-w-3xl text-gray-700 dark:text-gray-200">
        {messages.description}
      </p>
      <div className="flex space-x-2">
        <Button onClick={() => setShowHostWarning(false)}>Close</Button>
        {hostStatus.status === "installed" ? (
          <Button onClick={openTailscaleOnHost}>Open Tailscale</Button>
        ) : hostStatus.status === "running" ? (
          <Button onClick={switchAccount}>Log in to a different account</Button>
        ) : (
          <Button onClick={() => openBrowser("https://tailscale.com/download")}>
            Download Tailscale
          </Button>
        )}
      </div>
    </div>
  )
}
