import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from '@angular/material/dialog';
import { CountryCurrencyService } from '../services/country-currency.service';
import { PaymentService } from '../services/payment.service';
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import {MatOption, MatSelect, MatSelectModule} from '@angular/material/select';
import {MatAutocomplete, MatAutocompleteModule, MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {CommonModule, DatePipe} from '@angular/common';
import {
  MatDatepicker,
  MatDatepickerInput, MatDatepickerModule,
  MatDatepickerToggle
} from '@angular/material/datepicker';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {HttpClientModule} from '@angular/common/http';
import {MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule} from '@angular/material/core';
@Component({
  selector: 'app-edit-payment',
  templateUrl: './edit-payment.component.html',
  styleUrls: ['./edit-payment.component.css'],
  imports: [
    MatDialogContent,
    MatFormField,
    ReactiveFormsModule,
    MatSelect,
    MatOption,
    MatAutocomplete,
    MatAutocompleteTrigger,
    DatePipe,
    MatDatepicker,
    MatDatepickerToggle,
    MatDatepickerInput,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    CommonModule,
    MatDialogActions,
    MatProgressSpinnerModule,
    HttpClientModule,
    MatNativeDateModule,
    MatDatepickerModule
  ],
  providers: [
    CountryCurrencyService,
    DatePipe,
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
    { provide: MAT_DATE_FORMATS, useValue: { parse: { dateInput: 'DD/MM/YYYY' }, display: { dateInput: 'DD/MM/YYYY' } } },]
})
export class EditPaymentComponent implements OnInit {
  editPaymentForm!: FormGroup;
  countries: any[] = [];
  currencies: any[] = [];
  cities: string[] = [];
  errorMessage: string = '';
  evidenceUploaded: boolean = false;
  filteredCities: string[] = [];
  filteredCurrencies: string[] = [];
  minDate: string = '';

  constructor(
    private fb: FormBuilder,
    private countryCurrencyService: CountryCurrencyService,
    private dialogRef: MatDialogRef<EditPaymentComponent>,
    private paymentService: PaymentService,
    @Inject(MAT_DIALOG_DATA) public payment: any,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.errorMessage = '';
    this.initializeForm();
    this.fetchCountries();
    this.fetchCurrencies();

    this.minDate = new Date().toISOString().split('T')[0];
    this.evidenceUploaded = this.payment.evidence_file?.file_found || false;

    this.editPaymentForm.get('payee_payment_status')?.valueChanges.subscribe((status) => {
      if (status === 'completed' && !this.evidenceUploaded) {
        this.errorMessage = 'Cannot set status to Completed without uploading evidence.';
        this.editPaymentForm.get('payee_payment_status')?.setErrors({ evidenceRequired: true });
      } else {
        this.errorMessage = '';
        this.editPaymentForm.get('payee_payment_status')?.setErrors(null);
      }
    });

    this.editPaymentForm.get('payee_country')?.valueChanges.subscribe((selectedCountry) => {
      const countryData = this.countries.find((country) => country.name === selectedCountry);
      this.filteredCities = countryData ? countryData.cities : [];
    });

    // Filter Currencies based on user input
    this.editPaymentForm.get('currency')?.valueChanges.subscribe((inputValue) => {
      this.filteredCurrencies = this.currencies.filter(currency =>
        currency.name.toLowerCase().includes(inputValue.toLowerCase())
      );
    });
  }

  initializeForm(): void {
    this.editPaymentForm = this.fb.group({
      due_amount: [this.payment.due_amount, [Validators.required, Validators.min(0)]],
      payee_payment_status: [this.payment.payee_payment_status, Validators.required],
      payee_due_date: [this.payment.payee_due_date, Validators.required],
      payee_address_line_1: [this.payment.payee_address_line_1, Validators.required],
      payee_address_line_2: [this.payment.payee_address_line_2],
      payee_city: [this.payment.payee_city, Validators.required],
      payee_country: [this.payment.payee_country, Validators.required],
      payee_postal_code: [this.payment.payee_postal_code, Validators.required],
      currency: [this.payment.currency, Validators.required],
    });
  }

  fetchCountries(): void {
    this.countryCurrencyService.fetchCountries().subscribe((response) => {
      this.countries = response.data.map((country: any) => ({
        name: country.country,
        alpha2Code: country.iso2,
        cities: country.cities,
      }));
    });
  }

  fetchCurrencies(): void {
    this.countryCurrencyService.fetchCurrencies().subscribe((response) => {
      this.currencies = response.data.map((currencyData: any) => ({
        code: currencyData.currency,
        name: currencyData.currency,
      }));
    });
  }

  submitForm(): void {
    if (this.editPaymentForm.valid) {
      const updatedPayment = {
        ...this.payment, // Retain all original fields
        ...this.editPaymentForm.value, // Update editable fields
      };

      // Ensure evidence is uploaded before setting status to 'completed'
      if (
        updatedPayment.payee_payment_status === 'completed' &&
        !this.evidenceUploaded
      ) {
        this.errorMessage = 'Please upload evidence before marking as completed.';
        return;
      }


      // Convert payee_added_date_utc to a valid ISO format string
      if (updatedPayment.payee_added_date_utc) {
        updatedPayment.payee_added_date_utc = this.datePipe.transform(updatedPayment.payee_added_date_utc, 'yyyy-MM-ddTHH:mm:ssZ')!;
      }

      // Ensure payee_due_date is in a valid date-only format (without time)
      if (updatedPayment.payee_due_date) {
        updatedPayment.payee_due_date = this.datePipe.transform(updatedPayment.payee_due_date, 'yyyy-MM-dd')!;
      }



      this.paymentService.updatePayment(this.payment._id, updatedPayment)
        .then((response) => {
          console.log('Payment updated successfully:', response);
          this.dialogRef.close(updatedPayment);
        })
        .catch((error) => {
          this.errorMessage = 'Failed to update payment due to this error: ' + error.message;
          console.error('Error updating payment:', error);
        });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  // Display the selected city
  displayCity(city: string): string {
    return city ? city : '';
  }

  // Display the selected country
    displayCountry(country: string): string {
      return country ? country : '';
    }

  // Display the selected currency
  displayCurrency(currency: string): string {
    return currency ? currency : '';
  }


}
