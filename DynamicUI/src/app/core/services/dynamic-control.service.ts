import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DynamicControlModel } from '../models';

// SERVICES
@Injectable({ providedIn: 'root' })
export class DynamicControlService {
  private apiUrl: string = 'backend/data/dynamic-control.json';
  constructor(private httpClient: HttpClient) {}
  getDynamicControls(): Observable<DynamicControlModel[]> {
    return this.httpClient.get<DynamicControlModel[]>(this.apiUrl);
  }
}
