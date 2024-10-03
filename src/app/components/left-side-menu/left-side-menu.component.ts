import { Component, EventEmitter, OnInit, output, Output } from '@angular/core';

import { ProfileComponent } from '../../shared/profile/profile.component';
import { WrapperComponent } from '../../shared/wrapper/wrapper.component';
import { CommonModule } from '@angular/common';
import { NavService } from '../../modules/nav.service';
import { DatabaseServiceService } from '../../database-service.service';
import { User, Message } from '../../modules/database.model';
import { combineLatest, forkJoin, Observable, of, switchMap, filter, from } from 'rxjs';
import { onSnapshot } from '@angular/fire/firestore';
import { UserService } from '../../modules/user.service';

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
  nameState: User = new User();
  active: boolean = false;
  selectedIndex!: number;
  selectedChannelIndex!: number;
  collapse: boolean = false;
  expand: boolean = false;
  users$: Observable<User[]> = new Observable<User[]>();
  messages$: Observable<Message[]> = new Observable<Message[]>();
  directMessages$: Observable<Message[]> = new Observable<Message[]>();
  userFromId: string | undefined;
  authenticatedUser: User | undefined;
  pictureFromId: string | undefined;
  userNames: { [userId: string]: string } = {};
  users: User[] = [new User()];
  messages: Message[] = [new Message()];
  chatMessages: Message[] = [];
  chat!: Message[];
  allDirectMsg: Message[] = [new Message()];
  usersMap: { [key: string]: User } = {};
  messagesMap: { [key: string]: Message } = {};
  toUserId!: string;
  onlineUsers: any[] = [];
  userById: any | null = null;
  userByIdMap: { [userId: string]: any } = {};
  chatMap: { [key: string]: any[] } = {};

  /**
   * @constructor
   * @param {NavService} navService - instance of NavService for subscribing to the
   * Observable state$
   */
  constructor(private userService: UserService, private navService: NavService, public databaseService: DatabaseServiceService) {
    this.navService.state$.subscribe(state => {
      this.state = state;
    });
  }

  ngOnInit(): void {
    this.databaseService.onlineUsers$.subscribe(users => {
      this.onlineUsers = users;
    });

    this.users$ = this.databaseService.snapUsers();
    this.messages$ = this.databaseService.snapMessages();
    this.databaseService.authenticatedUser().subscribe(user => {
      this.authenticatedUser = user;
      // this.toUserId = this.authenticatedUser?.user_id;
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

    this.userService.userIds$.subscribe(userId => {
      this.toUserId = userId;
    });
    this.userService.chatMessages$.subscribe(msg => {
      this.chat = msg;
    });
  }

  fetchUser(userId: string) {
    console.log(userId);

    if (!this.userByIdMap[userId]) {
      console.log('inside');

      this.databaseService.getUserById(userId, user => {
        this.userByIdMap[userId] = user;
      });
    }
    console.log('outside');

    return this.userByIdMap[userId];
  }

  loadMessages(currentUserId: string | undefined, targetUserId: string) {
    const cacheKey = `${currentUserId}-${targetUserId}`;

    // if (!this.chatMap[cacheKey]) {
    console.log('I load again msg');

    this.databaseService.getMessages(currentUserId, targetUserId, messages => {
      if (messages) {
        this.chatMap[cacheKey] = messages;
        console.log('Messages', messages);
        this.userService.emitChat(messages);
      } else {
        this.chatMap[cacheKey] = [];
        this.userService.emitChat([]);
      }
    });
    // }

    return this.chatMap[cacheKey];
  }

  onSelectUser(currentUserId: string | undefined, targetUserId: string): void {
    this.databaseService.filterDirectMessages(currentUserId, targetUserId);
  }

  sendUserId(to_id: string) {
    this.userService.emitUserId(to_id);
  }

  getPicture(id: string) {
    return this.databaseService.pictureFromID(id);
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
