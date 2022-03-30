import create from "zustand"
import shallowCompare from "zustand/shallow"
import { isMacOS, isSharedDomain, isWindows, openBrowser } from "src/utils"

// BackendState
// Keep in sync with https://github.com/tailscale/tailscale/blob/main/ipn/backend.go
export type BackendState =
  | "NoState"
  | "NeedsMachineAuth"
  | "NeedsLogin"
  | "InUseOtherUser"
  | "Stopped"
  | "Starting"
  | "Running"

type LoginUser = {
  loginName: string
  displayName: string
  profilePicUrl: string
  tailnetName: string
  isAdmin?: boolean
}

export type State = {
  /**
   * initialized indicates whether we've fetched an initial status from the
   * Tailscale backend or not. It lets us verify whether we're using some
   * initial state or not.
   */
  initialized: boolean
  backendState: BackendState
  containers: Container[]
  hostname: string
  hostStatus: HostStatus
  tailscaleIPs: string[]

  /**
   * loginInfo is an object with details that allow a user to log in.
   */
  loginInfo?: { authUrl: string; qrUrl: string }
  /**
   * loginUser is the currently authenticated user to the Tailscale Docker
   * extension.
   */
  loginUser?: LoginUser

  connect: () => Promise<void>
  disconnect: () => Promise<void>
  switchAccount: () => Promise<void>
  logout: () => Promise<void>

  /**
   * fetchLoginInfo runs `tailscale up` in the extension container to obtain
   * the login URL.
   */
  fetchLoginInfo: () => Promise<void>
  fetchStatus: () => Promise<void>
  /**
   * fetchHostname gets the hostname of the host machine, which is later used
   * for containers
   */
  fetchHostname: () => Promise<void>
  /**
   * fetchHostStatus gets the status of Tailscale on the host machine.
   */
  fetchHostStatus: () => Promise<void>
}

/**
 * useTailscale is a single hook that manages the state of Tailscale and
 * provides various methods to interact with it. All Tailscale state should
 * live in this hook.
 */
const useTailscale = create<State>((set, get) => ({
  initialized: false,
  backendState: "NoState",
  containers: [],
  hostname: "",
  hostStatus: { status: "unknown", loginName: "" },
  tailscaleIPs: [],
  loginInfo: undefined,
  loginUser: undefined,

  connect: async () => {
    await runTailscaleCommand(`up`)
    await get().fetchStatus()
  },
  disconnect: async () => {
    // Optimistic update, TODO: should we roll back the update if it fails?
    const prev = get().backendState
    set({ backendState: "Stopped" })
    try {
      await runTailscaleCommand(`down`)
    } catch (err) {
      set({ backendState: prev })
      throw err
    }
  },
  logout: async () => {
    await runTailscaleCommand(`logout`)
    set({
      backendState: "Stopped",
      loginInfo: undefined,
      loginUser: undefined,
      containers: [],
    })
  },
  switchAccount: async () => {
    await get().fetchLoginInfo()
    const state = get()
    if (state.loginInfo?.authUrl) {
      await openBrowser(state.loginInfo.authUrl)
      return
    }
    throw new Error("No login URL")
  },
  fetchLoginInfo: async () => {
    if (get().loginInfo) {
      // If we already have loginInfo, don't overwrite it.
      return
    }
    try {
      let hostname = get().hostname
      if (hostname === "") {
        await get().fetchHostname()
        hostname = get().hostname
      }
      const info = await getLoginInfo(hostname)
      const loginInfo =
        typeof info.AuthURL === "string" && typeof info.QR === "string"
          ? {
              authUrl: info.AuthURL,
              qrUrl: info.QR,
            }
          : undefined
      set({
        backendState: info.BackendState,
        loginInfo,
      })
    } catch (err) {
      console.error("Error in fetchLoginInfo:", err)
    }
  },
  fetchHostname: async () => {
    try {
      const resp = await window.ddClient.execHostCmd("hostname")
      set({ hostname: resp.stdout.trim().toLowerCase() })
    } catch (err) {
      console.error("Error in fetchHostname:", err)
    }
  },
  fetchStatus: async () => {
    try {
      // TODO: separate out container fetching and Tailscale status fetching.
      const [statusResponse, containers] = await Promise.all([
        getTailscaleStatus(),
        window.ddClient.listContainers(),
      ])
      const [status, rawStatus] = statusResponse
      set((state) => ({
        ...state,
        initialized: true,
        backendState: status.BackendState,
        tailscaleIPs: status.Self.TailscaleIPs,
        loginUser: getLoginUserFromStatus(status, rawStatus),
        containers: containers
          // only show containers that expose a public port
          .filter((c) => c.Ports.some((p) => p.PublicPort))
          // only show non-extension containers
          .filter((c) => c.Labels["com.docker.desktop.plugin"] === undefined),
      }))
    } catch (err) {
      console.error("Error in fetchStatus:", err)
    }
  },
  fetchHostStatus: async () => {
    const hostStatus: HostStatus = { ...get().hostStatus }
    const installed = await isTailscaleOnHost()

    if (!installed) {
      hostStatus.status = "not-installed"
      hostStatus.loginName = ""
      set({ hostStatus })
      return
    }
    hostStatus.status = "installed"
    try {
      const [status, rawStatus] = await tailscaleOnHostStatus()
      hostStatus.status =
        status.BackendState === "Running" ? "running" : "installed"
      hostStatus.loginName =
        getLoginUserFromStatus(status, rawStatus)?.loginName || ""
    } catch (err) {
      set({ hostStatus })
      return
    }
    set({ hostStatus })
  },
}))

export default useTailscale

type StatusResponse = {
  BackendState: BackendState
  Self: StatusSelf
  User: Record<string, TailscaleUser> | null
  TailnetName?: string // Only available in versions of Tailscale > 1.20.3
}

type TailscaleUser = {
  ID: number
  LoginName: string
  DisplayName: string
  ProfilePicURL: string
  Roles: string[]
}

type StatusSelf = {
  ID: string
  UserID: number
  HostName: string
  DNSName: string
  OS: string
  TailscaleIPs: string[]
  Capabilities: string[]
}

/**
 * getLoginUserFromStatus extracts the current user details from the status
 * response, handling various empty cases.
 */
function getLoginUserFromStatus(
  status: StatusResponse,
  rawStatus: string,
): LoginUser | undefined {
  let backendUser: TailscaleUser | undefined = undefined
  let loginUser: LoginUser | undefined = undefined

  if (status.User && status.Self.UserID !== 0) {
    // First, try to use the user ID from the status response.
    backendUser = status.User[status.Self.UserID]
  }
  if (status.User && backendUser === undefined) {
    // If the backendUser is missing, it may be because of a truncated numeric
    // ID problem. Try to parse the status response to find the user ID and
    // try again.
    const backendUserID = getUserIDFromRawStatus(rawStatus)
    if (backendUserID) {
      backendUser = status.User[backendUserID]
    }
  }

  if (backendUser) {
    loginUser = {
      loginName: backendUser.LoginName,
      displayName: backendUser.DisplayName,
      profilePicUrl: backendUser.ProfilePicURL,
      tailnetName: "",
    }

    if (
      typeof status.TailnetName === "string" &&
      status.TailnetName.length > 0
    ) {
      loginUser.tailnetName = status.TailnetName
    } else {
      loginUser.tailnetName = getTailnetName(loginUser.loginName)
    }

    if (
      status.Self.Capabilities?.includes("https://tailscale.com/cap/is-admin")
    ) {
      loginUser.isAdmin = true
    }
  }
  return loginUser
}

function getTailnetName(loginName: string) {
  const [, suffix] = loginName.split("@")
  return isSharedDomain(suffix) ? loginName : suffix
}

/**
 * getUserIDFromRawStatus extracts a string-based UserID from the raw text
 * output of `tailscale status --json`.
 *
 * We need this because some UserIDs are larger integers than Javascript
 * supports, so they get truncated, which results in failing to load the user
 * information. By extracting this from the raw string output, Javascript never
 * has the chance to truncate the ID value.
 */
function getUserIDFromRawStatus(rawStatus: string): string | undefined {
  // While the output has multiple `"UserID"` lines, the `"Self"` block should
  // always appear first.
  const match = rawStatus.match(/"UserID":\s*(\d+)/)
  return match ? match[1] : undefined
}

async function getTailscaleStatus(): Promise<[StatusResponse, string]> {
  const status = await runTailscaleCommand("status -json")
  return [JSON.parse(status.stdout), status.stdout]
}

async function runTailscaleCommand(command: string): Promise<CommandOutput> {
  const resp = await window.ddClient.backend.execInVMExtension(
    `/app/tailscale ${command}`,
  )
  return resp
}

// TailscaleUpResponse: output of `tailscale up --json ...`
type TailscaleUpResponse = {
  BackendState: BackendState
  AuthURL?: string // e.g. https://login.tailscale.com/a/0123456789abcdef
  QR?: string // a DataURL-encoded QR code PNG of the AuthURL
}

/**
 * getLoginInfo fetches the current login state from Tailscale.
 */
async function getLoginInfo(hostname: string): Promise<TailscaleUpResponse> {
  // We use `--force-reauth` because we want to provide users the option to
  // change their account. If we call `up` without `--force-reauth`, it just
  // tells us that it's already running.
  const command = `/app/background-output.sh /app/tailscale up --hostname=${hostname}-docker-desktop --accept-dns=false --json --reset --force-reauth`
  const resp = await window.ddClient.backend.execInVMExtension(command)
  let info = JSON.parse(resp.stdout)
  if (typeof info.AuthURL === "string") {
    // Add referral partner info to the URL
    const authURL = new URL(info.AuthURL)
    authURL.searchParams.set("partner", "docker")
    info.AuthURL = authURL.toString()
  }
  return info as TailscaleUpResponse
}

export type HostStatus = {
  status: "unknown" | "not-installed" | "installed" | "running"
  loginName: string
}

const windowsTailscalePath = async () => {
  const output = await window.ddClient.execHostCmd("host-tailscale where")
  return `"${output.stdout.trim()}"`
}
const macOSTailscalePath =
  "/Applications/Tailscale.app/Contents/MacOS/tailscale"
const linuxTailscalePath = "/usr/bin/env tailscale"

async function isTailscaleOnHost(): Promise<boolean> {
  try {
    if (isWindows()) {
      // This command will throw if Tailscale doesn't exist.
      await windowsTailscalePath()
      return true
    }
    await window.ddClient.execHostCmd(
      "host-tailscale present",
    )
    return true
  } catch (err) {
    // An error means it failed or it couldn't detect it. We assume it's not
    // installed in this case.
    return false
  }
}

async function tailscaleOnHostStatus() {
  const hostPath = isWindows()
    ? await windowsTailscalePath()
    : isMacOS()
    ? macOSTailscalePath
    : linuxTailscalePath
  const output = await window.ddClient.execHostCmd(`host-tailscale status ${hostPath}`)
  return [JSON.parse(output.stdout) as StatusResponse, output.stdout] as const
}

/**
 * openTailscaleOnHost will open the Tailscale app on the host machine, if it
 * is installed.
 */
export async function openTailscaleOnHost(): Promise<void> {
  if (isWindows()) {
    const path = await windowsTailscalePath()
    const tailscaleIpnExe = path.replace('tailscale.exe', 'tailscale-ipn.exe');
    await window.ddClient.execHostCmd(`host-tailscale start ${tailscaleIpnExe}`)
    return
  }
  if (isMacOS()) {
    await window.ddClient.execHostCmd("host-tailscale start")
    return
  }
  // TODO: support Linux. For now we just don't open anything.
  return
}

/**
 * shallow compares two objects to see if they have changed. It's re-exported
 * from zustand as a convenience.
 */
export const shallow = shallowCompare
