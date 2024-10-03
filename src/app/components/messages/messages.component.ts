import { Message, User } from './../../modules/database.model';
import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MiddleWrapperComponent } from '../../shared/middle-wrapper/middle-wrapper.component';
import { addDoc, collection, Firestore, FirestoreModule, onSnapshot } from '@angular/fire/firestore';
import { FirebaseAppModule } from '@angular/fire/app';
import { DatabaseServiceService } from '../../database-service.service';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeftSideMenuComponent } from '../left-side-menu/left-side-menu.component';
import { UserService } from '../../modules/user.service';
import { ShowProfilService } from '../../modules/show-profil.service';
@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [MiddleWrapperComponent, CommonModule, FormsModule, FirestoreModule, FirebaseAppModule, LeftSideMenuComponent],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss',
})
export class MessagesComponent implements OnInit {
  message_content = '';
  chatMessages: Message[] = [];
  toUserId: string = '';
  chat: Message[] = [];
  groupedChat: any;
  userByIdMap: { [userId: string]: any } = {};
  authenticatedUser: User | undefined;
  today!: string;
  open_show_profile!: boolean;

  constructor(private showProfileService: ShowProfilService, private userService: UserService, private databaseService: DatabaseServiceService) {
    this.databaseService.messages$.subscribe(state => {
      this.chatMessages = state;
    });
    this.showProfileService.open_show_profile$.subscribe(state => {
      this.open_show_profile = state;
    });
  }

  ngOnInit(): void {
    this.databaseService.authenticatedUser().subscribe(user => {
      this.authenticatedUser = user;
      console.log('Auth User', this.authenticatedUser.user_id);
    });

    this.userService.userIds$.subscribe(userId => {
      this.toUserId = userId;
      console.log('current to user', this.toUserId);
    });

    this.userService.chatMessages$.subscribe(msg => {
      this.today = formatDate(new Date(), 'EEEE, dd MMMM y', 'en-US');
      this.chat = msg.sort((a, b) => b.send_date - a.send_date);
      this.groupedChat = this.groupMessagesByDate(this.chat);
      this.loadChatData(this.groupedChat, this.toUserId);
      console.log('Group', this.groupMessagesByDate(this.chat));
    });

    this.databaseService.filteredMessages$.subscribe(messages => {
      this.chatMessages = messages;
    });
  }

  /**
   *Fetch user data for all unique user IDs and cache them for
   * performance improvement
   * @param {array} messages -  array of message
   */
  prefetchUsers(messages: any[], toUserId: string) {
    const uniqueUserIds = new Set<string>();

    messages.forEach(message => {
      if (message.from_user && !this.userByIdMap[message.from_user]) {
        uniqueUserIds.add(message.from_user);
      }
    });

    if (toUserId && !this.userByIdMap[toUserId]) {
      uniqueUserIds.add(toUserId);
    }
    uniqueUserIds.forEach(userId => {
      this.databaseService.getUserById(userId, user => {
        if (user) {
          this.userByIdMap[userId] = user;
        }
      });
    });
  }

  loadChatData(chatGroups: any[], toUserId: string) {
    const allMessages = chatGroups.reduce((acc, group) => [...acc, ...group.messages], []);
    this.prefetchUsers(allMessages, toUserId);
  }

  getCachedUser(userId: string) {
    return this.userByIdMap[userId];
  }

  getAllUsers() {
    return this.databaseService.users;
  }
  getAllMessages() {
    return this.databaseService.messages;
  }

  // onAddUser() {
  //   let user = {
  //     first_name: 'Validate',
  //     last_name: 'validate_last_name',
  //     email: 'validate@gmail.com',
  //     image_file: 'avatar.svg',
  //     password: '33333',
  //     user_id: 'cc8e',
  //     online: false,
  //   };

  //   let newUser = new User(user);
  //   let userOject = newUser.toObject();
  //   this.databaseService.addUser(userOject);
  // }

  onAddMessage(currentUser_id: string | undefined, to_user_id: string) {
    let msg = {
      message_content: this.message_content,
      from_user: currentUser_id,
      to_user: to_user_id,
    };
    let newMessage = new Message(msg);

    let msgObject = newMessage.toObject();

    this.databaseService.addMessage(msgObject);
    this.message_content = '';
  }

  groupMessagesByDate(messages: any[]) {
    const groupedMessages: { [key: string]: any[] } = {};

    messages.forEach(message => {
      const messageDate = this.checkDateIfToday(new Date(message.send_date));

      if (!groupedMessages[messageDate]) {
        groupedMessages[messageDate] = [];
      }
      groupedMessages[messageDate].push(message);
    });

    return Object.entries(groupedMessages).map(([date, msgs]) => ({ date, messages: msgs.sort((a, b) => a.send_date - b.send_date) }));
  }

  checkDateIfToday(date: Date) {
    const formattedDate = formatDate(date, 'EEEE, dd MMMM y', 'en-US');
    return formattedDate === this.today ? 'Today' : formattedDate;
  }

  setTimeFormat(date: Date) {
    return formatDate(date, 'HH:mm', 'en-US');
  }

  onOpenShowProfile() {
    this.showProfileService.updateProfile();
  }
}
