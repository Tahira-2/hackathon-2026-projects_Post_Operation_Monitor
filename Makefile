.PHONY: help dev dev-build dev-down prod prod-build prod-down \
        logs logs-backend logs-frontend \
        install install-backend install-frontend \
        clean clean-all

APP_DIR := projects/we-care

help:
	@echo "Usage: make <target>"
	@echo ""
	@echo "Dev:"
	@echo "  dev            Start dev environment (hot reload)"
	@echo "  dev-build      Build + start dev environment"
	@echo "  dev-down       Stop dev environment"
	@echo ""
	@echo "Prod:"
	@echo "  prod           Start prod environment"
	@echo "  prod-build     Build + start prod environment"
	@echo "  prod-down      Stop prod environment"
	@echo ""
	@echo "Logs:"
	@echo "  logs           Tail all logs"
	@echo "  logs-backend   Tail backend logs"
	@echo "  logs-frontend  Tail frontend logs"
	@echo ""
	@echo "Local:"
	@echo "  install        Install all deps (backend + frontend)"
	@echo "  backend-dev    Run backend locally (no Docker)"
	@echo "  frontend-dev   Run frontend locally (no Docker)"
	@echo ""
	@echo "Cleanup:"
	@echo "  clean          Stop all containers, remove volumes"
	@echo "  clean-all      clean + remove built images"

# --- Dev ---

dev:
	docker compose -f docker-compose.dev.yml up

dev-build:
	docker compose -f docker-compose.dev.yml up --build

dev-down:
	docker compose -f docker-compose.dev.yml down

# --- Prod ---

prod:
	docker compose -f docker-compose.prod.yml up -d

prod-build:
	docker compose -f docker-compose.prod.yml up -d --build

prod-down:
	docker compose -f docker-compose.prod.yml down

# --- Logs ---

logs:
	docker compose -f docker-compose.dev.yml logs -f

logs-backend:
	docker compose -f docker-compose.dev.yml logs -f backend

logs-frontend:
	docker compose -f docker-compose.dev.yml logs -f frontend

# --- Local (no Docker) ---

install: install-backend install-frontend

install-backend:
	cd $(APP_DIR)/backend && pnpm install

install-frontend:
	cd $(APP_DIR)/frontend && pnpm install

backend-dev:
	cd $(APP_DIR)/backend && pnpm dev

frontend-dev:
	cd $(APP_DIR)/frontend && pnpm dev

# --- Cleanup ---

clean:
	docker compose -f docker-compose.dev.yml down -v
	docker compose -f docker-compose.prod.yml down -v

clean-all: clean
	docker rmi we-care-backend:dev we-care-backend:prod \
	           we-care-frontend:dev we-care-frontend:prod 2>/dev/null || true
