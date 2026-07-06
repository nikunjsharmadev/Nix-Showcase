import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { DynamicControlModel } from '../../core/models';
import { DynamicControlService } from '../../core/services';
import { DynamicControlComponent } from '../../shared/components';
@Component({
  standalone: true,
  imports: [CommonModule, DynamicControlComponent, ReactiveFormsModule],
  selector: 'dyn-ui-controls',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './dynamic-form-controls.component.css',
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
          this.formControls[value.label] = new FormControl('', Validators.required);
        }
      }
      this.formGroup = new FormGroup(this.formControls);
    });
  }
  submitForm(e: SubmitEvent) {
    console.log(this.formGroup.value);
    this.submittedData = { ...this.formGroup.value };
    e.preventDefault();
  }
}
