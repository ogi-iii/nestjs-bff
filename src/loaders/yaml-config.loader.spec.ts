import { YamlConfigLoader } from './yaml-config.loader';

describe('load config from yaml files', () => {
  it('in the default target dir which is set as the default argument', () => {
    const yamlConfig = YamlConfigLoader.load('./config');
    expect(yamlConfig.endpoints.length).toEqual(6);
    yamlConfig.endpoints.forEach((endpoint) => {
      expect(endpoint).toHaveProperty('path');
      expect(endpoint).toHaveProperty('method');
      expect(endpoint).toHaveProperty('requestConfig');
      expect(endpoint.requestConfig).toHaveProperty('url');
      if (endpoint.requestConfig.isRedirect) {
        expect(endpoint.requestConfig).toHaveProperty('isRedirect');
        return;
      }
      expect(endpoint.requestConfig).toHaveProperty('method');
      if (endpoint.requestConfig.method.toUpperCase() === 'POST') {
        expect(endpoint.requestConfig).toHaveProperty('headers');
        expect(endpoint.requestConfig).toHaveProperty('body');
      }
    });
  });

  it('in the default target dir which is set as the const value replaced from blank argument', () => {
    const yamlConfig = YamlConfigLoader.load('');
    expect(yamlConfig.endpoints.length).toEqual(6);
    yamlConfig.endpoints.forEach((endpoint) => {
      expect(endpoint).toHaveProperty('path');
      expect(endpoint).toHaveProperty('method');
      expect(endpoint).toHaveProperty('requestConfig');
      if (endpoint.requestConfig.isRedirect) {
        expect(endpoint.requestConfig).toHaveProperty('isRedirect');
        return;
      }
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
      YamlConfigLoader.load('./DOES_NOT_EXIST');
    }).toThrow();
  });

  it('in the target dir which does NOT contain any yaml file', () => {
    const yamlConfig = YamlConfigLoader.load('./node_modules');
    expect(yamlConfig.endpoints.length).toEqual(0);
  });
});
