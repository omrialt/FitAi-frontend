import { describe, expect, it } from 'vitest';
import { isNavActive, navOwnerFor } from './navMatch';

describe('navOwnerFor', () => {
  it('maps detail routes to the list that owns them', () => {
    expect(navOwnerFor('/training-plans/abc')).toBe('/my-trainings');
    expect(navOwnerFor('/workout/abc/0')).toBe('/my-trainings');
    expect(navOwnerFor('/log-meal')).toBe('/nutrition-plans');
  });

  it('leaves other paths alone', () => {
    expect(navOwnerFor('/nutrition-plans/xyz')).toBe('/nutrition-plans/xyz');
    expect(navOwnerFor('/schedule')).toBe('/schedule');
  });
});

describe('isNavActive', () => {
  it('matches home only exactly', () => {
    expect(isNavActive('/', '/')).toBe(true);
    expect(isNavActive('/', '/my-trainings')).toBe(false);
  });

  it('lights a list tab on its detail screens', () => {
    expect(isNavActive('/my-trainings', '/training-plans/abc')).toBe(true);
    expect(isNavActive('/nutrition-plans', '/nutrition-plans/xyz')).toBe(true);
    expect(isNavActive('/clients', '/clients/42')).toBe(true);
  });

  it('lights only the nested destination, not its parent', () => {
    expect(isNavActive('/clients/overview', '/clients/overview')).toBe(true);
    expect(isNavActive('/clients', '/clients/overview')).toBe(false);
  });

  it('does not match on a shared string prefix', () => {
    expect(isNavActive('/clients', '/clientsettings')).toBe(false);
  });
});
