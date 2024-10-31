import { Component, OnInit } from '@angular/core';
import { ProfileComponent } from '../../shared/profile/profile.component';
import { LogOutService } from '../../modules/log-out.service';
import { Channel, User } from '../../modules/database.model';
import { DatabaseServiceService } from '../../database-service.service';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../modules/channel.service';
import { SearchDevspaceComponent } from '../search-devspace/search-devspace.component';
import { CommonModule } from '@angular/common';
import { NavService } from '../../modules/nav.service';
import { getAuth } from 'firebase/auth';
import { AuthService } from '../../firestore-service/auth.service';
import { CurrentUserService } from '../../modules/current-user.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [ProfileComponent, FormsModule, SearchDevspaceComponent, CommonModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
})
export class NavBarComponent implements OnInit {
  avatar = 'Elise_Roth.svg';
  open_logout!: boolean;
  authenticatedUser: User | undefined;
  search_input: string = '';
  all_users: User[] = [];
  filtered_users: User[] = [];
  filteredChannels: Channel[] = [];
  all_channels: Channel[] = [];
  searchUser: User[] = [];
  PickedArray: string[] = [];
  showSearchUserName: boolean = false;
  input_value: string = '';
  currentUserId!: any;
  openNextWrapper: 'wrapper_1' | 'wrapper_2' | 'wrapper_3' = 'wrapper_1';

  constructor(
    private logOutService: LogOutService,
    public databaseService: DatabaseServiceService,
    private authService: CurrentUserService,
    private channelService: ChannelService,
    private navService: NavService
  ) {
    this.logOutService.open_logout$.subscribe(state => {
      this.open_logout = state;
    });
  }

  ngOnInit(): void {
    this.authService.userID$.subscribe(userId => {
      this.databaseService.authUser(userId!).then(user => {
        if (user && user != null) {
          this.authenticatedUser = user;
        }
      });
    });

    this.databaseService.users$.subscribe(users => {
      this.all_users = users;
    });

    this.navService.search_input$.subscribe(val => {
      this.input_value = val;
    });
    this.databaseService.channels$.subscribe(channel => {
      this.all_channels = channel;
    });

    this.channelService.openMessageMobile$.subscribe(state => {
      this.openNextWrapper = state;
    });
  }

  onOpenLogOut() {
    this.logOutService.updateProfile();
  }

  sendSearchInput(input: string) {
    this.navService.emitSearchInput(input);
  }

  onSearchInDevspace() {
    if (this.search_input.length >= 1 && this.search_input[0] === '@') {
      this.showSearchUserName = true;
      if (this.search_input.length == 1) {
        this.filtered_users = this.all_users;
        this.channelService.emitFilteredUsers(this.filtered_users);
      } else if (this.search_input.length > 1 && this.search_input[0] === '@') {
        this.filtered_users = this.all_users.filter(u => u.name.toLowerCase().includes(this.search_input.slice(1).toLowerCase()));

        this.channelService.emitFilteredUsers(this.filtered_users);
      }
    } else if (this.search_input && this.search_input[0] !== '@') {
      if (this.search_input[0] === '#' && this.search_input.length == 1) {
        this.showSearchUserName = true;
        this.filteredChannels = this.all_channels;
        this.channelService.emitFilteredChannels(this.filteredChannels);
      } else if (this.search_input[0] === '#' && this.search_input.length > 1) {
        this.showSearchUserName = true;
        this.filteredChannels = this.all_channels.filter(u => u.channel_name.toLowerCase().includes(this.search_input.slice(1).toLowerCase()));
        this.channelService.emitFilteredChannels(this.filteredChannels);
      } else {
        this.showSearchUserName = true;
        this.filtered_users = this.all_users.filter(u => u.email.toLowerCase().includes(this.search_input.toLowerCase()));
        this.channelService.emitFilteredUsers(this.filtered_users);
      }
    } else {
      this.showSearchUserName = false;
    }
  }

  closeDevSpace() {
    this.showSearchUserName = false;
    this.search_input = '';
  }

  handleDialogMobile(val: 'wrapper_1' | 'wrapper_2' | 'wrapper_3') {
    this.channelService.emitOpenMessageMobile(val);
    console.log(val);
  }

  openLogoutMobile() {
    this.channelService.emitLogoutMobile();
  }
}
