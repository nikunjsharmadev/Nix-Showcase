import { Component, OnInit, Input, Injectable, ChangeDetectionStrategy } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { provideRouter, RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ROUTES } from './routes-copy';

// MODELS
export interface DynamicControlModel {
  id?: number;
  label?: string;
  controllId?: string;
  dataType?: string;
  value?: number;
  default?: string;
  placeHolder?: string;
  minValue?: number;
  options?: string[];
}

// SERVICES
@Injectable({ providedIn: 'root' })
export class DynamicControlService {
  private apiUrl: string = 'backend/data/dynamic-control.json';
  constructor(private httpClient: HttpClient) {}
  getDynamicControls(): Observable<DynamicControlModel[]> {
    return this.httpClient.get<DynamicControlModel[]>(this.apiUrl);
  }
}

// COMPONENTS
//------------------------------------------------------------
@Component({
  imports: [RouterLinkWithHref],
  standalone: true,
  selector: 'dyn-ui-control',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="not-found">
    <h1>404</h1>
    <h2>Page Not Found</h2>
    <p>The page you are looking for doesn't exist</p>
    <button [routerLink]="['/']">Go back</button>
  </div>`,
})
export class PageNotFoundComponent {}
//----------------------------------------------------------
@Component({
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  selector: 'dyn-ui-control',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [formGroup]="formGroup">
    @if (data.dataType === 'singleLineText') {
      <ng-container
        [ngTemplateOutlet]="singleLineText"
        [ngTemplateOutletContext]="data"
      ></ng-container>
      <ng-template #singleLineText let-label="label" let-value="value">
        <label [for]="data.controllId"> {{ label }}</label>
        <input
          [id]="data.controllId"
          [name]="label"
          [placeholder]="data.placeHolder"
          required
          type="text"
          [value]="data.default"
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
          [value]="data.default"
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
          [value]="data.default"
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
          @for (gender of data.options; track gender) {
            <ng-container>
              <input
                [id]="data.controllId"
                required
                [name]="label"
                type="radio"
                [value]="gender"
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
      <ng-template #multiChoice let-label="label">
        <label [for]="data.controllId">{{ label }}</label>
        <select [id]="data.controllId" [name]="label" [formControlName]="label" multiple>
          @for (choice of data.options; track choice) {
            <option [value]="choice">
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
          [value]="data.default"
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
//----------------------------------------------------------
@Component({
  standalone: true,
  imports: [CommonModule, DynamicControlComponent, ReactiveFormsModule],
  selector: 'dyn-ui-controls',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form (submit)="submitForm($event)" autocomplete="on">
      @if (dynamicControls$ | async; as dynamicControls) {
        @for (dynamicControl of dynamicControls; track dynamicControl) {
          <dyn-ui-control [data]="dynamicControl" [formGroup]="formGroup" />
        }
      }
      <code>Submitted Data: {{ submittedData | json }}</code>
    </form>
  `,
})
export class DynamicFormControlsComponent implements OnInit {
  public dynamicControls$: Observable<DynamicControlModel[]> = of([]);
  private formControls: { [key: string]: FormControl } = {};
  public formGroup!: FormGroup;
  public submittedData = {};
  constructor(private dynamicControlService: DynamicControlService) {}
  ngOnInit(): void {
    this.dynamicControls$ = this.dynamicControlService.getDynamicControls();
    this.dynamicControls$.subscribe((r) => {
      for (const [_, value] of r.entries()) {
        if (value.label) {
          this.formControls[value.label] = new FormControl(value.default, Validators.required);
        }
      }
      this.formGroup = new FormGroup(this.formControls);
    });
  }
  submitForm(e: SubmitEvent) {
    this.submittedData = { ...this.formGroup.value };
    e.preventDefault();
  }
}
//----------------------------------------------------------
// APP
@Component({
  selector: 'dyn-ui-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent {}

// BOOTSTRAP
bootstrapApplication(AppComponent, {
  providers: [provideRouter(ROUTES), provideHttpClient()],
});
