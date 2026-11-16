import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { SoloAdminDirective } from '../../shared/directivas/solo-admin.directive';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, SoloAdminDirective],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  protected readonly authService = inject(AuthService);
}
