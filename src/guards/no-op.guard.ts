/* eslint-disable */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

/**
 * No Operation Guard
 */
@Injectable()
export class NoOpGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true;
  }
}
