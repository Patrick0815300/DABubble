import { CommonModule, NgIf } from '@angular/common';
import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { ProfileComponent } from '../../shared/profile/profile.component';
import { Observable } from 'rxjs';
import { User } from '../../modules/database.model';
import { UserService } from '../../modules/user.service';
import { DatabaseServiceService } from '../../database-service.service';
import { ChannelService } from '../../modules/channel.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-user',
  standalone: true,
  imports: [CommonModule, ProfileComponent, FormsModule],
  templateUrl: './search-user.component.html',
  styleUrl: './search-user.component.scss',
  host: {
    '[style.display]': 'showSearchUserName? "block" : "none"',
  },
})
export class SearchUserComponent implements OnInit {
  users$: Observable<User[]> = new Observable<User[]>();
  filteredUsers: User[] = [];
  PickedArray: string[] = [];
  pickedUser: string = '';
  new_person_name: string = '';
  showSearchUserName: boolean = false;
  all_users: User[] = [];
  filtered_users: User[] = [];
  excludeClick = false;
  @Input({ required: true }) componentType!: 'search-input' | 'user-list';

  constructor(private userService: UserService, private databaseService: DatabaseServiceService, private channelService: ChannelService) {}

  // @HostListener('document:click', ['$event'])
  // onDocumentClick(event: MouseEvent): void {
  //   const clickedInsideDialog = this.dialogElement.nativeElement.contains(event.target);
  //   const clickedInsideButton = this.closeButtonRef.nativeElement.contains(event.target);
  //   if (!clickedInsideDialog && !clickedInsideButton) {
  //     // this.onToggleSearchUser(false);
  //     console.log('HI');
  //   }
  // }

  ngOnInit(): void {
    this.users$ = this.databaseService.snapUsers();

    this.channelService.filtered_users$.subscribe(users => {
      this.filteredUsers = users;
    });

    this.channelService.userPicked$.subscribe(user => {
      this.PickedArray = user;
    });

    this.databaseService.users$.subscribe(users => {
      this.all_users = users;
      this.filtered_users = this.all_users;
    });

    this.userService.toggle_show_search_user$.subscribe(state => {
      this.showSearchUserName = state;
    });

    this.userService.clickedInsideButton$.subscribe(isClicked => {
      this.excludeClick = isClicked;
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

  onAddTread(user: User) {
    this.userService.emitPickedUser(user);
  }

  onSearchUser() {
    if (this.new_person_name) {
      this.filtered_users = this.all_users.filter(u => u.name.toLowerCase().includes(this.new_person_name.toLowerCase()));
    } else {
      this.filtered_users = this.all_users;
    }
  }

  onToggleSearchUser(stateShow: boolean) {
    this.userService.emitShowSearchUser(stateShow);
  }
}
