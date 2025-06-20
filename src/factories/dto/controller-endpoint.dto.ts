import { HttpRequestConfigDto } from '../../proxies/dto/http-request-config.dto';

export class ControllerEndpointDto {
  path: string;
  method: string;
  authenticate?: {
    type: string;
  };
  authorize?: {
    type: string;
    url: string;
  };
  requestConfig: HttpRequestConfigDto & { isRedirect?: boolean };
}
