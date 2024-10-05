import { loadYamlConfig } from './config.loader';

describe('load config from yaml files', () => {
  it('in the default target dir', () => {
    const yamlConfig = loadYamlConfig();
    expect(yamlConfig.endpoints.length).toEqual(4);
    yamlConfig.endpoints.forEach((endpoint) => {
      expect(endpoint).toHaveProperty('path');
      expect(endpoint).toHaveProperty('method');
      expect(endpoint).toHaveProperty('requestConfig');
      expect(endpoint.requestConfig).toHaveProperty('url');
      expect(endpoint.requestConfig).toHaveProperty('method');
      if (endpoint.requestConfig.method.toUpperCase() === 'POST') {
        expect(endpoint.requestConfig).toHaveProperty('headers');
        expect(endpoint.requestConfig).toHaveProperty('body');
      }
    });
  });

  it('in the target dir which does NOT exist', () => {
    expect(() => {
      loadYamlConfig('./DOES_NOT_EXIST');
    }).toThrow();
  });

  it('in the target dir which does NOT contain any yaml file', () => {
    const yamlConfig = loadYamlConfig('./node_modules');
    expect(yamlConfig.endpoints.length).toEqual(0);
  });
});
