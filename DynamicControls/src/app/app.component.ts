import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { coreModule } from './core/core.module';
import { DynamicControlsModule } from './dynamic-controls/dynamic-controls.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, coreModule, DynamicControlsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'assignmentApp';
}
