FROM alpine AS tailscale
RUN apk add --no-cache curl
ARG TARGETARCH
ARG TSVERSION=1.30.2
RUN curl -fSsLo /tmp/tailscale.tgz https://pkgs.tailscale.com/stable/tailscale_${TSVERSION}_${TARGETARCH}.tgz \
    && mkdir /out \
    && tar -C /out -xzf /tmp/tailscale.tgz --strip-components=1

FROM node:14.17-alpine AS ui-builder
WORKDIR /app/ui
# cache packages in layer
COPY ui/package.json /app/ui/package.json
COPY ui/yarn.lock /app/ui/yarn.lock
ARG TARGETARCH
RUN yarn config set cache-folder /usr/local/share/.cache/yarn-${TARGETARCH}
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn-${TARGETARCH} yarn
# install
COPY ui /app/ui
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn-${TARGETARCH} yarn build

FROM debian:bullseye-slim
LABEL org.opencontainers.image.title="Tailscale" \
    org.opencontainers.image.description="Tailscale lets you securely connect to your Docker containers without exposing them to the public internet." \
    org.opencontainers.image.authors="Tailscale Inc." \
    org.opencontainers.image.vendor="Tailscale Inc." \
    com.docker.desktop.extension.icon="https://tailscale.com/files/tailscale-docker-icon.svg" \
    com.docker.desktop.extension.api.version=">=0.2.3" \
    com.docker.extension.screenshots='[{"alt": "A list of Docker containers in the Tailscale extension. A caption that says: Connect Docker to your private network. Share development servers with teammates, or remotely access private resources.", "url": "https://tailscale.com/files/images/docker/docker-screenshot-1.png"},{"alt": "A Docker container with a tooltip that says Open in Browser. A browser next to it with a website. A caption that says Easy access, from anywhere. Tailscale gives your containers a static IP and easy DNS name. It works even across firewalls and containerization layers.", "url": "https://tailscale.com/files/images/docker/docker-screenshot-2.png"}]' \
    com.docker.extension.detailed-description="<p>With Tailscale, create a secure, virtual private network to connect your devices to in minutes. Tailscale's Docker Desktop extension enables you to connect your containers to your Tailscale network. Any containers with exposed ports are available to others on the same tailnet (Tailscale network).</p><p>Tailscale lets you:</p><ul><li>Share development servers with your teammates without any extra setup</li><li>Access databases and sensitive development resources without exposing them to the public internet</li><li>Use shortnames for your devices and containers thanks to <i>MagicDNS</i></li></ul><h3>About Tailscale</h3><p>Tailscale is a zero-config VPN that installs on any device in minutes, manages firewall rules for you, and works from anywhere. No matter the firewalls or containerization layers that may exist between devices, Tailscale just works. With robust access control rules enforced by each device, users on your network can only access what they're allowed to.</p><p>For more details, visit <a href="https://tailscale.com">tailscale.com</a>." \
    com.docker.extension.publisher-url="https://tailscale.com"\
    com.docker.extension.additional-urls='[{"title":"Website","url":"https://tailscale.com/"},{"title":"Documentation","url":"https://tailscale.com/kb/"},{"title":"Support","url":"https://tailscale.com/contact/support"},{"title":"Terms of Service","url":"https://tailscale.com/terms"},{"title":"Privacy policy","url":"https://tailscale.com/privacy-policy"},{"title":"Open Source Licenses","url":"https://tailscale.com/licenses/tailscale"}]'\
    com.docker.extension.categories="networking,security"
RUN apt-get update \
    && apt-get install -y \
    ca-certificates \
    iptables \
    iproute2 \
    procps \
    inotify-tools \
    && rm -rf /var/lib/apt/lists/*
COPY --from=tailscale /out/tailscale /app/tailscale
COPY --from=tailscale /out/tailscaled /app/tailscaled
COPY --from=ui-builder /app/ui/dist ui
COPY tailscale.svg .
COPY metadata.json .
COPY background-output.sh /app/background-output.sh
COPY wait-for-exit.sh /app/wait-for-exit.sh
COPY vm/docker-compose.yaml .
COPY host/hostname darwin/hostname
COPY host/hostname.cmd windows/hostname.cmd
COPY host/hostname.sh linux/hostname.sh
COPY host/host-tailscale darwin/host-tailscale
COPY host/host-tailscale.cmd windows/host-tailscale.cmd
COPY host/host-tailscale.sh linux/host-tailscale.sh
ENV TS_HOST_ENV dde
CMD /app/tailscaled --state=/var/lib/tailscale/tailscaled.state --tun=userspace-networking
