BUILDER=buildx-multi-arch

LOCAL_IMAGE_NAME=tailscale-docker-extension
REMOTE_IMAGE_NAME=tailscale/docker-extension

STATIC_FLAGS=CGO_ENABLED=0
#GIT_TAG?=$(shell git describe --tags --match "[0-9]*")
tag?=0.0.1
GIT_TAG?=$(tag)

INFO_COLOR = \033[0;36m
NO_COLOR   = \033[m

prepare-buildx: ## Create buildx builder for multi-arch build, if not exists
	docker buildx inspect $(BUILDER) || docker buildx create --name=$(BUILDER) --driver=docker-container --driver-opt=network=host
.PHONY: prepare-buildx

extension: ## Build service image to be deployed as a desktop extension
	docker build --tag=$(LOCAL_IMAGE_NAME) .
.PHONY: extension

install-extension: extension ## Install extension image Docker desktop
	docker extension update $(LOCAL_IMAGE_NAME)
.PHONY: install-extension

dev-extension: install-extension
	@docker extension dev ui-source $(LOCAL_IMAGE_NAME) http://localhost:3011
	@PORT=3011 yarn --cwd ui start
.PHONY: dev-extension

remove-extension:
	@docker extension remove $(LOCAL_IMAGE_NAME)
.PHONY: remove-extension

push-extension: ## Build & Upload extension image to hub. Do not push if tag already exists: make push-extension tag=0.1
	docker pull $(REMOTE_IMAGE_NAME):$(tag) && echo "Failure: Tag already exists" && exit 1
	docker buildx build --push --builder=$(BUILDER) --platform=linux/arm64,linux/arm,linux/amd64 --build-arg TAG=${tag)} --tag=$(REMOTE_IMAGE_NAME):$(tag) .
.PHONY: push-extension

help: ## Show this help
	@echo Please specify a build target. The choices are:
	@grep -E '^[0-9a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "$(INFO_COLOR)%-30s$(NO_COLOR) %s\n", $$1, $$2}'
.PHONY: help
