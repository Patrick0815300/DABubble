import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ProfileComponent } from '../../shared/profile/profile.component';
import { Observable } from 'rxjs';
import { User } from '../../modules/database.model';
import { UserService } from '../../modules/user.service';
import { DatabaseServiceService } from '../../database-service.service';
import { ChannelService } from '../../modules/channel.service';

@Component({
  selector: 'app-search-user',
  standalone: true,
  imports: [CommonModule, ProfileComponent],
  templateUrl: './search-user.component.html',
  styleUrl: './search-user.component.scss',
})
export class SearchUserComponent implements OnInit {
  users$: Observable<User[]> = new Observable<User[]>();
  filteredUsers: User[] = [];
  PickedArray: string[] = [];

  constructor(private userService: UserService, private databaseService: DatabaseServiceService, private channelService: ChannelService) {}

  ngOnInit(): void {
    this.users$ = this.databaseService.snapUsers();

    this.channelService.filtered_users$.subscribe(users => {
      this.filteredUsers = users;
    });

    this.channelService.userPicked$.subscribe(user => {
      this.PickedArray = user;
    });
  }

  sendToAddUserToChannel(user: User) {
    if (!this.PickedArray.includes(user.user_id)) {
      this.PickedArray.push(user.user_id);
      this.channelService.emitPickedUser(this.PickedArray);
      console.log('new User', this.PickedArray);
    } else {
      console.log('member already exist');
    }
  }
}
