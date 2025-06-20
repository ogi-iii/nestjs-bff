import {
  Controller,
  Delete,
  Get,
  HttpException,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { HttpProxyService } from '../proxies/http-proxy.service';
import { ControllerEndpointDto } from './dto/controller-endpoint.dto';
import { Request, Response } from 'express';
import { ProxyResponseDto } from './dto/proxy-response.dto';
import { NoOpGuard } from '../guards/no-op.guard';
import { StateGuard } from '../guards/state.guard';
import { TokenIntrospectGuard } from '../guards/token-introspect.guard';
import { NoOpInterceptor } from '../interceptors/no-op.interceptor';
import { AuthenticationRequestInterceptor } from '../interceptors/authentication-request.interceptor';
import { TokenRequestInterceptor } from '../interceptors/token-request.interceptor';

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
      const dataSource = method === 'get' ? 'query' : 'body';

      @Controller(path)
      class HttpProxyController {
        constructor(private readonly httpProxyService: HttpProxyService) {}
        @UseInterceptors(
          HttpProxyControllerFactory.getAuthInterceptor(endpoint),
        )
        @UseGuards(HttpProxyControllerFactory.getAuthGuard(endpoint))
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

      @Controller(path)
      class HttpRedirectController {
        @UseInterceptors(
          HttpProxyControllerFactory.getAuthInterceptor(endpoint),
        )
        @UseGuards(HttpProxyControllerFactory.getAuthGuard(endpoint))
        @(HttpProxyControllerFactory.getHttpMethodDecorator(method)())
        async handleRequest(
          @Req() request: Request,
          @Res() response: Response,
        ): Promise<any> {
          try {
            return response.redirect(
              endpoint.requestConfig.url.replace(
                /{{(\w+)}}/gi,
                (_, key) => request[dataSource][key],
              ),
            );
          } catch (err) {
            throw new HttpException(err.message, 500);
          }
        }
      }

      return endpoint.requestConfig.isRedirect
        ? HttpRedirectController
        : HttpProxyController;
    });
  }

  /**
   * Get the authentication interceptor to handle cookies.
   *
   * @param endpoint Dto which contain the endpoint info to create a controller.
   * @returns Authentication interceptor to handle cookies.
   */
  private static getAuthInterceptor(endpoint: ControllerEndpointDto) {
    if (!endpoint.authenticate) {
      return NoOpInterceptor;
    }
    const authInterceptorMap = {
      code: AuthenticationRequestInterceptor,
      token: TokenRequestInterceptor,
    };
    const authInterceptor = authInterceptorMap[endpoint.authenticate.type];
    if (!authInterceptor) {
      throw new Error(
        `Unsupported authentication interceptor type: ${endpoint.authenticate.type}`,
      );
    }
    return authInterceptor;
  }

  /**
   * Get the authorization guard to protect api access.
   *
   * @param endpoint Dto which contain the endpoint info to create a controller.
   * @returns Authorization guard to protect api access.
   */
  private static getAuthGuard(endpoint: ControllerEndpointDto) {
    if (!endpoint.authorize) {
      return NoOpGuard;
    }
    const authGuardMap = {
      introspect: new TokenIntrospectGuard(endpoint.authorize.url),
      state: StateGuard,
    };
    const authGuard = authGuardMap[endpoint.authorize.type];
    if (!authGuard) {
      throw new Error(
        `Unsupported authorization guard type: ${endpoint.authorize.type}`,
      );
    }
    return authGuard;
  }

  /**
   * Get the decorator for the method of controller from http method name.
   *
   * @param method Http method name.
   * @returns Decorator for the method of controller.
   */
  private static getHttpMethodDecorator(method: string) {
    const methodDecoratorMap = {
      post: Post,
      get: Get,
      put: Put,
      patch: Patch,
      delete: Delete,
    };
    const decorator = methodDecoratorMap[method];
    if (!decorator) {
      throw new Error(`Unsupported HTTP method: ${method}`);
    }
    return decorator;
  }
}
