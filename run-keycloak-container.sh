#!/bin/bash
local_port=${1}
admin_username=${2}
admin_password=${3}

docker run --rm \
  -v ./keycloak/dev/data/import:/opt/keycloak/data/import \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=${admin_username:-"admin"} \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=${admin_password:-"password"} \
  -p ${local_port:-"127.0.0.1:8083"}:8080 \
  keycloak/keycloak:26.2 \
  start-dev --import-realm
