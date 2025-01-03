import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountryCurrencyService {

  private apiUrl = 'https://countriesnow.space/api/v0.1/countries';
  private currencyApiUrl = 'https://countriesnow.space/api/v0.1/countries/currency';

  constructor(private http: HttpClient) { }

  fetchCountries(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  fetchCurrencies(): Observable<any> {
    return this.http.get<any>(this.currencyApiUrl);
  }
}
