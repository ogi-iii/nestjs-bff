import { DynamicModule, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { HttpProxyControllerFactory } from '../factories/http-proxy-controller.factory';
import { YamlConfigLoader } from '../loaders/yaml-config.loader';
import { HttpProxyService } from '../proxies/http-proxy.service';
import { TokenCacheService } from '../caches/token-cache.service';

/**
 * Http Proxy Module
 */
@Module({
  imports: [
    // Cache Manager using Keyv to connect Redis
    CacheModule.registerAsync({
      useFactory: async () => {
        return {
          stores: [
            createKeyv(
              `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
            ),
          ],
        };
      },
    }),
  ],
})
export class HttpProxyModule {
  /**
   * Register dynamic module.
   *
   * @returns Dynamic module which contains the controllers created from yaml configs.
   */
  static register(): DynamicModule {
    const yamlConfig = YamlConfigLoader.load(process.env.YAML_CONFIG_DIR_PATH);
    const controllers = HttpProxyControllerFactory.create(yamlConfig.endpoints);

    return {
      module: HttpProxyModule,
      controllers: controllers,
      providers: [HttpProxyService, TokenCacheService],
    };
  }
}
