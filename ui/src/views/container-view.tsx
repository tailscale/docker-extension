import React, { useCallback, useEffect, useState } from "react"
import cx from "classnames"
import Avatar from "src/components/avatar"
import Dialog from "src/components/dialog"
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
import useTimedToggle from "src/hooks/timed-toggle"

type ConfirmLogoutAction = "logout" | "none"

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
  const { backendState, loginUser, connect, disconnect, logout } = useTailscale(
    selector,
    shallow,
  )
  const [connecting, setConnecting] = useState(false)
  const [confirmLogoutAction, setConfirmLogoutAction] =
    useState<ConfirmLogoutAction>("none")

  const handleConnectClick = useCallback(async () => {
    setConnecting(true)
    await connect()
    setConnecting(false)
  }, [connect])

  const handleConfirmLogout = useCallback(() => {
    if (confirmLogoutAction === "logout") {
      logout()
    }
    setConfirmLogoutAction("none")
  }, [confirmLogoutAction, logout])

  return (
    <div>
      <Dialog
        open={confirmLogoutAction !== "none"}
        onOpenChange={(open) =>
          open ? undefined : setConfirmLogoutAction("none")
        }
        onConfirm={handleConfirmLogout}
        title="Log out?"
        action="Log out"
        destructive
      >
        <p>
          Logging out of Tailscale will disconnect all exposed ports. Any
          members of your Tailscale network using these Tailscale URLs will no
          longer be able to access your containers.
        </p>
      </Dialog>
      <header className="flex items-center justify-between py-5">
        <div>
          <div className="font-semibold text-xl">Tailscale</div>
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <span className="mr-2">
              {backendState === "Stopped" ? "Signed in to" : "Connected to"}{" "}
              {loginUser?.tailnetName}
            </span>
            <Tooltip content="This is your tailnet name. Other members of your tailnet can connect to your public container ports.">
              <Icon className="text-gray-500" name="info" size="13" />
            </Tooltip>
          </div>
        </div>
        <div className="flex ml-auto space-x-3">
          {backendState === "Stopped" ? (
            <Button
              variant="minimal"
              loading={connecting}
              onClick={handleConnectClick}
            >
              Connect
            </Button>
          ) : (
            <Button variant="minimal" onClick={disconnect}>
              Disconnect
            </Button>
          )}
          <DropdownMenu
            asChild
            align="end"
            trigger={
              <button className="-ml-3 px-3 py-2 group rounded-lg flex items-center overflow-hidden transition focus:outline-none hover:bg-[rgba(31,41,55,0.05)] dark:hover:bg-[rgba(255,255,255,0.05)]  focus-visible:bg-[rgba(31,41,55,0.05)] dark:focus-visible:bg-[rgba(255,255,255,0.05)]">
                <Avatar
                  name={loginUser?.displayName || "Unknown"}
                  src={loginUser?.profilePicUrl}
                  className="w-6 h-6"
                />
                <Icon
                  className="ml-2 text-gray-500 group-hover:text-gray-400 group-focus:text-gray-400 transition-colors"
                  name="chevron-down"
                  size="16"
                />
              </button>
            }
          >
            <DropdownMenu.Group>
              <p className="font-medium min-w-[12rem]">
                {loginUser?.displayName}
              </p>
              <p className="opacity-80">{loginUser?.loginName}</p>
            </DropdownMenu.Group>
            <DropdownMenu.Separator />
            <DropdownMenu.Link href="https://tailscale.com/kb">
              Tailscale docs
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
            <DropdownMenu.Item
              onSelect={() => setConfirmLogoutAction("logout")}
            >
              Log out
            </DropdownMenu.Item>
          </DropdownMenu>
        </div>
      </header>
      {backendState === "Stopped" ? (
        <div className="flex flex-col items-center text-center max-w-lg mx-auto py-8">
          {/* TODO: refine the language in this state. */}
          <div className="mb-4">
            <Icon className="text-gray-300" name="offline" size="36" />
          </div>
          <h2 className="text-lg font-semibold mb-2">
            Tailscale is disconnected
          </h2>
          <p className="mb-8">
            Reconnect to continue sharing your containers with your private
            network.
          </p>
          <Button
            variant="primary"
            size="lg"
            loading={connecting}
            onClick={handleConnectClick}
          >
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
              <th className={tableHeaderClass} />
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
        <div className="text-center py-12">
          <p className="text-xl font-medium mb-1">No containers are running.</p>
          <p className="text-gray-500 dark:text-gray-400">
            Go to the Containers tab to get started.
          </p>
        </div>
      )}
    </>
  )
}

function ContainerRow(props: { container: Container; tailscaleIP: string }) {
  const { container, tailscaleIP } = props
  const [copied, setCopied] = useTimedToggle(false, 1000)
  const [showTooltip, setShowTooltip] = useState(false)
  const publicPort = container.Ports.find((p) => p.PublicPort !== undefined)
  const tailscaleIPPort = `${tailscaleIP}:${publicPort?.PublicPort}`.trim()
  const tailscaleURL = `http://${tailscaleIPPort}`

  const handleCopyClick = useCallback(() => {
    copyToClipboard(tailscaleURL)
    setShowTooltip(true)
    setCopied(true)
  }, [tailscaleURL, setCopied])

  return (
    <tr className="group hover:bg-[rgba(255,255,255,0.5)] dark:hover:bg-docker-dark-gray-700 transition">
      <td className={cx(tableCellClass, "flex items-center")}>
        <Icon
          className={cx("mr-3", {
            "text-emerald-400 dark:text-green-300":
              container.State === "running",
            "text-gray-600": container.State !== "running",
          })}
          name="container"
          size="24"
        />
        <span>{container.Names.map((n) => n.slice(1).trim()).join(",")}</span>
      </td>
      <td className={tableCellClass}>
        <Tooltip
          asChild
          content={<span>{copied ? "Copied!" : "Copy URL to clipboard"}</span>}
          closeOnClick={false}
          open={showTooltip}
          onOpenChange={setShowTooltip}
        >
          <button
            className={cx(tableButtonClass, "flex items-center")}
            onClick={handleCopyClick}
          >
            {tailscaleIPPort}
            <Icon
              className="ml-1.5 text-gray-400"
              name={copied ? "check" : "clipboard"}
              size="14"
            />
          </button>
        </Tooltip>
      </td>
      <td className={cx(tableCellClass, "space-x-4 text-right")}>
        <Tooltip asChild content="Open URL in browser">
          <button
            className={tableButtonClass}
            onClick={() => openBrowser(tailscaleURL)}
          >
            Open
          </button>
        </Tooltip>
      </td>
    </tr>
  )
}

const borderColor = "border-gray-200 dark:border-[rgba(255,255,255,0.09)]"
const tablePadding = "px-2 py-4"
const tableHeaderClass = cx(
  "uppercase tracking-wider text-gray-700 dark:text-gray-200 text-xs border-b select-none",
  tablePadding,
  borderColor,
)
const tableCellClass = cx("border-b h-14", tablePadding, borderColor)
const tableButtonClass = "focus:outline-none focus-visible:ring"

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
