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
