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
  chat!: Message[];
  groupedChat: any;
  userByIdMap: { [userId: string]: any } = {};
  authenticatedUser: User | undefined;
  today!: string;

  constructor(private userService: UserService, private databaseService: DatabaseServiceService) {
    this.databaseService.messages$.subscribe(state => {
      this.chatMessages = state;
    });
  }

  ngOnInit(): void {
    this.databaseService.authenticatedUser().subscribe(user => {
      this.authenticatedUser = user;
    });

    this.userService.userIds$.subscribe(userId => {
      this.toUserId = userId;
    });

    this.userService.chatMessages$.subscribe(msg => {
      this.today = formatDate(new Date(), 'EEEE, dd MMMM y', 'en-US');
      this.chat = msg.sort((a, b) => b.send_date - a.send_date);
      this.groupedChat = this.groupMessagesByDate(this.chat);
      console.log('Group', this.groupMessagesByDate(this.chat));
    });

    this.databaseService.filteredMessages$.subscribe(messages => {
      this.chatMessages = messages;
    });
  }

  fetchUser(userId: string) {
    if (!this.userByIdMap[userId]) {
      this.databaseService.getUserById(userId, user => {
        this.userByIdMap[userId] = user;
      });
    }
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
}
