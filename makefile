.PHONY: up start stop logs ssh-backend vendor db cc rm submodule

COMPOSE=docker compose -f docker-compose.yml
CONSOLE=php bin/console
BACKEND_EXEC=exec backend

start: submodule up vendor db cc
	${COMPOSE} start

up:
	docker kill $$(docker ps -q) || true
	docker network create crm_extranet_network || true
	${COMPOSE} build --force-rm
	${COMPOSE} up -d --remove-orphans

submodule:
	git submodule update --init --recursive

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

db:
	${COMPOSE} ${BACKEND_EXEC} ${CONSOLE} doctrine:database:drop --force
	${COMPOSE} ${BACKEND_EXEC} ${CONSOLE} doctrine:database:create
	${COMPOSE} ${BACKEND_EXEC} ${CONSOLE} doctrine:schema:update --force --complete
	${COMPOSE} ${BACKEND_EXEC} ${CONSOLE} doctrine:fixtures:load --no-interaction

