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
import { ControllerEndpointDto } from './dto/controller-endpoint.dto';
import { Request } from 'express';
import { ProxyResponseDto } from './dto/proxy-response.dto';

/**
 * Controller Factory for Http Proxy
 */
export class HttpProxyControllerFactory {
  /**
   * Create the list of controllers for http request proxy.
   *
   * @param endpoints List of dtos which contain endpoints info to create controllers.
   * @returns List of controllers.
   */
  static create(endpoints: ControllerEndpointDto[]): any[] {
    return endpoints.map((endpoint) => {
      const path = endpoint.path;
      const method = endpoint.method.toLowerCase();

      @Controller(path)
      class HttpProxyController {
        constructor(private readonly httpProxyService: HttpProxyService) {}

        @(HttpProxyControllerFactory.getHttpMethodDecorator(method)())
        async handleRequest(
          @Req() request: Request,
        ): Promise<ProxyResponseDto> {
          try {
            const response = await this.httpProxyService.proxyHttpRequest(
              endpoint.requestConfig,
              request,
            );
            return {
              status: response.status,
              headers: response.headers,
              data: response.data,
            };
          } catch (err) {
            throw new HttpException(err.message, 500);
          }
        }
      }

      return HttpProxyController;
    });
  }

  /**
   * Get the decorator for the method of controller from http method name.
   *
   * @param method Http method name.
   * @returns Decorator for the method of controller.
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
