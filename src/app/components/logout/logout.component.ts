import { Component } from '@angular/core';
import { ShowProfilService } from '../../modules/show-profil.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss',
})
export class LogoutComponent {
  open_show_profil!: boolean;

  constructor(private showProfileService: ShowProfilService) {
    this.showProfileService.open_show_profil$.subscribe(state => {
      this.open_show_profil = state;
    });
  }

  onOpenShowProfil() {
    this.showProfileService.updateProfile();
  }
}
