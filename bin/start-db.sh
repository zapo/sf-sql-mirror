#!/usr/bin/env bash

docker run --rm \
  --name mariadb \
  -p 3306:3306 \
  -e MYSQL_RANDOM_ROOT_PASSWORD=yes \
  -e MYSQL_DATABASE="$DB_NAME" \
  -e MYSQL_USER="$DB_USER" \
  -e MYSQL_PASSWORD="$DB_PASSWORD" \
  mariadb:latest \
  --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
