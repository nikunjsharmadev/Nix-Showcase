import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { tap } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}
  login(payload: LoginRequest) {
    return this.http.post<LoginResponse>('/api/login', payload).pipe(
      tap((response: LoginResponse) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }),
    );
  }
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  getToekn() {
    return localStorage.getItem('token');
  }
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  isLoggedIn() {
    return !!localStorage.getItem('token');
  }
}
