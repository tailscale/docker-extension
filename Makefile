EXTENSION:=
ifeq ($(OS),Windows_NT)
  EXTENSION:=.exe
endif

BINARY?=volumes-service
BUILDER=buildx-multi-arch

LOCAL_IMAGE_NAME=tailscale-docker-extension
REMOTE_IMAGE_NAME=tailscale/docker-extension

STATIC_FLAGS=CGO_ENABLED=0
#GIT_TAG?=$(shell git describe --tags --match "[0-9]*")
tag?=0.0.1
GIT_TAG?=$(tag)
LDFLAGS="-s -w -X github.com/tailscale/desktop-plugin/internal.Version=${GIT_TAG}"
GO_BUILD=$(STATIC_FLAGS) go build -trimpath -ldflags=$(LDFLAGS)

INFO_COLOR = \033[0;36m
NO_COLOR   = \033[m

bin: ## Build the binary for the current plarform
	@echo "$(INFO_COLOR)Building...$(NO_COLOR)"
	$(GO_BUILD) -o bin/volume-service ./vm-main

prepare-buildx: ## Create buildx builder for multi-arch build, if not exists
	docker buildx inspect $(BUILDER) || docker buildx create --name=$(BUILDER) --driver=docker-container --driver-opt=network=host

extension: ## Build service image to be deployed as a desktop extension
	docker build --tag=$(LOCAL_IMAGE_NAME) .
.PHONY: extension

install-extension: extension ## Install extension image Docker desktop
	docker extension update $(LOCAL_IMAGE_NAME)

dev-extension: install-extension
	@docker extension dev ui-source $(LOCAL_IMAGE_NAME) http://localhost:3011
	@PORT=3011 yarn --cwd ui start

push-extension: ## Build & Upload extension image to hub. Do not push if tag already exists: make push-extension tag=0.1
	docker pull $(REMOTE_IMAGE_NAME):$(tag) && echo "Failure: Tag already exists" && exit 1
	docker buildx build --push --builder=$(BUILDER) --platform=linux/arm64,linux/arm,linux/amd64 --build-arg TAG=${tag)} --tag=$(REMOTE_IMAGE_NAME):$(tag) .

help: ## Show this help
	@echo Please specify a build target. The choices are:
	@grep -E '^[0-9a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "$(INFO_COLOR)%-30s$(NO_COLOR) %s\n", $$1, $$2}'

.PHONY: bin extension push-extension help
