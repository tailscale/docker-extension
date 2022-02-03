interface Container {
  Id: string
  Names: string[]
  Ports: Port[]
  Image: string
  ImageID: string
  State: string
  Status: string
  Labels: {
    "com.docker.desktop.plugin"?: true
  }
  Created: number // unix timestamp
}

interface Port {
  PublicPort: number
  Type: string
}

interface CommandOutput {
  stdout: string
  stderr: string
  lines: () => string[]
  parseJsonLines: () => unknown[]
}

interface Window {
  ddClient: {
    listContainers: () => Promise<Container[]>
    listImages: () => Promise<void> // TODO: figure out return value type
    execHostCmd: (command: string) => Promise<CommandOutput>
    toastError: (error: string) => void // TODO: figure out return value type
    openExternal: (url: string) => Promise<void> // TODO: figure out return value type
    backend: {
      get: (socketName: string) => Promise<void> // TODO: figure out return value type
      execInVMExtension: (command: string) => Promise<CommandOutput>
    }
  }
}
