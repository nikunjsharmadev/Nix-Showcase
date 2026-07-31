import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ServerDownComponent } from './features/server-down/server-down.component';
import { AppStateService } from './core/services/service';

// APP
@Component({
  selector: 'bnk-app',
  imports: [RouterOutlet, ServerDownComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected state = inject(AppStateService);
}
