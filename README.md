# Tailscale Docker Extension

This repository hosts the code for Tailscale's [Docker](https://docker.com) extension. The extension lets Docker users expose public ports from their local containers onto their Tailscale network.

### Developing

> :warning: Docker extensions are still in active development, and this information may change as it gets closer to release.

To get started with Docker Extensions you will need a specific Docker Desktop build that comes with extension capabilities and the Extensions CLI.

Install the following:

- A [custom build of Docker Desktop](https://github.com/docker/desktop-extension-samples/releases) with support for extensions
- An extension to the [Docker CLI](https://github.com/docker/desktop-extension-samples/releases)
- A local install of Node (v16.13.1 at the time of writing)
- A local install of yarn (v1.22.17 at the time of writing)

### Setting up

Once you have all the prerequisite pieces installed, enable the extension beta.

```
docker extension enable
```

Next, build and install the extension Docker container:

```
make install-extension
```

Navigate to Docker Desktop, and you should now see a new "Tailscale" section in the sidebar menu.

### Developing the extension backend

Any changes to the extension metadata or backend will require you to rebuild the extension and install it. You can do both with:

```
make install-extension
```

### Developing the extension UI

The extension UI is a React app that is statically bundled at build time. However, re-building the Docker container on each change is slow, so we can instead instruct the Docker Desktop app to use a local server to serve the UI instead.

```
make dev-extension
```

This will spin up a local server on [localhost:3000](http://localhost:3000). Once running, it instructs Docker Desktop to use that server as your extension UI. Changes will be hot reloaded.
