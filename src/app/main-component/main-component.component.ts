import { Component, OnInit } from '@angular/core';
import { WrapperComponent } from '../shared/wrapper/wrapper.component';
import { MiddleWrapperComponent } from '../shared/middle-wrapper/middle-wrapper.component';
import { RightWrapperComponent } from '../shared/right-wrapper/right-wrapper.component';
import { LeftSideMenuComponent } from '../components/left-side-menu/left-side-menu.component';
import { NavBarComponent } from '../components/nav-bar/nav-bar.component';
import { OverlayComponent } from '../shared/overlay/overlay.component';
import { ChannelDescriptionComponent } from '../components/channel-description/channel-description.component';
import { CommonModule } from '@angular/common';
import { NavService } from '../modules/nav.service';
import { LogoutComponent } from '../components/logout/logout.component';
import { ShowProfilComponent } from '../components/show-profil/show-profil.component';
import { UpdateProfilComponent } from '../components/update-profil/update-profil.component';
import { LogOutService } from '../modules/log-out.service';
import { ShowProfilService } from '../modules/show-profil.service';
import { UpdateProfilService } from '../modules/update-profil.service';
import { nanoid } from 'nanoid';
import { MessagesComponent } from '../components/messages/messages.component';
import { Channel, ChannelMember, Message, User } from '../modules/database.model';
import { DatabaseServiceService } from '../database-service.service';
import { AddUserNameComponent } from '../components/add-user-name/add-user-name.component';
import { UserService } from '../modules/user.service';
import { ChannelMessagesComponent } from '../components/channel-messages/channel-messages.component';
import { ChannelService } from '../modules/channel.service';
import { FormsModule } from '@angular/forms';
import { EditChannelComponent } from '../components/edit-channel/edit-channel.component';

@Component({
  selector: 'app-main-component',
  standalone: true,
  imports: [
    CommonModule,
    NavBarComponent,
    ChannelDescriptionComponent,
    WrapperComponent,
    MiddleWrapperComponent,
    RightWrapperComponent,
    LeftSideMenuComponent,
    OverlayComponent,
    LogoutComponent,
    ShowProfilComponent,
    UpdateProfilComponent,
    MessagesComponent,
    AddUserNameComponent,
    ChannelMessagesComponent,
    FormsModule,
    EditChannelComponent,
  ],
  templateUrl: './main-component.component.html',
  styleUrl: './main-component.component.scss',
})
export class MainComponentComponent implements OnInit {
  state_text: string = 'schließen';
  state_icon: string = 'assets/img/icons/Hide-navigation.svg';
  close = false;
  state!: boolean;
  open_logout!: boolean;
  open_show_profil!: boolean;
  open_show_profile_nav!: boolean;
  open_update_profil!: boolean;
  open_dialog_add_user: boolean = false;
  hide_navigation: boolean = false;
  chatMessages: Message[] = [];
  ChannelMembers: ChannelMember[] = [];
  selectedUser: User = new User();
  isChannelView: boolean = true;
  channel_description: string = '';
  channel_name: string = '';
  isChecked: string = 'officeTeam';
  officeTeamChannel!: Channel;
  all_channel!: Channel[];
  authenticatedUser: User | undefined;
  new_person_name: string = '';
  open_edit_channel: boolean = false;
  constructor(
    private navService: NavService,
    private channelService: ChannelService,
    private logOutService: LogOutService,
    private showProfileService: ShowProfilService,
    private updateProfilService: UpdateProfilService,
    private databaseService: DatabaseServiceService,
    private userService: UserService
  ) {
    this.navService.state$.subscribe(state => {
      this.state = state;
    });

    this.logOutService.open_logout$.subscribe(state => {
      this.open_logout = state;
    });

    this.showProfileService.open_show_profile$.subscribe(state => {
      this.open_show_profil = state;
    });

    this.showProfileService.open_show_profile_nav$.subscribe(state => {
      this.open_show_profile_nav = state;
    });

    this.updateProfilService.open_update_profil$.subscribe(state => {
      this.open_update_profil = state;
    });

    this.channelService.open_update_channel$.subscribe(state => {
      this.open_edit_channel = state;
    });

    this.databaseService.messages$.subscribe(state => {
      this.chatMessages = state;
    });
    this.channelService.showChannelMsg$.subscribe(show_channel => {
      this.isChannelView = show_channel;
    });

    this.databaseService.channels$.subscribe(channel => {
      this.all_channel = channel;
    });

    /**
     * subscribe to selectedUser$ for the selected user object
     */
    this.userService.selectedUser$.subscribe(selected_user => {
      this.selectedUser = selected_user;
    });

    this.channelService.channelMembers$.subscribe(members => {
      this.ChannelMembers = members;
      console.log('channel_members', this.ChannelMembers);
    });
  }

  ngOnInit(): void {
    this.databaseService.authenticatedUser().subscribe(user => {
      this.authenticatedUser = user;
    });

    this.databaseService.officeTeam().subscribe(team => {
      this.officeTeamChannel = team;
    });
  }

  toggleNavigation() {
    if (!this.close) {
      this.state_text = 'schließen';
    } else {
      this.state_text = 'öffnen   ';
    }
  }

  onCreateChannel() {
    let channelData = {
      channel_name: this.channel_name,
      description: this.channel_description,
      admin: this.authenticatedUser?.user_id,
    };

    let channelMemberData = {
      member_id: this.authenticatedUser?.user_id,
    };
    let office = new Channel(channelData).toObject();
    let members = new ChannelMember(channelMemberData).toObject(); // I will use it for else
    this.databaseService.getOfficeTeamMembers(this.officeTeamChannel?.channel_id, members => {
      if (members) {
        const memberArr = members.map(m => m.member_id);
        if (this.isChecked === 'officeTeam') {
          this.databaseService.addChannel(office);
          memberArr.forEach(member => {
            const newMember = new ChannelMember({ member_id: member, channel_id: office.channel_id }).toObject();
            this.databaseService.addMemberToChannel(newMember);
          });
          this.onCancelAddUser();
        }
      } else {
        console.log('No office members');
      }
    });
  }

  iconPath() {
    if (!this.close) {
      return 'assets/img/icons/Hide-navigation.svg';
    } else {
      return 'assets/img/icons/show-navigation.svg';
    }
  }

  handleToggle() {
    this.close = !this.close;
    this.hide_navigation = !this.hide_navigation;
    this.toggleNavigation();
    this.state_icon = this.iconPath();
  }

  onCloseDialog() {
    this.navService.createChannel();
  }

  toggleCheckTeam() {
    this.isChecked = this.isChecked;
    console.log(this.isChecked);

    return this.isChecked;
  }

  onAddUser() {
    if (this.channel_name) {
      this.onCloseDialog();
      this.open_dialog_add_user = true;
    }
  }

  onAddPerson() {}

  onCancelAddUser() {
    this.open_dialog_add_user = false;
  }

  onOpenEditChannel() {
    this.channelService.editChannelInfos();
  }

  onCloseEditChannel() {
    this.channelService.editChannelInfos();
  }

  onCloseLogout() {
    this.logOutService.updateProfile();
  }
  onCloseShowProfil() {
    this.showProfileService.updateProfile();
  }
  onOpenNavProfile() {
    this.showProfileService.updateNavProfile();
  }

  onCloseUpdateProfil() {
    this.updateProfilService.updateProfile();
  }
}
