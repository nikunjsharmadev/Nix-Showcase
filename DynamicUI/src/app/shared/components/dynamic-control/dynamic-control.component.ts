import { Component, Input, ViewChild, TemplateRef } from '@angular/core';
import { DynamicControl } from '../../../core/models';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule],
  standalone: true,
  selector: 'dyn-ui-control',
  templateUrl: './dynamic-control.component.html',
  styleUrl: './dynamic-control.component.css',
})
export class DynamicControlComponent {
  @Input() data!: DynamicControl;

  getStringToArray(str: string): string[] {
    return JSON.parse(str.replace(/'/g, '"'));
  }
}
