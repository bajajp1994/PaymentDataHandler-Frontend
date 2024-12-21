import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = 'http://0.0.0.0:8000/payments';

  constructor() {}

  // Fetch payments with filter, search, paging, and server-side calculations
  getPayments(params: any): Promise<any> {
    return axios.get(`${this.baseUrl}/get_payments`, { params })
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching payments:', error);
        throw error;
      });
  }

  // Update an existing payment
  updatePayment(paymentId: string, paymentData: any): Promise<any> {
    return axios.put(`${this.baseUrl}/update/${paymentId}`, paymentData)
      .then(response => response.data)
      .catch(error => {
        console.error('Error updating payment:', error);
        throw error;
      });
  }

  // Delete a payment by ID
  deletePayment(paymentId: string): Promise<any> {
    return axios.delete(`${this.baseUrl}/delete/${paymentId}`)
      .then(response => response.data)
      .catch(error => {
        console.error('Error deleting payment:', error);
        throw error;
      });
  }

  // Create a new payment
  createPayment(paymentData: any): Promise<any> {
    return axios.post(`${this.baseUrl}/create`, paymentData)
      .then(response => response.data)
      .catch(error => {
        console.error('Error creating payment:', error);
        throw error;
      });
  }

  // Upload evidence file
  uploadEvidence(paymentId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return axios.post(`${this.baseUrl}/upload_evidence/${paymentId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => response.data)
      .catch(error => {
        console.error('Error uploading evidence:', error);
        throw error;
      });
  }

  // Download evidence file
  downloadEvidence(paymentId: string): Promise<Blob> {
    return axios.get(`${this.baseUrl}/download_evidence/${paymentId}`, {
      responseType: 'blob'  // Return the file as a blob
    })
      .then(response => response.data)
      .catch(error => {
        console.error('Error downloading evidence:', error);
        throw error;
      });
  }
}
