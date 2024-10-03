import { Component, OnInit } from '@angular/core';
import { ShowProfilService } from '../../modules/show-profil.service';
import { UpdateProfilService } from '../../modules/update-profil.service';
import { User } from '../../modules/database.model';
import { DatabaseServiceService } from '../../database-service.service';

@Component({
  selector: 'app-show-profil',
  standalone: true,
  imports: [],
  templateUrl: './show-profil.component.html',
  styleUrl: './show-profil.component.scss',
})
export class ShowProfilComponent implements OnInit {
  open_show_profile!: boolean;
  open_update_profile!: boolean;
  authenticatedUser: User | undefined;
  constructor(private showProfileService: ShowProfilService, private updateProfilService: UpdateProfilService, private databaseService: DatabaseServiceService) {
    this.showProfileService.open_show_profile$.subscribe(state => {
      this.open_show_profile = state;
    });
    this.updateProfilService.open_update_profil$.subscribe(state => {
      this.open_update_profile = state;
    });
  }

  ngOnInit(): void {
    this.databaseService.authenticatedUser().subscribe(user => {
      this.authenticatedUser = user;
    });
  }

  onCloseShowProfil() {
    this.showProfileService.updateProfile();
  }

  onOpenUpdateProfil() {
    this.updateProfilService.updateProfile();
  }
}
