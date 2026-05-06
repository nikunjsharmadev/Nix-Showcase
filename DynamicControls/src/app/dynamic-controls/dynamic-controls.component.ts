import { Component, OnInit } from '@angular/core';
import { DynamicControlService } from '../core/services';
import { Observable, of } from 'rxjs';
import { DynamicControl } from '../core/models';

@Component({
  standalone: false,
  selector: 'app-dynamic-controls',
  templateUrl: './dynamic-controls.component.html',
  styleUrl: './dynamic-controls.component.css'
})
export class DynamicControlsComponent implements OnInit {
  public dynamicControls$: Observable<DynamicControl[]> = of([]);
  constructor(private dynamicControlService: DynamicControlService) {}
  ngOnInit(): void {
    this.dynamicControls$ = this.dynamicControlService.getDynamicControls();
  }
}
