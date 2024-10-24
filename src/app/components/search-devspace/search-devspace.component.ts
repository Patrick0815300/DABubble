import { Component, OnInit } from '@angular/core';
import { ProfileComponent } from '../../shared/profile/profile.component';
import { CommonModule } from '@angular/common';
import { ChannelService } from '../../modules/channel.service';
import { Channel, User } from '../../modules/database.model';
import { NavService } from '../../modules/nav.service';

@Component({
  selector: 'app-search-devspace',
  standalone: true,
  imports: [ProfileComponent, CommonModule],
  templateUrl: './search-devspace.component.html',
  styleUrl: './search-devspace.component.scss',
})
export class SearchDevspaceComponent implements OnInit {
  PickedArray: string[] = [];
  filteredUsers: User[] = [];
  filteredChannels: Channel[] = [];
  input_search: string = '';

  constructor(private channelService: ChannelService, private navService: NavService) {}
  ngOnInit(): void {
    this.channelService.filtered_users$.subscribe(users => {
      this.filteredUsers = users;
    });
    this.channelService.filtered_channels$.subscribe(channels => {
      this.filteredChannels = channels;
    });

    this.channelService.userPicked$.subscribe(user => {
      this.PickedArray = user;
    });

    this.navService.search_input$.subscribe(value => {
      this.input_search = value;
    });
  }
  sendToOpenUser(user: User) {
    if (!this.PickedArray.includes(user.id)) {
      this.PickedArray.push(user.id);
      this.channelService.emitPickedUser(this.PickedArray);
      console.log('new User', this.PickedArray);
    } else {
      console.log('member already exist');
    }
  }

  sendToOpenChannel(channel: Channel) {
    console.log('You picked this channel', channel);
  }
}
