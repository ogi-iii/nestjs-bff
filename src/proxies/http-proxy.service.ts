import { Injectable } from '@nestjs/common';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpRequestConfigDto } from './dto/http-request-config.dto';
import { Request } from 'express';

/**
 * Http Request Proxy Service
 */
@Injectable()
export class HttpProxyService {
  /**
   * Proxy http request.
   *
   * @param requestConfigDto Dto which contains http request configs.
   * @param request Http request data.
   * @returns Http response.
   */
  async proxyHttpRequest(
    requestConfigDto: HttpRequestConfigDto,
    request: Request,
  ): Promise<AxiosResponse> {
    const requestMethod = requestConfigDto.method.toUpperCase();
    const requestData =
      request.method.toUpperCase() === 'GET' ? request.query : request.body;
    const axiosRequestConfig: AxiosRequestConfig = {
      method: requestMethod,
      url: requestConfigDto.url.replace(
        /{{(\w+)}}/g,
        (_, key) => requestData[key],
      ),
      headers: requestConfigDto.headers
        ? this.interpolateValuesToJSON(
            requestConfigDto.headers,
            request.headers,
          )
        : undefined,
    };

    const body = requestConfigDto.body
      ? this.interpolateValuesToJSON(requestConfigDto.body, requestData)
      : undefined;
    if (requestMethod === 'GET') {
      // Axios GET request can NOT contain 'data' field.
      axiosRequestConfig.params = body;
    } else {
      axiosRequestConfig.data =
        axiosRequestConfig.headers &&
        axiosRequestConfig.headers['Content-Type'] ===
          'application/x-www-form-urlencoded'
          ? Object.keys(body)
              .map(
                (key) =>
                  `${encodeURIComponent(key)}=${encodeURIComponent(body[key])}`,
              )
              .join('&')
          : body;
    }

    try {
      const response = await axios(axiosRequestConfig);
      return response;
    } catch (err) {
      return (err as AxiosError).response;
    }
  }

  /**
   * Interpolate request data into JSON template for http request.
   *
   * @param template JSON template object.
   * @param requestData http request data.
   * @returns JSON string for http request.
   */
  private interpolateValuesToJSON(
    template: object,
    requestData: object,
  ): object {
    return JSON.parse(
      JSON.stringify(template).replace(
        /{{(\w+)}}/g,
        (_, key) => requestData[key],
      ),
    );
  }
}
