# NestJS-BFF

[![Coverage Status](https://coveralls.io/repos/github/ogi-iii/nestjs-bff/badge.svg)](https://coveralls.io/github/ogi-iii/nestjs-bff)

This is the project of "Backend For Frontend" (called "BFF") using [NestJS](https://docs.nestjs.com/).

```mermaid
graph LR;
    subgraph Clients
    Android(Android)
    iOS(iOS)
    Web(Web)
    end

    subgraph "Backend For Frontend"
    NestJSApp(NestJS App)
    end

    subgraph "Destination API Services"
    MicroService1(Micro Service 1)
    MicroService2(Micro Service 2)
    MicroService3(Micro Service 3)
    MicroService4(Micro Service 4)
    end

    Android--Send Request-->NestJSApp
    iOS--Send Request-->NestJSApp
    Web--Send Request-->NestJSApp

    NestJSApp--Proxy Request-->MicroService1
    NestJSApp--Proxy Request-->MicroService2
    NestJSApp--Proxy Request-->MicroService3
    NestJSApp--Proxy Request-->MicroService4
```

## Features

The API endpoints of this BFF can be customized with YAML configuration files.

The supported types of API endpoint of this BFF is listed in below.

- HTTP Request Proxy (GET / POST / PUT / PATCH / DELETE)
  - with Authorization by Token Introspection (OAuth 2.0)
- Authentication by Authorization Code Flow (OAUTH 2.0 / OpenID Connect)
- Re-Authentication by Token Refresh (OAUTH 2.0 / OpenID Connect)

## Requirements

- Docker (version 27.2.0 or later)
- Node (version 20.12.1 or later)
- npm (version 10.9.0 or later)

## Getting started

### 1. Run the Keycloak Container

```bash
$ ./run-keycloak-container.sh [<PORT> <ADMIN_USERNAME> <ADMIN_PASSWORD>]
```

### 2. Setup Keycloak

#### 2.1. Login Keycloak as Admin User

![Keycloak login page](./img/keycloak-login.png)

#### 2.2. Create Keycloak Realm

![Keycloak realm creation page](./img/keycloak-realm.png)

#### 2.3. Create Keycloak Client

![Keycloak client creation page 1/3](./img/keycloak-client-01.png)

![Keycloak client creation page 2/3](./img/keycloak-client-02.png)

![Keycloak client creation page 3/3](./img/keycloak-client-03.png)

#### 2.4. Get Keycloak Client Secret

![Keycloak client credentials page](./img/keycloak-client-secret.png)

#### 2.5. Move to Keycloak Client Advanced Settings Tab

![Keycloak client advanced settings tab page](./img/keycloak-client-advanced.png)

#### 2.6. Set Keycloak Client PKCE Code Challenge Method

![Keycloak client PKCE code challenge method setting page](./img/keycloak-client-PKCE.png)

#### 2.7. Create Keycloak User

![Keycloak user creation page](./img/keycloak-user.png)

#### 2.8. Set Keycloak User Password

![Keycloak user password setting page](./img/keycloak-user-password.png)

### 3. Edit Environment Variables

**Default environment variables are defined in `.env` file.**

| Variable Name | Explanation | Default Value |
| ------------- | ----------- | ------------- |
| YAML_CONFIG_DIR_PATH | Directory Path of Yaml Config Files | `./config` |
| NEST_APP_HOST | Server Host of NestJS Application | `localhost` |
| NEST_APP_PORT | Server Port of NestJS Application | `3002` |
| KEYCLOAK_HOST | Server Host of Keycloak | `localhost` |
| KEYCLOAK_PORT | Server Port of Keycloak | `8083` |
| KEYCLOAK_REALM_NAME | Realm Name of Keycloak | `dev` |
| KEYCLOAK_SCOPE | Scope for Access Token from Keycloak | `openid` |
| KEYCLOAK_CLIENT_ID | Client ID of Keycloak | `nestjs-bff` |
| KEYCLOAK_CLIENT_SECRET | Client Secret of Keycloak | `<YOUR_KEYCLOAK_CLIENT_SECRET>` |

### 4. Install Package Dependencies

```bash
$ npm install
```

### (Optional) Execute Tests for the NestJS App

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### 5. Run the NestJS App

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### 6. Try to Access API Endpoints of the NestJS App!

**API endpoints are defined on YAML files in `config/` directory.**

| API Endpoint | Method | Query Parameters | Request Body | Request Headers |
| ------------ | ------ | ---------------- | ------------ | --------------- |
| /api/posts | GET | - | - | - |
| /api/posts | POST | - | {"name":"`<ANY_NAME>`", "email":"`<ANY_EMAIL>`"} | Content-Type: application/json |
| /api/auth/login | GET | - | - | - |
| /api/comments | GET | postId=`<ANY_NUMBER>` | - | Authorization: Bearer `<YOUR_ACCESS_TOKEN>` |
| /api/posts/comments | GET | postId=`<ANY_NUMBER>` | - | Authorization: Bearer `<YOUR_ACCESS_TOKEN>` |
| /api/auth/token/check | POST | - | {"token":"`<YOUR_ACCESS_TOKEN>`"} | Content-Type: application/json <br> Authorization: Basic `<BASE64_ENCODED("KEYCLOAK_CLIENT_ID:KEYCLOAK_CLIENT_SECRET")>` |
| /api/auth/token/refresh | POST | - | {"refresh_token":"`<YOUR_REFRESH_TOKEN>`"} | Content-Type: application/json |

## See Also

- Sample Destination API Service
  - [JSONPlaceholder - Free Fake REST API](https://jsonplaceholder.typicode.com/)
