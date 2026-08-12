import { describe, it, expect } from 'vitest';
import { isReservedUsername, RESERVED_USERNAMES } from '@/services/auth';

describe('Auth & Username Security Service', () => {
  it('should block exact reserved usernames regardless of case', () => {
    expect(isReservedUsername('admin')).toBe(true);
    expect(isReservedUsername('ADMIN')).toBe(true);
    expect(isReservedUsername(' Admin ')).toBe(true);
    expect(isReservedUsername('system')).toBe(true);
    expect(isReservedUsername('lunarys')).toBe(true);
  });

  it('should allow normal usernames that are not reserved', () => {
    expect(isReservedUsername('tinonurcahya')).toBe(false);
    expect(isReservedUsername('johndoe123')).toBe(false);
    expect(isReservedUsername('kutipan_senja')).toBe(false);
  });

  it('should have predefined reserved usernames list', () => {
    expect(RESERVED_USERNAMES).toContain('admin');
    expect(RESERVED_USERNAMES).toContain('moderator');
    expect(RESERVED_USERNAMES).toContain('support');
  });
});
