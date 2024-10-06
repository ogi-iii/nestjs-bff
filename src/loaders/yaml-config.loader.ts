import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { YamlConfigDto } from './dto/yaml-config.dto';

/**
 * Yaml Config File Loader
 */
export class YamlConfigLoader {
  static DEFAULT_YAML_CONFIG_DIR_PATH = './config/';

  /**
   * Load config values from yaml files in the target directory.
   *
   * @param dirPath Target directory path which contains yaml files.
   * @returns Dto which contains config values from yaml files.
   * @throws Error if the target directory was NOT found.
   */
  static load(
    dirPath = YamlConfigLoader.DEFAULT_YAML_CONFIG_DIR_PATH,
  ): YamlConfigDto {
    const directoryPath = dirPath
      ? dirPath
      : YamlConfigLoader.DEFAULT_YAML_CONFIG_DIR_PATH;
    const files = fs.readdirSync(directoryPath);
    const yamlFiles = files.filter(
      (file) => file.endsWith('.yaml') || file.endsWith('.yml'),
    );

    const yamlConfigs: any[] = yamlFiles.map((file) => {
      const filePath = path.join(directoryPath, file);
      try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        return yaml.load(fileContents);
      } catch (err) {
        console.error('failed to load yaml file:', err);
        return {};
      }
    });

    // aggregate loaded config values into a dto
    return {
      endpoints: yamlConfigs.reduce((acc, config) => {
        if (
          typeof config === 'object' &&
          config !== null &&
          'endpoints' in config
        ) {
          const endpoints = config.endpoints || [];
          return [...acc, ...endpoints];
        }
        return acc;
      }, []),
    };
  }
}