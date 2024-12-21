import { TestBed } from '@angular/core/testing';

import { CountryCurrencyService } from './country-currency.service';

describe('CountryCurrencyService', () => {
  let service: CountryCurrencyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CountryCurrencyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
