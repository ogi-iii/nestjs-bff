import { DynamicModule, Module } from '@nestjs/common';
import { config } from 'dotenv';
import { HttpProxyControllerFactory } from 'src/factories/http-proxy-controller.factory';
import { YamlConfigLoader } from 'src/loaders/yaml-config.loader';
import { HttpProxyService } from 'src/proxies/http-proxy.service';

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
      providers: [HttpProxyService],
    };
  }
}
