import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
// PAGE NOT FOUND
@Component({
  imports: [RouterLink],
  selector: `bnk-page-not-found`,
  template: ` <!--  -->
    <section class="not-found">
      <div class="content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist or may have been moved.</p>
        <button type="button" routerLink="/">Go to Home</button>
      </div>
    </section>`,
})
export class PageNotFoundComponent {}
