import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PdfUploadService {

  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Uploads a PDF file.
   * @param file The PDF file to upload.
   * @returns An Observable containing the new report ID.
   */
  uploadFile(file: File): Observable<{ message: string, id: number }> {
    const userId = this.authService.currentUser?.id;
    const url = `${this.apiUrl}/pdf/upload/user/${userId}`;
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ message: string, id: number }>(url, formData);
  }

}
