import { Request } from 'express';
import { HttpRequestConfigDto } from './dto/http-request-config.dto';
import { HttpProxyService } from './http-proxy.service';

describe('proxy http request', () => {
  const rootUrl = 'https://jsonplaceholder.typicode.com';
  const httpProxyService = new HttpProxyService();

  it('as POST method to the target url with json body', async () => {
    const requestConfigDto: HttpRequestConfigDto = {
      url: rootUrl + '/posts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        name: '{{name}}',
        email: '{{email}}',
      },
    };
    const requestData = {
      name: 'test',
      email: 'test@example.com',
    };
    const request = {
      query: {},
      params: {},
      body: requestData,
      headers: {},
      method: 'POST',
    } as unknown as Request;
    const response = await httpProxyService.proxyHttpRequest(
      requestConfigDto,
      request,
    );
    expect(response.status).toEqual(201);
    expect(response.data).toHaveProperty('name', requestData.name);
    expect(response.data).toHaveProperty('email', requestData.email);
  });

  it('as POST method to the target url with x-www-form-urlencoded body', async () => {
    const requestConfigDto: HttpRequestConfigDto = {
      url: rootUrl + '/posts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: {
        name: '{{name}}',
        email: '{{email}}',
      },
    };
    const requestData = {
      name: 'test',
      email: 'test@example.com',
    };
    const request = {
      query: {},
      params: {},
      body: requestData,
      headers: {},
      method: 'POST',
    } as unknown as Request;
    const response = await httpProxyService.proxyHttpRequest(
      requestConfigDto,
      request,
    );
    expect(response.status).toEqual(201);
    expect(response.data).toHaveProperty('name', requestData.name);
    expect(response.data).toHaveProperty('email', requestData.email);
  });

  it('as GET method to the target url with path param', async () => {
    const requestConfigDto: HttpRequestConfigDto = {
      url: rootUrl + '/posts/{{postId}}/comments',
      method: 'GET',
      headers: {},
      body: {},
    };
    const requestData = {
      postId: 11,
    };
    const request = {
      query: requestData,
      params: {},
      body: {},
      headers: {},
      method: 'GET',
    } as unknown as Request;
    const response = await httpProxyService.proxyHttpRequest(
      requestConfigDto,
      request,
    );
    expect(response.status).toEqual(200);
    expect(response.data.length).not.toEqual(0);
    expect(response.data[0]).toHaveProperty('postId', requestData.postId);
  });

  it('as GET method to the target url with query param', async () => {
    const requestConfigDto: HttpRequestConfigDto = {
      url: rootUrl + '/comments?postId={{postId}}',
      method: 'get', // will be uppercase
      headers: {},
      body: {},
    };
    const requestData = {
      postId: 22,
    };
    const request = {
      query: {},
      params: {},
      body: requestData,
      headers: {},
      method: 'POST',
    } as unknown as Request;
    const response = await httpProxyService.proxyHttpRequest(
      requestConfigDto,
      request,
    );
    expect(response.status).toEqual(200);
    expect(response.data.length).not.toEqual(0);
    expect(response.data[0]).toHaveProperty('postId', requestData.postId);
  });

  it('as PUT method to the target url', async () => {
    const requestConfigDto: HttpRequestConfigDto = {
      url: rootUrl + '/posts/{{id}}',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        name: '{{name}}',
        email: '{{email}}',
      },
    };
    const requestData = {
      id: 33,
      name: 'test',
      email: 'test@example.com',
    };
    const request = {
      query: requestData,
      params: {},
      body: {},
      headers: {},
      method: 'GET',
    } as unknown as Request;
    const response = await httpProxyService.proxyHttpRequest(
      requestConfigDto,
      request,
    );
    expect(response.status).toEqual(200);
    expect(response.data).toHaveProperty('id', requestData.id);
    expect(response.data).toHaveProperty('name', requestData.name);
    expect(response.data).toHaveProperty('email', requestData.email);
  });

  it('as PATCH method to the target url', async () => {
    const requestConfigDto: HttpRequestConfigDto = {
      url: rootUrl + '/posts/{{id}}',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        name: '{{name}}',
        email: '{{email}}',
      },
    };
    const requestData = {
      id: 44,
      name: 'test',
      email: 'test@example.com',
    };
    const request = {
      query: {},
      params: {},
      body: requestData,
      headers: {},
      method: 'POST',
    } as unknown as Request;
    const response = await httpProxyService.proxyHttpRequest(
      requestConfigDto,
      request,
    );
    expect(response.status).toEqual(200);
    expect(response.data).toHaveProperty('id', requestData.id);
    expect(response.data).toHaveProperty('name', requestData.name);
    expect(response.data).toHaveProperty('email', requestData.email);
  });

  it('as DELETE method to the target url', async () => {
    const requestConfigDto: HttpRequestConfigDto = {
      url: rootUrl + '/posts/{{id}}',
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        name: '{{name}}',
        email: '{{email}}',
      },
    };
    const requestData = {
      id: 55,
      name: 'test',
      email: 'test@example.com',
    };
    const request = {
      query: requestData,
      params: {},
      body: {},
      headers: {},
      method: 'GET',
    } as unknown as Request;
    const response = await httpProxyService.proxyHttpRequest(
      requestConfigDto,
      request,
    );
    expect(response.status).toEqual(200);
    expect(response.data).toEqual({});
  });

  it('as POST method to the invalid url', async () => {
    const requestConfigDto: HttpRequestConfigDto = {
      url: rootUrl + '/invalid',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        name: '{{name}}',
        email: '{{email}}',
      },
    };
    const requestData = {
      name: 'test',
      email: 'test@example.com',
    };
    const request = {
      query: {},
      params: {},
      body: requestData,
      headers: {},
      method: 'POST',
    } as unknown as Request;
    const response = await httpProxyService.proxyHttpRequest(
      requestConfigDto,
      request,
    );
    expect(response.status).toEqual(404);
  });

  it('as GET method to the invalid url', async () => {
    const requestConfigDto: HttpRequestConfigDto = {
      url: rootUrl + '/invalid',
      method: 'GET',
      headers: {},
      body: {},
    };
    const requestData = {};
    const request = {
      query: requestData,
      params: {},
      body: {},
      headers: {},
      method: 'GET',
    } as unknown as Request;
    const response = await httpProxyService.proxyHttpRequest(
      requestConfigDto,
      request,
    );
    expect(response.status).toEqual(404);
  });

  it('as GET method to the url which returns request headers', async () => {
    const requestConfigDto: HttpRequestConfigDto = {
      url: 'https://httpbin.org/headers',
      method: 'GET',
      headers: {
        Accept: '{{accept}}',
      },
      body: {},
    };
    const requestData = {
      accept: 'application/json',
    };
    const request = {
      query: {},
      params: {},
      body: {},
      headers: requestData,
      method: 'GET',
    } as unknown as Request;
    const response = await httpProxyService.proxyHttpRequest(
      requestConfigDto,
      request,
    );
    expect(response.status).toEqual(200);
    expect(response.data.headers).toHaveProperty('Accept', requestData.accept);
  });
});
