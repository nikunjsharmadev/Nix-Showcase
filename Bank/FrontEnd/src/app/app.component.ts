import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
