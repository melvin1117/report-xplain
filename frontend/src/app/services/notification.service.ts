import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private defaultDurationInMs = 3000; // 3 seconds default duration

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Shows a success snackbar.
   * @param message Message to display.
   * @param action Optional action label.
   * @param duration Duration in milliseconds.
   */
  showSuccess(message: string, action: string = 'Close', duration: number = this.defaultDurationInMs): void {
    this.snackBar.open(message, action, {
      duration,
      panelClass: ['snackbar-success']
    });
  }

  /**
   * Shows an error snackbar.
   * @param message Message to display.
   * @param action Optional action label.
   * @param duration Duration in milliseconds.
   */
  showError(message: string, action: string = 'Close', duration: number = this.defaultDurationInMs): void {
    this.snackBar.open(message, action, {
      duration,
      panelClass: ['snackbar-error']
    });
  }

  /**
   * Shows an info snackbar.
   * @param message Message to display.
   * @param action Optional action label.
   * @param duration Duration in milliseconds.
   */
  showInfo(message: string, action: string = 'Close', duration: number = this.defaultDurationInMs): void {
    this.snackBar.open(message, action, {
      duration,
      panelClass: ['snackbar-info']
    });
  }
}
