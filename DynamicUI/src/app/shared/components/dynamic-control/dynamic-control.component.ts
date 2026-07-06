import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { DynamicControlModel } from '../../../core/models';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'dyn-ui-control',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './dynamic-control.component.css',
  template: `<div [formGroup]="formGroup">
    @if (data.dataType === 'singleLineText') {
      <ng-container
        [ngTemplateOutlet]="singleLineText"
        [ngTemplateOutletContext]="data"
      ></ng-container>
      <ng-template #singleLineText let-label="label" let-value="value">
        <label [for]="data.controllId">{{ label }}</label>
        <input
          [id]="data.controllId"
          [name]="label"
          [placeholder]="data.placeHolder"
          required
          type="text"
          [value]="value"
          [formControlName]="label"
        />
      </ng-template>
    }
    @if (data.dataType === 'singleLineTextEmail') {
      <ng-container
        [ngTemplateOutlet]="singleLineTextEmail"
        [ngTemplateOutletContext]="data"
      ></ng-container>
      <ng-template #singleLineTextEmail let-label="label" let-value="value">
        <label [for]="data.controllId">{{ label }}</label>
        <input
          [id]="data.controllId"
          [name]="label"
          [placeholder]="data.placeHolder"
          required
          type="email"
          [value]="value"
          autocomplete="Enter email"
          [formControlName]="label"
        />
      </ng-template>
    }
    @if (data.dataType === 'number') {
      <ng-container [ngTemplateOutlet]="number" [ngTemplateOutletContext]="data"></ng-container>
      <ng-template #number let-label="label" let-value="value">
        <label [for]="data.controllId">{{ label }}</label>
        <input
          [id]="data.controllId"
          [name]="label"
          [placeholder]="data.placeHolder"
          required
          type="number"
          [min]="(data && data.minValue) || 0"
          [value]="value"
          [formControlName]="label"
        />
      </ng-template>
    }
    @if (data.dataType === 'singleChoice') {
      <ng-container
        [ngTemplateOutlet]="singleChoice"
        [ngTemplateOutletContext]="data"
      ></ng-container>
      <ng-template #singleChoice let-label="label" let-value="value">
        <label [for]="data.controllId">{{ label }}</label>
        <div class="radio-group">
          @for (gender of getStringToArray(value); track gender) {
            <ng-container>
              <input
                [id]="data.controllId"
                required
                [name]="label"
                type="radio"
                [value]="gender"
                [checked]="data.default === gender"
                [formControlName]="label"
              /><span class="gender-name">{{ gender }}</span>
            </ng-container>
          }
        </div>
      </ng-template>
    }
    @if (data.dataType === 'multiChoice') {
      <ng-container
        [ngTemplateOutlet]="multiChoice"
        [ngTemplateOutletContext]="data"
      ></ng-container>
      <ng-template #multiChoice let-label="label" let-value="value">
        <label [for]="data.controllId">{{ label }}</label>
        <select [id]="data.controllId" multiple [name]="label" [formControlName]="label">
          @for (choice of getStringToArray(value); track choice) {
            <option>
              {{ choice }}
            </option>
          }
        </select>
      </ng-template>
    }
    @if (data.dataType === 'multiLineText') {
      <ng-container
        [ngTemplateOutlet]="multiLineText"
        [ngTemplateOutletContext]="data"
      ></ng-container>
      <ng-template #multiLineText let-label="label" let-value="value">
        <label [for]="data.controllId">{{ label }}</label>
        <textarea
          [id]="data.controllId"
          [name]="label"
          [value]="value"
          [placeholder]="data.placeHolder"
          [formControlName]="label"
        ></textarea>
      </ng-template>
    }
    @if (data.dataType === 'submit') {
      <ng-container [ngTemplateOutlet]="submit" [ngTemplateOutletContext]="data"></ng-container>
      <ng-template #submit>
        <button [type]="data.dataType">Submit</button>
      </ng-template>
    }
  </div>`,
})
export class DynamicControlComponent {
  @Input() data!: DynamicControlModel;
  @Input() formGroup!: FormGroup;
  getStringToArray(str: string): string[] {
    return JSON.parse(str.replace(/'/g, '"'));
  }
}
