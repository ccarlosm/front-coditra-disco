import { TestBed } from '@angular/core/testing';

import { LpsService } from './lps.service';

describe('LpsService', () => {
  let service: LpsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LpsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
