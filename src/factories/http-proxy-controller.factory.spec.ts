import { Reflector } from '@nestjs/core';
import { HttpProxyControllerFactory } from './http-proxy-controller.factory';
import {
  GUARDS_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
} from '@nestjs/common/constants';
import { RequestMethod } from '@nestjs/common';
import { TokenIntrospectGuard } from '../guards/token-introspect.guard';
import { NoOpGuard } from '../guards/no-op.guard';
import { StatePkceGuard } from '../guards/state-pkce.guard';

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
          type: 'stateAndPKCE',
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
    ];
    const dynamicProxyControllers =
      HttpProxyControllerFactory.create(endpoints);
    expect(dynamicProxyControllers.length).toEqual(5);

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
      } else if (endpoint.authorize.type === 'introspect') {
        expect(controllerGuards[0]).toBeInstanceOf(TokenIntrospectGuard);
      } else if (endpoint.authorize.type === 'stateAndPKCE') {
        expect(controllerGuards[0]).toBe(StatePkceGuard);
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
});
