#!/bin/bash
local_port=${1}
admin_username=${2}
admin_password=${3}
docker run --rm -e KEYCLOAK_ADMIN=${admin_username:-"admin"} -e KEYCLOAK_ADMIN_PASSWORD=${admin_password:-"password"} -p ${local_port:-"127.0.0.1:8083"}:8080 quay.io/keycloak/keycloak:25.0 start-dev
