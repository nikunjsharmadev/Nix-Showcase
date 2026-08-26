import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { Guards } from './guard';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => TestBed.runInInjectionContext(() => Guards().auth(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
