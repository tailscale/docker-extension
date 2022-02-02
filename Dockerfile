FROM alpine AS tailscale
RUN apk add --no-cache curl
ARG TARGETARCH
ARG TSVERSION=1.19.109
RUN curl -fSsLo /tmp/tailscale.tgz https://pkgs.tailscale.com/unstable/tailscale_${TSVERSION}_${TARGETARCH}.tgz \
    && mkdir /out \
    && tar -C /out -xzf /tmp/tailscale.tgz --strip-components=1

FROM node:14.17-alpine3.13 AS ui-builder
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
    com.docker.desktop.extension.icon="https://tailscale.com/files/tailscale-docker-icon.svg" \
    org.opencontainers.image.description="Connect your Docker containers to your secure private network." \
    org.opencontainers.image.authors="Tailscale Inc." \
    org.opencontainers.image.vendor="Tailscale Inc." \
    com.docker.desktop.extension.api.version=">=0.1.0"
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
COPY host/tsbrowser darwin/tsbrowser
COPY host/tsbrowser.cmd windows/tsbrowser.cmd
ENV TS_HOST_ENV dde
CMD /app/tailscaled --state=/var/lib/tailscale/tailscaled.state --tun=userspace-networking
