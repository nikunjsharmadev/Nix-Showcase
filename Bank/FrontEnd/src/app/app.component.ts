import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ServerDownComponent } from './features/server-down/server-down.component';
import { serviceFactory } from './core/services/service';
// APP
@Component({
  selector: `bnk-app`,
  template: `
    <!--  -->
    <router-outlet />
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterOutlet],
})
export class AppComponent {}
