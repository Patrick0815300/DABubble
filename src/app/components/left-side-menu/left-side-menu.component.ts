import { Component, OnInit } from '@angular/core';
import { ProfileComponent } from '../../shared/profile/profile.component';
import { WrapperComponent } from '../../shared/wrapper/wrapper.component';
import { CommonModule } from '@angular/common';
import { NavService } from '../../modules/nav.service';
import { DatabaseServiceService } from '../../database-service.service';
import { User, Channel, Message } from '../../modules/database.model';
import { combineLatest, Observable, of, switchMap, map } from 'rxjs';
import { UserService } from '../../modules/user.service';
import { ChannelService } from '../../modules/channel.service';

@Component({
  selector: 'app-left-side-menu',
  standalone: true,
  imports: [WrapperComponent, ProfileComponent, CommonModule],
  templateUrl: './left-side-menu.component.html',
  styleUrl: './left-side-menu.component.scss',
})
export class LeftSideMenuComponent implements OnInit {
  avatar = 'Elise_Roth.svg';
  is_authenticated = true;
  state: boolean = false;
  active: boolean = false;
  show_channel_msg!: boolean;
  selectedIndex!: number;
  selectedChannelIndex!: number;
  collapse: boolean = false;
  expand: boolean = false;
  users$: Observable<User[]> = new Observable<User[]>();
  channels$: Observable<Channel[]> = new Observable<Channel[]>();
  messages$: Observable<Message[]> = new Observable<Message[]>();
  directMessages$: Observable<Message[]> = new Observable<Message[]>();
  authenticatedUser: User | undefined;
  userNames: { [userId: string]: string } = {};
  users: User[] = [new User()];
  messages: Message[] = [new Message()];
  chatMessages: Message[] = [];
  chat!: Message[];
  usersMap: { [key: string]: User } = {};
  messagesMap: { [key: string]: Message } = {};
  toUserId!: string;
  all_channel!: Channel[];
  channel: Channel = new Channel();
  onlineUsers: any[] = [];
  selectedUser: User | undefined;
  userById: any | null = null;
  userByIdMap: { [userId: string]: any } = {};
  chatMap: { [key: string]: any[] } = {};

  /**
   * @constructor
   * @param {NavService} navService - instance of NavService for subscribing to the
   * Observable state$
   */
  constructor(private userService: UserService, private channelService: ChannelService, private navService: NavService, private databaseService: DatabaseServiceService) {
    this.navService.state$.subscribe(state => {
      this.state = state;
    });

    //this.channelService.loadChannels();
  }

  ngOnInit(): void {
    this.databaseService.onlineUsers$.subscribe(users => {
      this.onlineUsers = users;
    });

    this.users$ = this.databaseService.snapUsers();
    this.channels$ = this.databaseService.snapChannels();
    this.messages$ = this.databaseService.snapMessages();

    this.databaseService.channels$.subscribe(channel => {
      this.all_channel = channel;
    });

    this.databaseService.authenticatedUser().subscribe(user => {
      this.authenticatedUser = user;
    });

    /**
     * find the direct messages from the authenticated user
     */
    this.directMessages$ = combineLatest([this.databaseService.authenticatedUser(), this.messages$]).pipe(
      switchMap(([authenticatedUser, messages]) => {
        if (authenticatedUser) {
          return this.databaseService.directMessages(authenticatedUser.user_id);
        } else {
          return of([]);
        }
      })
    );

    this.databaseService.getAllMessages().subscribe(messages => {
      this.chatMessages = messages;
    });

    this.databaseService.getAllUsers().subscribe(users => {
      this.usersMap = users.reduce((acc, user) => {
        acc[user.user_id] = user;
        return acc;
      }, {} as { [key: string]: User });
    });

    this.databaseService.getAllMessages().subscribe(messages => {
      this.messagesMap = messages.reduce((acc, message) => {
        acc[message.message_id] = message;
        return acc;
      }, {} as { [key: string]: Message });
    });

    /**
     * subscribe to userIds$ for the Id of the selected user
     */
    this.userService.userIds$.subscribe(userId => {
      this.toUserId = userId;
    });

    /**
     * subscribe to channelId$ for the Id of the selected channel
     */
    // this.userService.channelIds$.subscribe(id => {
    //   this.channelId = id;
    // });

    this.userService.channel$.subscribe(channel => {
      this.channel = channel;
    });

    /**
     * subscribe to selectedUser$ for the selected user object
     */
    this.userService.selectedUser$.subscribe(selected_user => {
      this.selectedUser = selected_user;
    });

    this.channelService.showChannelMsg$.subscribe(is_channel => {
      this.show_channel_msg = is_channel;
    });

    this.userService.chatMessages$.subscribe(msg => {
      this.chat = msg;
    });
  }

  loadMessages(currentUserId: string | undefined, targetUserId: string) {
    console.log('I load again msg');
    this.databaseService.getMessages(currentUserId, targetUserId, messages => {
      if (messages) {
        console.log('Messages', messages);
        if (currentUserId !== targetUserId) {
          messages = messages.filter(m => m.from_user !== m.to_user);
        }
        this.userService.emitChat(messages);
      } else {
        this.userService.emitChat([]);
      }
    });
  }

  loadChannelMembers(channel_id: string) {
    this.databaseService.getChannelMembers(channel_id, members => {
      if (members) {
        console.log('channel Members', members);

        this.channelService.emitChannelMembers(members);
      } else {
        this.channelService.emitChannelMembers([]);
      }
    });
  }

  loadChannelMessages(targetChannelId: string) {
    console.log('I load again msg');
    this.databaseService.getChannelMessages(targetChannelId, messages => {
      if (messages) {
        console.log('Channel Msg', messages);
        this.userService.emitChannelMessage(messages);
      } else {
        this.userService.emitChannelMessage([]);
      }
    });
  }

  sendUserId(to_id: string) {
    this.userService.emitUserId(to_id);
  }

  // sendChannelId(id: string) {
  //   this.userService.emitChannelId(id);
  // }

  sendChannel(channel: Channel) {
    this.userService.emitChannel(channel);
  }

  showChannelMessages(isShown: boolean) {
    this.channelService.emitChannelView(isShown);
  }

  sendSelectedUser(user: User) {
    this.userService.emitSelectedUser(user);
  }

  /**
   * open the dialog for creating a new channel
   */
  onOpen() {
    this.navService.createChannel();
  }

  /**
   * set active to true if the current user is authenticated.
   * This is used to set the green flag on the user profile.
   */
  onActive() {
    this.active = true;
  }

  /**
   *
   * @param {Number} index - Index of the current user
   */
  selectUser(index: number) {
    this.selectedIndex = index;
  }

  /**
   *
   * @param {Number} index - Index of the current channel
   */
  selectChannel(index: number) {
    this.selectedChannelIndex = index;
  }

  /**
   * Allow expanding and collapsing the list of direct message users
   */
  onCollapse() {
    this.collapse = !this.collapse;
  }

  /**
   * Allow expanding and collapsing the list of channels
   */
  onExpand() {
    this.expand = !this.expand;
  }
}
