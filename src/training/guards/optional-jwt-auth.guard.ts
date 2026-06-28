import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Attaches user when JWT is present; does not block when missing. */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization as string | undefined;
    if (!authHeader?.startsWith('Bearer ')) {
      return true;
    }
    return (super.canActivate(context) as Promise<boolean>).catch(() => true);
  }

  handleRequest<TUser = unknown>(err: Error, user: TUser): TUser | null {
    if (err || !user) {
      return null;
    }
    return user;
  }
}
