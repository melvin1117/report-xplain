import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';
import { User, LoginResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Base URL from the environment file.
  private apiUrl = environment.apiBaseUrl;
  
  // Observable user state.
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {
    // Re-hydrate the user state on service initialization.
    const token = this.cookieService.get('authToken');
    const name = this.cookieService.get('userName');
    const email = this.cookieService.get('userEmail');
    if (token && name && email) {
      this.userSubject.next({ name, email });
    }
  }

  /**
   * Signup API call.
   * Endpoint: POST /auth/signup
   * Request Body: { name: string; email: string; password: string }
   * Response: { message: string }
   */
  signup(name: string, email: string, password: string): Observable<{ message: string }> {
    const url = `${this.apiUrl}/auth/signup`;
    return this.http.post<{ message: string }>(url, { name, email, password });
  }

  /**
   * Login API call.
   * Endpoint: POST /auth/login
   * Request Body: { email: string; password: string }
   * Response: { accessToken: string, name: string, email: string }
   *
   * On success, store the token and user details in cookies (with expiration) 
   * and update the current user.
   */
    login(email: string, password: string): Observable<LoginResponse> {
      const url = `${this.apiUrl}/auth/login`;
      return this.http.post<LoginResponse>(url, { email, password }).pipe(
        tap(response => {
          // Create an expiration Date 6 hours from now.
          const expires = new Date();
          expires.setHours(expires.getHours() + 6);
          
          // Set cookies with a 6-hour expiration.
          this.cookieService.set('authToken', response.accessToken, expires, '/', undefined, true, 'Lax');
          this.cookieService.set('userName', response.user.name, expires, '/', undefined, true, 'Lax');
          this.cookieService.set('userEmail', response.user.email, expires, '/', undefined, true, 'Lax');
    
          // Update the current user.
          this.userSubject.next({
            name: response.user.name,
            email: response.user.email
          });
        })
      );
    }
  

  /**
   * Logs out the current user.
   */
  logout(): void {
    this.userSubject.next(null);
    this.cookieService.delete('authToken', '/');
    this.cookieService.delete('userName', '/');
    this.cookieService.delete('userEmail', '/');
  }

  /**
   * Returns the current user synchronously.
   */
  get currentUser(): User | null {
    return this.userSubject.value;
  }
}
