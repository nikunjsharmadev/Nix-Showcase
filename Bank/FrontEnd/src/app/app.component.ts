import { Component } from '@angular/core';
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
  imports: [RouterOutlet],
})
export class AppComponent {}
