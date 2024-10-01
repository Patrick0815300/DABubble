import { TestBed } from '@angular/core/testing';

import { ReactionServiceService } from './reaction-service.service';

describe('ReactionServiceService', () => {
  let service: ReactionServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReactionServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
