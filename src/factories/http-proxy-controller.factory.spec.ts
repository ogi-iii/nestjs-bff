import { Reflector } from '@nestjs/core';
import { HttpProxyControllerFactory } from './http-proxy-controller.factory';
import {
  GUARDS_METADATA,
  INTERCEPTORS_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
} from '@nestjs/common/constants';
import { RequestMethod } from '@nestjs/common';
import { NoOpGuard } from '../guards/no-op.guard';
import { StateGuard } from '../guards/state.guard';
import { TokenIntrospectGuard } from '../guards/token-introspect.guard';
import { NoOpInterceptor } from '../interceptors/no-op.interceptor';
import { AuthenticationRequestInterceptor } from '../interceptors/authentication-request.interceptor';
import { TokenRequestInterceptor } from '../interceptors/token-request.interceptor';

describe('create dynamic controller', () => {
  const reflector = new Reflector();

  it('to proxy http requests', () => {
    const endpoints = [
      {
        path: '/test/post',
        method: 'POST',
        authorize: {
          type: 'introspect',
          url: '',
        },
        requestConfig: {
          url: '',
          method: '',
        },
      },
      {
        path: '/test/get',
        method: 'GET',
        authorize: {
          type: 'state',
          url: '',
        },
        requestConfig: {
          url: '',
          method: '',
        },
      },
      {
        path: '/test/put',
        method: 'PUT',
        requestConfig: {
          url: '',
          method: '',
        },
      },
      {
        path: '/test/patch',
        method: 'PATCH',
        requestConfig: {
          url: '',
          method: '',
        },
      },
      {
        path: '/test/delete',
        method: 'DELETE',
        requestConfig: {
          url: '',
          method: '',
        },
      },
      {
        path: '/test/login',
        method: 'GET',
        authenticate: {
          type: 'code',
        },
        requestConfig: {
          url: '',
          method: '',
        },
      },
      {
        path: '/test/token',
        method: 'GET',
        authenticate: {
          type: 'token',
        },
        requestConfig: {
          url: '',
          method: '',
        },
      },
    ];
    const dynamicProxyControllers =
      HttpProxyControllerFactory.create(endpoints);
    expect(dynamicProxyControllers.length).toEqual(7);

    for (let i = 0; i < dynamicProxyControllers.length; i++) {
      const endpoint = endpoints[i];
      const dynamicProxyController = dynamicProxyControllers[i];

      const controllerPath = reflector.get(
        PATH_METADATA,
        dynamicProxyController,
      );
      expect(controllerPath).toEqual(endpoint.path);

      const controllerGuards = reflector.get(
        GUARDS_METADATA,
        dynamicProxyController.prototype.handleRequest,
      );
      expect(controllerGuards.length).toEqual(1);
      if (!endpoint.authorize) {
        expect(controllerGuards[0]).toBe(NoOpGuard);
      } else if (endpoint.authorize.type === 'state') {
        expect(controllerGuards[0]).toBe(StateGuard);
      } else if (endpoint.authorize.type === 'introspect') {
        expect(controllerGuards[0]).toBeInstanceOf(TokenIntrospectGuard);
      }

      const controllerInterceptors = reflector.get(
        INTERCEPTORS_METADATA,
        dynamicProxyController.prototype.handleRequest,
      );
      expect(controllerInterceptors.length).toEqual(1);
      if (!endpoint.authenticate) {
        expect(controllerInterceptors[0]).toBe(NoOpInterceptor);
      } else if (endpoint.authenticate.type === 'code') {
        expect(controllerInterceptors[0]).toBe(
          AuthenticationRequestInterceptor,
        );
      } else if (endpoint.authenticate.type === 'token') {
        expect(controllerInterceptors[0]).toBe(TokenRequestInterceptor);
      }

      const controllerMethod = reflector.get(
        METHOD_METADATA,
        dynamicProxyController.prototype.handleRequest,
      );
      expect(RequestMethod[controllerMethod].toString()).toEqual(
        endpoint.method,
      );
    }
  });

  it('to proxy http request as redirect', () => {
    const endpoints = [
      {
        path: '/test/redirect',
        method: 'GET',
        requestConfig: {
          url: 'https://example.com/{{param}}',
          method: '',
          isRedirect: true,
        },
      },
    ];
    const dynamicProxyControllers =
      HttpProxyControllerFactory.create(endpoints);
    expect(dynamicProxyControllers.length).toEqual(1);

    const dynamicProxyController = dynamicProxyControllers[0];
    const endpoint = endpoints[0];
    const controllerPath = reflector.get(PATH_METADATA, dynamicProxyController);
    expect(controllerPath).toEqual(endpoint.path);

    const controllerMethod = reflector.get(
      METHOD_METADATA,
      dynamicProxyController.prototype.handleRequest,
    );
    expect(RequestMethod[controllerMethod].toString()).toEqual(endpoint.method);

    const controllerGuards = reflector.get(
      GUARDS_METADATA,
      dynamicProxyController.prototype.handleRequest,
    );
    expect(controllerGuards.length).toEqual(1);
    expect(controllerGuards[0]).toBe(NoOpGuard);

    const controllerInterceptors = reflector.get(
      INTERCEPTORS_METADATA,
      dynamicProxyController.prototype.handleRequest,
    );
    expect(controllerInterceptors.length).toEqual(1);
    expect(controllerInterceptors[0]).toBe(NoOpInterceptor);
  });

  it('to handle unsupported HTTP methods', () => {
    const endpoints = [
      {
        path: '/test/unsupported',
        method: 'INVALID',
        requestConfig: {
          url: '',
          method: '',
        },
      },
    ];
    expect(() => HttpProxyControllerFactory.create(endpoints)).toThrow(
      `Unsupported HTTP method: ${endpoints[0].method.toLowerCase()}`,
    );
  });

  it('to handle unsupported authentication interceptor types', () => {
    const endpoints = [
      {
        path: '/test/unsupported-auth',
        method: 'GET',
        authenticate: {
          type: 'unsupported',
        },
        requestConfig: {
          url: '',
          method: '',
        },
      },
    ];
    expect(() => HttpProxyControllerFactory.create(endpoints)).toThrow(
      `Unsupported authentication interceptor type: ${endpoints[0].authenticate.type}`,
    );
  });

  it('to handle unsupported authorization guard types', () => {
    const endpoints = [
      {
        path: '/test/unsupported-guard',
        method: 'GET',
        authorize: {
          type: 'unsupported',
          url: '',
        },
        requestConfig: {
          url: '',
          method: '',
        },
      },
    ];
    expect(() => HttpProxyControllerFactory.create(endpoints)).toThrow(
      `Unsupported authorization guard type: ${endpoints[0].authorize.type}`,
    );
  });
});
