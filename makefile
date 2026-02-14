.PHONY: up start stop restart build down logs

BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m

up:
	@echo "$(GREEN)Démarrage des conteneurs...$(NC)"
	docker compose up -d
	@echo "$(GREEN)✓ Conteneurs démarrés !$(NC)"
	@echo "$(YELLOW)React:$(NC) http://127.0.0.1"
	@echo "$(YELLOW)Symfony:$(NC) http://127.0.0.1:8080"
	@echo "$(YELLOW)phpMyAdmin:$(NC) http://127.0.0.1:8081"

start:
	docker compose start
	@echo "$(GREEN)✓ Conteneurs démarrés$(NC)"

stop:
	docker compose stop
	@echo "$(GREEN)✓ Conteneurs arrêtés$(NC)"

restart:
	docker compose restart
	@echo "$(GREEN)✓ Conteneurs redémarrés$(NC)"

build:
	docker compose build
	@echo "$(GREEN)✓ Conteneurs reconstruits$(NC)"

down:
	docker compose down
	@echo "$(GREEN)✓ Conteneurs arrêtés et supprimés$(NC)"

logs:
	docker compose logs -f
	@echo "$(GREEN)✓ Affichage des logs en temps réel$(NC)"

