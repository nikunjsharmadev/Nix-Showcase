import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicFormControlsComponent } from './dynamic-form-controls.component';

describe('DynamicControlsComponent', () => {
  let component: DynamicFormControlsComponent;
  let fixture: ComponentFixture<DynamicFormControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicFormControlsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DynamicFormControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
