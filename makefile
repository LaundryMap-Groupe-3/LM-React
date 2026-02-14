.PHONY: up start stop logs ssh-backend vendor cc rm

COMPOSE=docker compose -f docker-compose.yml
CONSOLE=php bin/console
BACKEND_EXEC=exec backend

start: up vendor cc

up:
	docker kill $$(docker ps -q) || true
	docker network create crm_extranet_network || true
	git submodule update --init --recursive
	${COMPOSE} build --force-rm
	${COMPOSE} up -d --remove-orphans

start:
	${COMPOSE} start

stop:
	${COMPOSE} stop
	${COMPOSE} kill

rm:
	make stop
	${COMPOSE} rm

vendor:
	${COMPOSE} ${BACKEND_EXEC} composer install

cc:
	${COMPOSE} ${BACKEND_EXEC} ${CONSOLE} c:cl --no-warmup
	${COMPOSE} ${BACKEND_EXEC} ${CONSOLE} c:warmup

ssh-backend:
	${COMPOSE} ${BACKEND_EXEC} bash

logs:
	${COMPOSE} logs -f

