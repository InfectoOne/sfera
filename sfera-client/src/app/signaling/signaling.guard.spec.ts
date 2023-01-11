import { TestBed } from '@angular/core/testing';

import { SignalingGuard } from './signaling.guard';

describe('SignalingGuard', () => {
  let guard: SignalingGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(SignalingGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
