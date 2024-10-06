import { Reflector } from '@nestjs/core';
import { DynamicProxyControllerFactory } from './dynamic-proxy-controller.factory';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { RequestMethod } from '@nestjs/common';

describe('create dynamic controller', () => {
  const reflector = new Reflector();

  it('to proxy http requests', () => {
    const yamlConfigDto = {
      endpoints: [
        {
          path: '/test/post',
          method: 'POST',
          requestConfig: {},
        },
        {
          path: '/test/get',
          method: 'GET',
          requestConfig: {},
        },
        {
          path: '/test/put',
          method: 'PUT',
          requestConfig: {},
        },
        {
          path: '/test/patch',
          method: 'PATCH',
          requestConfig: {},
        },
        {
          path: '/test/delete',
          method: 'DELETE',
          requestConfig: {},
        },
      ],
    };
    const dynamicProxyControllers =
      DynamicProxyControllerFactory.create(yamlConfigDto);
    expect(dynamicProxyControllers.length).toEqual(5);

    for (let i = 0; i < dynamicProxyControllers.length; i++) {
      const endpoint = yamlConfigDto.endpoints[i];
      const dynamicProxyController = dynamicProxyControllers[i];

      const controllerPath = reflector.get(
        PATH_METADATA,
        dynamicProxyController,
      );
      expect(controllerPath).toEqual(endpoint.path);

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
