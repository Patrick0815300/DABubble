import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  @Input({ required: true }) left_side_profile: boolean = false;
  @Input({ required: true }) image_user!: string;

  get imagePath() {
    return 'assets/img/profiles/' + this.image_user;
  }
}
