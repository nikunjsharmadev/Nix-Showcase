import { Component, Inject, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthLayoutComponent } from '../../../layouts/auth-layout/auth-layout.component';
import { AuthService } from '../../../core/services/service';

@Component({
  selector: 'bnk-verify-email',
  imports: [RouterLink, AuthLayoutComponent],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
})
export class VerifyEmailComponent {
  status: 'loading' | 'success' | 'error' = 'loading';
  authService = inject(AuthService);
  private route = Inject(ActivatedRoute);
  private router = inject(Router);
  async ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token === null) {
      this.router.navigate(['/page-not-found']);
      return;
    }
    this.authService.verifyEmail(token).subscribe({
      next: (result: { data: { isVerified: boolean }; success: boolean }) => {
        if (result.data.isVerified) {
          this.status = 'success';
        }
      },
      error: () => {
        this.status = 'error';
      },
    });
  }
}
