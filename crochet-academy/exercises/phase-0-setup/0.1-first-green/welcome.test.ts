import { describe, expect, it } from 'vitest';
import { welcome } from '@/core/welcome';

describe('0.1 welcome', () => {
  it('greets by name', () => {
    expect(welcome('Ana')).toBe('Welcome to the nook, Ana!');
  });

  it('ignores spaces around the name', () => {
    expect(welcome('  Ana  ')).toBe('Welcome to the nook, Ana!');
  });

  it('greets "friend" when the name is empty', () => {
    expect(welcome('')).toBe('Welcome to the nook, friend!');
    expect(welcome('   ')).toBe('Welcome to the nook, friend!');
  });
});
