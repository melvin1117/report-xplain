import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Report } from '../models/report.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = environment.apiBaseUrl;
  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Retrieves the list of reports (real or mock).
   */
  getReports(): Observable<{ message: string, data: Report[] }> {
    const userId = this.authService.currentUser?.id;
    const url = `${this.apiUrl}/reports/user/${userId}`;
    return this.http.get<{ message: string, data: Report[] }>(url);
  }

  /**
   * Retrieves a single report by its ID (real or mock).
   */
  getReportById(reportId: string): Observable<{ message: string, data: Report }> {
    const userId = this.authService.currentUser?.id;
    const url = `${this.apiUrl}/reports/${reportId}/user/${userId}`;
    return this.http.get<{ message: string, data: Report }>(url);
  }

  /**
   * Retrieves the PDF for a specific report as a Blob (real or mock).
   */
  getReportPdf(reportId: string): Observable<Blob> {
    const url = `${this.apiUrl}/reports/${reportId}/download`;
    return this.http.get(url, { responseType: 'blob' });
  }

}
