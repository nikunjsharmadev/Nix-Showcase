import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { DynamicControlModel } from '../../core/models';
import { DynamicControlService } from '../../core/services';
import { DynamicControlComponent } from '../../shared/components';
@Component({
  imports: [CommonModule, DynamicControlComponent, ReactiveFormsModule],
  selector: 'dyn-ui-controls',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './dynamic-form-controls.component.css',
  templateUrl: './dynamic-form-controls.component.html',
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
