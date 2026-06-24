import { Component, OnInit } from '@angular/core';
import { DynamicControlService } from '../core/services';
import { Observable, of } from 'rxjs';
import { DynamicControl } from '../core/models';

@Component({
  standalone: false,
  selector: 'app-dynamic-controls',
  template: `
  <div *ngIf="(dynamicControls$ | async) as dynamicControls">
    <div *ngFor="let dynamicControl of dynamicControls">
        <app-dynamic-control [data]="dynamicControl"></app-dynamic-control>
    </div>
  </div>
  `,
  styleUrl: './dynamic-controls.component.css'
})
export class DynamicControlsComponent implements OnInit {
  public dynamicControls$: Observable<DynamicControl[]> = of([]);
  constructor(private dynamicControlService: DynamicControlService) {}
  ngOnInit(): void {
    this.dynamicControls$ = this.dynamicControlService.getDynamicControls();
  }
}
