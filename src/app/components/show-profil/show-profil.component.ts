import { Component } from '@angular/core';
import { ShowProfilService } from '../../modules/show-profil.service';
import { UpdateProfilService } from '../../modules/update-profil.service';

@Component({
  selector: 'app-show-profil',
  standalone: true,
  imports: [],
  templateUrl: './show-profil.component.html',
  styleUrl: './show-profil.component.scss',
})
export class ShowProfilComponent {
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

  onCloseShowProfil() {
    this.showProfileService.updateProfile();
  }

  onOpenUpdateProfil() {
    this.updateProfilService.updateProfile();
  }
}
