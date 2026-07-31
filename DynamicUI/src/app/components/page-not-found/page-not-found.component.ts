import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLinkWithHref } from '@angular/router';

@Component({
  imports: [RouterLinkWithHref],
  standalone: true,
  selector: 'dyn-ui-control',
  styleUrl: './page-not-found.component.css',
  templateUrl: './page-not-found.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageNotFoundComponent {}
