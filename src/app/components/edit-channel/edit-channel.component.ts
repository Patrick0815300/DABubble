import { Component, OnInit } from '@angular/core';
import { ChannelService } from '../../modules/channel.service';
import { UserService } from '../../modules/user.service';
import { Channel, User } from '../../modules/database.model';
import { DatabaseServiceService } from '../../database-service.service';

@Component({
  selector: 'app-edit-channel',
  standalone: true,
  imports: [],
  templateUrl: './edit-channel.component.html',
  styleUrl: './edit-channel.component.scss',
})
export class EditChannelComponent implements OnInit {
  open_edit_channel: boolean = false;
  channel: Channel = new Channel();
  admin_name: string = '';
  authenticatedUser: User | undefined;

  constructor(private channelService: ChannelService, private userService: UserService, private databaseService: DatabaseServiceService) {}

  ngOnInit(): void {
    this.channelService.open_update_channel$.subscribe(state => {
      this.open_edit_channel = state;
    });

    this.userService.channel$.subscribe(channel => {
      this.channel = channel;
    });

    this.databaseService.getChannelAdmin(this.channel.admin).subscribe(admin => {
      this.admin_name = `${admin.first_name} ${admin.last_name}`;
    });

    this.databaseService.authenticatedUser().subscribe(user => {
      this.authenticatedUser = user;
    });
  }

  onOpenEditChannel() {
    this.channelService.editChannelInfos();
  }

  onLeaveChannel() {
    if (this.authenticatedUser?.user_id !== this.channel.admin) {
      this.databaseService.leaveChannel(this.authenticatedUser?.user_id);
    } else {
      console.log('Admin cannot leave the channel');
    }

    this.onOpenEditChannel();
  }
}
