import { Component } from '@angular/core';
import { ShowProfilService } from '../../modules/show-profil.service';
import { UpdateProfilService } from '../../modules/update-profil.service';

@Component({
  selector: 'app-update-profil',
  standalone: true,
  imports: [],
  templateUrl: './update-profil.component.html',
  styleUrl: './update-profil.component.scss',
})
export class UpdateProfilComponent {
  open_show_profil!: boolean;
  open_update_profil!: boolean;
  constructor(private showProfileService: ShowProfilService, private updateProfilService: UpdateProfilService) {
    this.showProfileService.open_show_profil$.subscribe(state => {
      this.open_show_profil = state;
    });
    this.updateProfilService.open_update_profil$.subscribe(state => {
      this.open_update_profil = state;
    });
  }

  onCloseUpdateProfil() {
    this.showProfileService.updateProfile();
    this.updateProfilService.updateProfile();
  }
}
