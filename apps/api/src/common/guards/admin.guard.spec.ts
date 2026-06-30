import { AdminGuard } from './admin.guard';
import { ExecutionContext } from '@nestjs/common';

describe('AdminGuard', () => {
  let guard: AdminGuard;

  beforeEach(() => {
    guard = new AdminGuard();
  });

  const mockContext = (user: any): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as unknown as ExecutionContext;

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when user role is ADMIN', () => {
    const context = mockContext({ id: 'user-1', role: 'ADMIN' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when user role is MANAGER', () => {
    const context = mockContext({ id: 'user-2', role: 'MANAGER' });
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should deny access when user role is RECEPTIONIST', () => {
    const context = mockContext({ id: 'user-3', role: 'RECEPTIONIST' });
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should deny access when user role is OWNER', () => {
    const context = mockContext({ id: 'user-4', role: 'OWNER' });
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should deny access when no user is present', () => {
    const context = mockContext(null);
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should deny access when user has no role', () => {
    const context = mockContext({ id: 'user-5' });
    expect(guard.canActivate(context)).toBe(false);
  });
});
