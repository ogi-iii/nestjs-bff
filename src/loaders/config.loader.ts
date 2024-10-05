import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { YamlConfigDto } from './dto/yaml-config.dto';

export function loadYamlConfig(directoryPath = './config/'): YamlConfigDto {
    const files = fs.readdirSync(directoryPath);
    const yamlFiles = files.filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));

    const yamlConfigs: any[] = yamlFiles.map(file => {
        const filePath = path.join(directoryPath, file);
        try {
            const fileContents = fs.readFileSync(filePath, 'utf8');
            return yaml.load(fileContents);
        } catch (e) {
            console.error('failed to load yaml file:', e);
            return {};
        }
    });

    return {
        endpoints: yamlConfigs.reduce(
            (acc, config) => {
                if (typeof config === 'object' && config !== null && 'endpoints' in config) {
                    const endpoints = config.endpoints || [];
                    return [...acc, ...endpoints];
                }
                return acc;
            },
            []
        ),
    };
}
