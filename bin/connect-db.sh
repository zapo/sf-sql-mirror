#!/usr/bin/env bash

docker run --rm -it \
  --name mariadb-client \
  mariadb \
  mysql -h "$DB_HOST" -u "$DB_USERNAME" -p$DB_PASSWORD -D "$DB_NAME"
