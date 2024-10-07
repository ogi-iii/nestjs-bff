import { HttpRequestConfigDto } from '../../proxies/dto/http-request-config.dto';

export class ControllerEndpointDto {
  path: string;
  method: string;
  requestConfig: HttpRequestConfigDto & { isRedirect?: boolean };
}
