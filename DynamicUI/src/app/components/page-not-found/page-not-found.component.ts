import { Component } from '@angular/core';
import { RouterLinkWithHref } from '@angular/router';

@Component({
  imports: [RouterLinkWithHref],
  standalone: true,
  selector: 'dyn-ui-control',
  styleUrl: './page-not-found.component.css',
  template: `<div class="not-found">
    <h1>404</h1>
    <h2>Page Not Found</h2>
    <p>The page you are looking for doesn't exist</p>
    <button [routerLink]="['/']">Go back</button>
  </div>`,
})
export class PageNotFoundComponent {}
