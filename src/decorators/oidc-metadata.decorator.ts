import { Reflector } from '@nestjs/core';

export const OIDCMetadata = Reflector.createDecorator<string>();
