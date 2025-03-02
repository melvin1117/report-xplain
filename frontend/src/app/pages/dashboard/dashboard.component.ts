import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PdfUploadService } from '../../services/pdf-upload.service';
import { ReportService } from '../../services/report.service';
import { NotificationService } from '../../services/notification.service';
import { Report } from '../../models/report.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule // import spinner module
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  reports: Report[] = [];
  loading: boolean = false;

  constructor(
    private pdfUploadService: PdfUploadService,
    private reportService: ReportService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadReports();
  }

  // Load reports from the GET API.
  loadReports(): void {
    this.loading = true;
    this.reportService.getReports().subscribe({
      next: (reports) => {
        this.reports = reports.data;
        this.notificationService.showSuccess('Reports loaded successfully.');
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching reports', err);
        this.notificationService.showError('Error fetching reports.');
        this.loading = false;
      }
    });
  }

  // Handle file drop event.
  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0];
      if (this.isPdf(file)) {
        this.upload(file);
      } else {
        this.notificationService.showError('Only PDF files are allowed.');
      }
    }
  }

  // Prevent default behavior on dragover to allow drop.
  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  // Handle file selection from file picker.
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      if (this.isPdf(file)) {
        this.upload(file);
      } else {
        this.notificationService.showError('Only PDF files are allowed.');
      }
    }
  }

  // Check if the file is a PDF.
  private isPdf(file: File): boolean {
    return file.type === 'application/pdf';
  }

  // Upload the file using the service and redirect on success.
  private upload(file: File): void {
    this.loading = true;
    this.pdfUploadService.uploadFile(file).subscribe({
      next: (response) => {
        this.loading = false;
        this.notificationService.showSuccess('File uploaded successfully!');
        // Navigate to /report/<id> using the returned id.
        this.router.navigate(['/report', response.id]);
      },
      error: (err) => {
        this.loading = false;
        console.error('Upload failed', err);
        this.notificationService.showError('There was an error uploading the file.');
      }
    });
  }

  // Open a report when its card is clicked.
  openReport(reportId: string): void {
    this.router.navigate(['/report', reportId]);
  }
}
