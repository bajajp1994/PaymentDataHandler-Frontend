import { Component, OnInit  } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialogActions, MatDialogContent, MatDialogRef} from '@angular/material/dialog';
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import { MatTableModule} from '@angular/material/table';
import {CommonModule} from '@angular/common';
import {MatOption} from '@angular/material/core';
import {MatSelect, MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {CountryCurrencyService} from '../services/country-currency.service';
import {HttpClientModule} from '@angular/common/http';
import {MatAutocomplete, MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {PaymentService} from '../services/payment.service';

export interface Country {
  name: string;
  alpha2Code: string;
  cities: string[];
}

export interface Currency {
  code: string;
  name: string;
}

@Component({
  selector: 'app-add-payment',
  imports: [
    MatFormField,
    FormsModule,
    MatTableModule,
    CommonModule,
    MatDialogContent,
    MatOption,
    MatDialogActions,
    ReactiveFormsModule,
    MatSelect,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    MatAutocompleteTrigger,
    MatAutocomplete
  ],
  providers: [CountryCurrencyService],
  templateUrl: './add-payment.component.html',
  styleUrl: './add-payment.component.css'
})
export class AddPaymentComponent implements OnInit {
  addPaymentForm!: FormGroup;
  countries: Country[] = [];
  currencies: Currency[] = [];
  cities: string[] = [];
  errorMessage: string = "";
  constructor(
    private fb: FormBuilder,
    private countryCurrencyService: CountryCurrencyService,
    private dialogRef: MatDialogRef<AddPaymentComponent>,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.errorMessage = "";
    this.initializeForm();
    this.fetchCountries();
    this.fetchCurrencies();

    this.addPaymentForm.valueChanges.subscribe(() => {
      for (const controlName in this.addPaymentForm.controls) {
        const control = this.addPaymentForm.controls[controlName];
        if (control.invalid) {
          console.log(`${controlName} is invalid. Errors:`, control.errors);
        }
      }
    });
  }

  initializeForm(): void {
    this.addPaymentForm = this.fb.group({
      payee_first_name: ['', Validators.required],
      payee_last_name: ['', Validators.required],
      payee_payment_status: [''],
      payee_added_date_utc: [new Date()],
      payee_due_date: ['', Validators.required],
      payee_address_line_1: ['', Validators.required],
      payee_address_line_2: [''],
      payee_city: ['', Validators.required],
      payee_country: ['', Validators.required],
      payee_province_or_state: [''],
      payee_postal_code: ['', Validators.required],
      payee_phone_number: ['', [Validators.required, Validators.pattern('^\\+?[1-9][0-9]*$')]],
      payee_email: ['', [Validators.required, Validators.email]],
      currency: ['', Validators.required],
      due_amount: ['', Validators.required],
      discount_percent: [null, [Validators.min(0), Validators.max(100)]],
      tax_percent: [null, [Validators.min(0), Validators.max(100)]],
    });
  }

  fetchCurrencies(): void {
    this.countryCurrencyService.fetchCurrencies().subscribe(response => {
      this.currencies = response.data.map((currencyData: any) => ({
        code: currencyData.currency,
        name: currencyData.currency
      }));
    });
  }

  fetchCountries(): void {
    this.countryCurrencyService.fetchCountries().subscribe(response => {
      this.countries = response.data.map((country: any) => ({
        name: country.country,
        alpha2Code: country.iso2,
        cities: country.cities
      }));

      this.currencies = response.data.map((country: any) => ({
        code: country.currency,
        name: country.currency
      }));
    });
  }

  onCountrySelect(countryAlphaCode: string): void {
    const selectedCountry = this.countries.find(country => country.alpha2Code === countryAlphaCode);
    if (selectedCountry) {
      this.cities = selectedCountry.cities; // Set cities for the selected country
    }
  }

  onCurrencySelect(event: any): void {
    const selectedCurrencyCode = event.value;
    const selectedCurrency = this.currencies.find(currency => currency.code === selectedCurrencyCode);
    if (selectedCurrency) {
      console.log('Selected Currency:', selectedCurrency);
    }
  }


  submitForm(): void {
    console.log('Form Valid:', this.addPaymentForm.valid);
    if (this.addPaymentForm.valid) {
      const paymentData = {
        ...this.addPaymentForm.value,
        payee_added_date_utc: new Date().toISOString(),
        payee_payment_status: 'pending',
      };
      // Call the createPayment method (similarly to downloadEvidence)
      this.paymentService.createPayment(paymentData)
        .then((response) => {
          console.log('Payment created successfully:', response);
          this.dialogRef.close(paymentData);  // Close dialog after success
        })
        .catch((error) => {
          this.errorMessage = 'Failed to create payment due to this error: ' + error.message;
          console.error('Error creating payment:', error);  // Handle error
        });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';  // Error if the form is not valid
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
