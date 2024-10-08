# nestjs-bff
This is the project of "backend for frontend" using NestJS.

## Requirements

- Docker (version 27.2.0 or later)
- Node (version 20.12.1 or later)
- npm (version 10.5.1 or later)

## Getting started

### 1. Running the Keycloak Container

```bash
$ ./run-keycloak-container.sh
```

### 2. Setup Keycloak

### 3. Edit Environment Variables

| Variable Name | Explanation | Default Value |
| ------------- | ----------- | ------------- |
| YAML_CONFIG_DIR_PATH | Directory Path of Yaml Config Files | ./config |
| NESTJS_APP_HOST | Server Host of NestJS Application | localhost |
| NEST_APP_PORT | Server Port of NestJS Application | 3002 |
| KEYCLOAK_HOST | Server Host of Keycloak | localhost |
| KEYCLOAK_PORT | Server Port of Keycloak | 8083 |
| KEYCLOAK_REALM_NAME | Realm Name of Keycloak | dev |
| KEYCLOAK_SCOPE | Scope for Access Token from Keycloak | openid |
| AUTH_CLIENT_ID | Client ID of Keycloak | nestjs-bff |
| AUTH_CLIENT_SECRET | Client Secret of Keycloak | (None) |

### 4. Installation

```bash
$ npm install
```

### 5. Running the NestJS App

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### 6. Try to Access API Endpoints of the NestJS App!

## (Optional) Tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
