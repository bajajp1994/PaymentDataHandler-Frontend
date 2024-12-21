import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {FormsModule} from '@angular/forms';
import { MatTable, MatTableModule} from '@angular/material/table';
import {CurrencyPipe} from '@angular/common';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { PaymentDetailsDialogComponent } from './payment-details-dialog/payment-details-dialog.component';
import { PaymentService } from '../services/payment.service';

export interface FilterFields {
  payee_first_name: string;
  payee_last_name: string;
  payee_payment_status: string;
  payee_address_line_1: string;
  payee_address_line_2: string;
  payee_city: string;
  payee_country: string;
  payee_province_or_state: string;
  payee_postal_code: string;
  payee_phone_number: string;
  payee_email: string;
  currency: string;
  [key: string]: string; // Index signature added to allow dynamic keys
}


@Component({
  selector: 'app-main-screen',
  templateUrl: './main-screen.component.html',
  imports: [
    FormsModule,
    MatTable,
    CurrencyPipe,
    MatTableModule,
    CommonModule
  ],
  styleUrls: ['./main-screen.component.css']
})
export class MainScreenComponent implements OnInit {
  payments: any[] = []; // Your payments array
  selectedFiles: { [key: string]: File } = {};
  payment: any = {
    payee_first_name: '',
    payee_last_name: '',
    payee_address_line_1: '',
    payee_address_line_2: '',
    payee_city: '',
    payee_province_or_state: '',
    payee_postal_code: '',
  };
  loading: boolean = false;
  totalDue: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  totalPages: number = 1;
  filterFields: FilterFields = {
    payee_first_name: '',
    payee_last_name: '',
    payee_payment_status: '',
    payee_address_line_1: '',
    payee_address_line_2: '',
    payee_city: '',
    payee_country: '',
    payee_province_or_state: '',
    payee_postal_code: '',
    payee_phone_number: '',
    payee_email: '',
    currency: ''
  };

  constructor(private modalService: NgbModal,
              private dialog: MatDialog,
              private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.fetchPayments();
  }

  // Getter for full payee name
  get payeeName(): string {
    return `${this.payment.payee_first_name} ${this.payment.payee_last_name}`;
  }

  // Getter for full payee address
  get payeeAddress(): string {
    return `${this.payment.payee_address_line_1}, ${this.payment.payee_address_line_2}, ${this.payment.payee_city}, ${this.payment.payee_province_or_state}, ${this.payment.payee_postal_code}`;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.fetchPayments();
    }
  }


  fetchPayments(): void {
    // Filter out any empty fields in the filterFields object
    this.loading = true;

    const filteredParams = Object.keys(this.filterFields)
    .filter(key => this.filterFields[key]) // Only include non-empty values
    .reduce((obj: FilterFields, key: string) => {
      obj[key] = this.filterFields[key];  // Now TypeScript knows the type of obj
      return obj;
    }, {} as FilterFields)

    const params: any  = {
      ...filteredParams,
      skip: this.currentPage,
      limit: this.pageSize,
    };

    this.paymentService.getPayments(params).then(response => {
        this.payments = response.payments;
        this.totalDue = response.totalDue;
        this.totalCount = response.totalCount;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        this.loading = false;
      })
      .catch(error => {
        console.error('Error fetching payments:', error);
        this.loading = false;  // Stop loading in case of an error
      });
  }

  onSearchChange(): void {
    this.fetchPayments();
  }

  downloadEvidence(paymentId: string): void {
    this.paymentService.downloadEvidence(paymentId)
      .then((blob: Blob) => {
        // Create a download link
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob);

        link.href = url;
        link.download = 'evidence.pdf'; // Adjust file name as needed
        document.body.appendChild(link); // Append link to the body
        link.click(); // Trigger the download

        // Cleanup
        window.URL.revokeObjectURL(url); // Free up memory
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error('Error downloading evidence:', error);
      });
  }

  onFileSelected(event: Event, paymentId: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles[paymentId] = input.files[0];
    }
  }

  uploadEvidence(paymentId: string): void {
    const file = this.selectedFiles[paymentId];
    if (file) {
      this.paymentService.uploadEvidence(paymentId, file)
        .then(() => {
          alert('File uploaded successfully!');
          delete this.selectedFiles[paymentId];
          this.fetchPayments();
        })
        .catch(error => {
          console.error('Upload failed', error);
          alert('File upload failed. Please try again.');
        });
    } else {
      alert('No file selected for upload.');
    }
  }

  deletePayment(paymentId: string): void {
    const confirmed = window.confirm('Are you sure you want to delete this payment?');

    if (confirmed) {
      this.paymentService.deletePayment(paymentId).then(() => {
          alert('Payment deleted successfully.');
          this.fetchPayments(); // Reload the payments after deletion
        })
        .catch(error => {
          console.error('Error deleting payment', error);
          alert('Failed to delete payment. Please try again.');
        });
    } else {
      console.log('Deletion canceled');
    }
  }



  openPaymentDetails(payment: any): void {
    const dialogRef = this.dialog.open(PaymentDetailsDialogComponent, {
      width: '80%',
      data: { payment },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
