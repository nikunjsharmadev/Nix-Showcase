import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { DynamicControlModel } from '../../../core/models';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'dyn-ui-control',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './dynamic-control.component.css',
  templateUrl: './dynamic-control.component.html',
})
export class DynamicControlComponent {
  @Input() data!: DynamicControlModel;
  @Input() formGroup!: FormGroup;
  getStringToArray(str: string): string[] {
    return JSON.parse(str.replace(/'/g, '"'));
  }
}
