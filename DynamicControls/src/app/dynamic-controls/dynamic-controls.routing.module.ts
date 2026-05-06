import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DynamicControlsComponent } from './dynamic-controls.component';

const routes: Routes = [{
  path: '',
  component: DynamicControlsComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DynamicControlsRoutingModule { }
