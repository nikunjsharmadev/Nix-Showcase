import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicControlsRoutingModule } from './dynamic-controls.routing.module';
import { DynamicControlService } from '../core/services';
import { HttpClientModule } from '@angular/common/http';
import { DynamicControlsComponent } from './dynamic-controls.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [DynamicControlsComponent],
  imports: [
    CommonModule,
    DynamicControlsRoutingModule,
    HttpClientModule,
    SharedModule
  ],
  providers: [DynamicControlService]
})
export class DynamicControlsModule { }
