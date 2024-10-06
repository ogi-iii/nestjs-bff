import { Injectable } from '@nestjs/common';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpRequestConfigDto } from './dto/http-request-config.dto';

/**
 * Http Request Proxy Service
 */
@Injectable()
export class HttpProxyService {
  /**
   * Proxy http request.
   *
   * @param requestConfigDto Dto which contains http request configs.
   * @param requestData Http request data.
   * @returns Http response.
   */
  async proxyHttpRequest(
    requestConfigDto: HttpRequestConfigDto,
    requestData: object,
  ): Promise<AxiosResponse> {
    const requestMethod = requestConfigDto.method.toUpperCase();
    const axiosRequestConfig: AxiosRequestConfig = {
      method: requestMethod,
      url: requestConfigDto.url.replace(
        /{{(\w+)}}/g,
        (_, key) => requestData[key],
      ),
      headers: this.interpolateValues(requestConfigDto.headers, requestData),
    };

    const body = requestConfigDto.body
      ? this.interpolateValues(requestConfigDto.body, requestData)
      : undefined;
    if (requestMethod === 'GET') {
      // Axios GET request can NOT contain 'data' field.
      axiosRequestConfig.params = body;
    } else {
      axiosRequestConfig.data = body;
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
  private interpolateValues(template: object, requestData: object): object {
    return JSON.parse(
      JSON.stringify(template).replace(
        /{{(\w+)}}/g,
        (_, key) => requestData[key],
      ),
    );
  }
}
