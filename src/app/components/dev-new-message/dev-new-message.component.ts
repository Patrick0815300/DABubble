import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavService } from '../../modules/nav.service';
import { MiddleWrapperComponent } from '../../shared/middle-wrapper/middle-wrapper.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchDevspaceComponent } from '../search-devspace/search-devspace.component';
import { DatabaseServiceService } from '../../database-service.service';
import { Channel, User } from '../../modules/database.model';
import { ChannelService } from '../../modules/channel.service';

@Component({
  selector: 'app-dev-new-message',
  standalone: true,
  imports: [MiddleWrapperComponent, FormsModule, CommonModule, SearchDevspaceComponent],
  templateUrl: './dev-new-message.component.html',
  styleUrl: './dev-new-message.component.scss',
})
export class DevNewMessageComponent implements OnInit {
  devSearchState: boolean = false;
  message_content: string = '';
  showSearchUserName: boolean = false;
  all_users: User[] = [];
  all_channels: Channel[] = [];
  input_value: string = '';
  search_input: string = '';
  filtered_users: User[] = [];
  filteredChannels: Channel[] = [];
  PickedArray: string[] = [];

  constructor(private navService: NavService, private databaseService: DatabaseServiceService, private channelService: ChannelService) {}
  ngOnInit(): void {
    this.navService.stateOpenDevSearch$.subscribe(state => {
      this.devSearchState = state;
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
        console.log('for 1', this.filtered_users);
      } else if (this.search_input.length > 1 && this.search_input[0] === '@') {
        console.log('For more1', this.filtered_users);
        this.filtered_users = this.all_users.filter(u => u.name.toLowerCase().includes(this.search_input.slice(1).toLowerCase()));
        console.log('For more', this.filtered_users);
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
}
