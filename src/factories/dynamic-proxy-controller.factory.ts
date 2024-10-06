import {
  Controller,
  Delete,
  Get,
  Head,
  HttpException,
  Options,
  Patch,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { HttpProxyService } from '../proxies/http-proxy.service';
import { YamlConfigDto } from '../loaders/dto/yaml-config.dto';
import { ControllerEndpointDto } from './dto/controller-endpoint.dto';
import { Request } from 'express';

/**
 * Dynamic Controller Factory for Http Proxy
 */
export class DynamicProxyControllerFactory {
  /**
   * Create the list of dynamic controllers for http request proxy.
   *
   * @param yamlConfig Dto which contains config values from yaml files.
   * @returns List of dynamic controllers.
   */
  static create(yamlConfig: YamlConfigDto): any[] {
    return yamlConfig.endpoints.map((endpoint: ControllerEndpointDto) => {
      const path = endpoint.path;
      const method = endpoint.method.toLowerCase();

      @Controller(path)
      class DynamicProxyController {
        constructor(private readonly httpProxyService: HttpProxyService) {}

        @(DynamicProxyControllerFactory.getHttpMethodDecorator(method)())
        async handleRequest(@Req() request: Request) {
          try {
            const response = await this.httpProxyService.proxyHttpRequest(
              endpoint.requestConfig,
              request,
            );
            return response;
          } catch (error) {
            throw new HttpException(error.message, 500);
          }
        }
      }

      return DynamicProxyController;
    });
  }

  /**
   * Get decorator of dynamic controller from http method name.
   *
   * @param method Http method name.
   * @returns Decorator of dynamic controller.
   */
  private static getHttpMethodDecorator(method: string) {
    const methodDecoratorMap = {
      get: Get,
      post: Post,
      put: Put,
      delete: Delete,
      patch: Patch,
      head: Head,
      options: Options,
    };

    const decorator = methodDecoratorMap[method];
    if (!decorator) {
      throw new Error(`Unsupported HTTP method: ${method}`);
    }

    return decorator;
  }
}
