import { DynamicModule, Module } from '@nestjs/common';
import { config } from 'dotenv';
import { HttpProxyControllerFactory } from '../factories/http-proxy-controller.factory';
import { YamlConfigLoader } from '../loaders/yaml-config.loader';
import { HttpProxyService } from '../proxies/http-proxy.service';
import { NoOpGuard } from '../guards/no-op.guard';
import { StateGuard } from '../guards/state.guard';
import { TokenIntrospectGuard } from '../guards/token-introspect.guard';
import { NoOpInterceptor } from '../interceptors/no-op.interceptor';
import { AuthenticationRequestInterceptor } from '../interceptors/authentication-request.interceptor';
import { TokenRequestInterceptor } from '../interceptors/token-request.interceptor';

/**
 * Http Proxy Module
 */
@Module({})
export class HttpProxyModule {
  /**
   * Register dynamic module.
   *
   * @returns Dynamic module which contains the controllers created from yaml configs.
   */
  static register(): DynamicModule {
    config();
    const yamlConfig = YamlConfigLoader.load(process.env.YAML_CONFIG_DIR_PATH);
    const controllers = HttpProxyControllerFactory.create(yamlConfig.endpoints);

    return {
      module: HttpProxyModule,
      controllers: controllers,
      providers: [
        HttpProxyService,
        NoOpGuard,
        StateGuard,
        TokenIntrospectGuard,
        NoOpInterceptor,
        AuthenticationRequestInterceptor,
        TokenRequestInterceptor,
      ],
    };
  }
}
