import { describe, expect, it } from 'vitest';
import { getPasswordRequirements, isPasswordValid } from '../auth/passwordPolicy';
import { getAuthErrorMessage } from '../auth/authErrors';

describe('password policy', () => {
  it('requires length, uppercase, lowercase, number and special character', () => {
    expect(isPasswordValid('Mechcalc1!')).toBe(true);
    for (const invalid of ['short1!', 'lowercase1!', 'UPPERCASE1!', 'NoNumber!', 'NoSpecial1']) {
      expect(isPasswordValid(invalid)).toBe(false);
    }
  });

  it('reports each requirement independently', () => {
    expect(getPasswordRequirements('abc')).toEqual([
      { id: 'length', label: 'At least 8 characters', met: false },
      { id: 'uppercase', label: 'One uppercase letter', met: false },
      { id: 'lowercase', label: 'One lowercase letter', met: true },
      { id: 'number', label: 'One number', met: false },
      { id: 'special', label: 'One special character', met: false },
    ]);
  });
});

describe('authentication error messages', () => {
  it('gives the authorized-domain fix for Google sign-in', () => {
    expect(getAuthErrorMessage({ code: 'auth/unauthorized-domain' })).toContain('Add localhost');
  });

  it('exposes unknown Firebase error codes for diagnosis', () => {
    expect(getAuthErrorMessage({ code: 'auth/invalid-oauth-client-id' })).toContain('Google OAuth');
    expect(getAuthErrorMessage({ code: 'auth/unexpected-code' })).toContain('auth/unexpected-code');
  });
});
