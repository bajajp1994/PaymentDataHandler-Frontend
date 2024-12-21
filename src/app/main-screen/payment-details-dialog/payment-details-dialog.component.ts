import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {CurrencyPipe} from '@angular/common';

@Component({
  selector: 'app-payment-details-dialog',
  imports: [CurrencyPipe],
  templateUrl: './payment-details-dialog.component.html',
  styleUrls: ['./payment-details-dialog.component.css']
})
export class PaymentDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PaymentDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }
}
