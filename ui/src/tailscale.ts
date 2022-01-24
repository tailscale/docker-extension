import create from "zustand"
import shallowCompare from "zustand/shallow"
import { isMacOS, isWindows, openBrowser } from "src/utils"

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
    // Optimistic update, doesn't roll back if the action fails
    set({
      backendState: "Stopped",
      loginInfo: undefined,
      loginUser: undefined,
      containers: [],
    })
    await runTailscaleCommand(`logout`)
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
      const [status, containers] = await Promise.all([
        getTailscaleStatus(),
        window.ddClient.listContainers(),
      ])
      set((state) => ({
        ...state,
        initialized: true,
        backendState: status.BackendState,
        tailscaleIPs: status.Self.TailscaleIPs,
        loginUser: getLoginUserFromStatus(status),
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
    // TODO: support Windows too.
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
      const status = await tailscaleOnHostStatus()
      hostStatus.status =
        status.BackendState === "Running" ? "running" : "installed"
      hostStatus.loginName = getLoginUserFromStatus(status)?.loginName || ""
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
function getLoginUserFromStatus(status: StatusResponse): LoginUser | undefined {
  const backendUser =
    status.User && status.Self.UserID !== 0
      ? status.User[status.Self.UserID.toString()]
      : undefined
  const loginUser: LoginUser | undefined = backendUser
    ? {
        loginName: backendUser.LoginName,
        displayName: backendUser.DisplayName,
        profilePicUrl: backendUser.ProfilePicURL,
      }
    : undefined
  if (loginUser) {
    if (
      status.Self.Capabilities?.includes("https://tailscale.com/cap/is-admin")
    ) {
      loginUser.isAdmin = true
    }
  }
  return loginUser
}

async function getTailscaleStatus(): Promise<StatusResponse> {
  const status = await runTailscaleCommand("status -json")
  return JSON.parse(status.stdout)
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

const windowsTailscalePath = "C:\\Program Files\\Tailscale\\tailscale.exe"
const macOSTailscalePath =
  "/Applications/Tailscale.app/Contents/MacOS/tailscale"
const linuxTailscalePath = "/usr/bin/env tailscale"

async function isTailscaleOnHost(): Promise<boolean> {
  try {
    if (isWindows()) {
      const output = await window.ddClient.execHostCmd(
        `Test-Path -Path '${windowsTailscalePath}' -PathType Leaf`,
      )
      return output.stdout.trim().toLowerCase() === "true"
    }
    await window.ddClient.execHostCmd(
      "/usr/bin/env test -d /Applications/Tailscale.app",
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
    ? windowsTailscalePath
    : isMacOS()
    ? macOSTailscalePath
    : linuxTailscalePath
  const output = await window.ddClient.execHostCmd(`${hostPath} status --json`)
  return JSON.parse(output.stdout) as StatusResponse
}

/**
 * openTailscaleOnHost will open the Tailscale app on the host machine, if it
 * is installed.
 */
export async function openTailscaleOnHost(): Promise<void> {
  if (isWindows()) {
    // TODO: support older paths for the Tailscale app.
    await window.ddClient.execHostCmd(`start ${windowsTailscalePath}`)
    return
  }
  if (isMacOS()) {
    await window.ddClient.execHostCmd("/usr/bin/env open -a 'Tailscale'")
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
