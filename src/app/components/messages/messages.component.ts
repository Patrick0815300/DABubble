import { Message, User } from './../../modules/database.model';
import { Component, DoCheck, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { MiddleWrapperComponent } from '../../shared/middle-wrapper/middle-wrapper.component';
import { FirestoreModule } from '@angular/fire/firestore';
import { FirebaseAppModule } from '@angular/fire/app';
import { DatabaseServiceService } from '../../database-service.service';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeftSideMenuComponent } from '../left-side-menu/left-side-menu.component';
import { UserService } from '../../modules/user.service';
import { ShowProfilService } from '../../modules/show-profil.service';
import { ChannelService } from '../../modules/channel.service';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiPickerComponent } from '../../shared/emoji-picker/emoji-picker.component';
import { EmojiService } from '../../modules/emoji.service';
import { SearchUserComponent } from '../search-user/search-user.component';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [MiddleWrapperComponent, CommonModule, FormsModule, FirestoreModule, FirebaseAppModule, LeftSideMenuComponent, PickerModule, EmojiPickerComponent, SearchUserComponent],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss',
})
export class MessagesComponent implements OnInit {
  message_content = '';
  chatMessages: Message[] = [];
  toUserId: string = '';
  toChannelId: string = '';
  chat: Message[] = [];
  channelChat: Message[] = [];
  groupedChat: any;
  userByIdMap: { [userId: string]: any } = {};
  authenticatedUser: User | undefined;
  today!: string;
  open_show_profile!: boolean;
  selectedUser: User = new User();
  show_delete_msg!: number;
  update_message: string = '';
  is_update_msg: boolean = false;
  update_group!: number;
  update_chat!: number;
  update_title = formatDate(new Date(), 'EEEE, dd MMMM y HH:MM', 'de-DE');
  is_response: boolean = false;
  toggleEmojiPicker: boolean = false;
  showSearchUserName: boolean = false;
  excludeClick = false;
  chosenEmoji: string = '';
  pickedUserArray: string[] = [];
  chosenReaction: string = '';
  isMainEmoji: boolean = true;
  messageId: string = '';
  constructor(
    private channelService: ChannelService,
    private elementRef: ElementRef,
    private showProfileService: ShowProfilService,
    private userService: UserService,
    private databaseService: DatabaseServiceService,
    private emojiService: EmojiService
  ) {
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
      console.log('Auth User ooo', this.authenticatedUser.user_id);
    });

    this.userService.userIds$.subscribe(userId => {
      this.toUserId = userId;
      console.log('current to user no', this.toUserId);
    });

    this.userService.chatMessages$.subscribe(msg => {
      this.today = formatDate(new Date(), 'EEEE, dd MMMM y', 'de-DE');
      this.chat = msg.sort((a, b) => b.send_date - a.send_date);
      this.groupedChat = this.groupMessagesByDate(this.chat);
      this.loadChatData(this.groupedChat, this.toUserId);
      this.message_content = '';
    });

    this.databaseService.filteredMessages$.subscribe(messages => {
      this.chatMessages = messages;
    });

    /**
     * subscribe to selectedUser$ for the selected user object
     */
    this.userService.selectedUser$.subscribe(selected_user => {
      this.selectedUser = selected_user;
      this.onCancelUpdateMsg();
      console.log('selected User is:', this.selectedUser);
    });

    this.userService.selectedMessageId$.subscribe(id => {
      this.messageId = id;
    });

    /**
     * this method add the selected emoji to the current tipped message
     */
    this.emojiService.emoji$.subscribe((emoji: string) => {
      console.log('chat_up', this.update_chat, 'group_up', this.update_group);
      this.chosenReaction = emoji;

      if (this.update_chat != undefined && this.update_chat !== -1) {
        this.update_message = this.update_message ? this.update_message + emoji : emoji;
      } else if (this.isMainEmoji) {
        this.message_content = this.message_content ? this.message_content + emoji : emoji;
      } else if (!this.isMainEmoji) {
        this.onAddReaction(this.messageId);
      }
    });

    /**
     * this method manage the state of emoji picker. If the  user picks an emoji it handles the
     * closing of the picker
     */
    this.emojiService.toggle_emoji_picker$.subscribe(statePicker => {
      this.toggleEmojiPicker = statePicker;
    });

    this.userService.toggle_show_search_user$.subscribe(state => {
      this.showSearchUserName = state;
    });

    this.userService.clickedInsideButton$.subscribe(isClicked => {
      this.excludeClick = isClicked;
    });

    this.userService.pickedUser$.subscribe(user => {
      if (this.message_content[this.message_content.length - 1] === '@') {
        this.message_content = this.message_content ? this.message_content + `${user.name} ` : `${user.name} `;
      } else {
        this.message_content = this.message_content ? this.message_content + ` @${user.name} ` : ` @${user.name} `;
      }
    });

    this.channelService.userPicked$.subscribe(users => {
      this.pickedUserArray = users;
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

  onAddMessage(to_user_id: string) {
    if (this.pickedUserArray.length != 0) {
      this.pickedUserArray.push(to_user_id);
      this.pickedUserArray.forEach(userId => {
        let msgVal = this.messageSender(userId);
        this.databaseService.addMessage(msgVal);
      });
    } else {
      let msgObject = this.messageSender(to_user_id);
      this.databaseService.addMessage(msgObject);
    }
    this.message_content = '';
  }

  messageSender(receiverId: string): object {
    let msg = {
      message_content: this.message_content,
      from_user: this.authenticatedUser?.user_id,
      to_user: receiverId,
    };
    let newMessage = new Message(msg);

    return newMessage.toObject();
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
    const formattedDate = formatDate(date, 'EEEE, dd MMMM y', 'de-DE');
    return formattedDate === this.today ? 'heute' : formattedDate;
  }

  setTimeFormat(date: Date) {
    return formatDate(date, 'HH:mm', 'en-US');
  }

  onOpenShowProfile() {
    this.showProfileService.updateProfile();
  }

  sendSelectedUser(user: User) {
    this.userService.emitSelectedUser(user);
  }

  sendSelectedMsgId(id: string) {
    this.userService.emitSelectedMessageId(id);
    this.isMainEmoji = false;
  }

  onShowDeleteDialog(index: number) {
    if (this.show_delete_msg === index) {
      this.show_delete_msg = -1;
    } else {
      this.show_delete_msg = index;
    }
  }

  onDeleteMessage(msgId: string) {
    this.databaseService.deleteDocument('messages', 'message_id', msgId);
    this.show_delete_msg = -1;
  }

  onUpdateMessage(msgContent: string, index_chat: number, index_group: number) {
    this.update_chat = index_chat;
    this.update_group = index_group;
    this.update_message = msgContent;
    this.show_delete_msg = -1;
    console.log('Chat:', this.update_chat, 'Group', this.update_group);
  }

  handleUpdateMsg(currentMsgId: string) {
    this.channelService
      .updateChannelData('messages', 'message_id', currentMsgId, { message_content: this.update_message })
      .then(() => this.channelService.updateChannelData('messages', 'message_id', currentMsgId, { is_updated: true }));
    this.update_message = '';
    this.onCancelUpdateMsg();
  }

  onCancelUpdateMsg() {
    this.update_group = -1;
    this.update_chat = -1;
    this.is_response = false;
  }

  onRespond(index_chat: number, index_group: number) {
    this.is_response = true;
    this.update_chat = index_chat;
    this.update_group = index_group;
    this.show_delete_msg = -1;
  }

  handleResponse(currentMsg: Message) {
    let msg = {
      message_content: this.update_message,
      response_content: currentMsg?.message_content,
      from_user_origin: currentMsg?.from_user,
      from_user: this.authenticatedUser?.user_id,
      to_user: currentMsg?.to_user === this.authenticatedUser?.user_id ? currentMsg?.from_user : currentMsg?.to_user,
    };

    let newMessage = new Message(msg);

    let msgObject = newMessage.toObject();

    this.databaseService.addMessage(msgObject);
    this.update_message = '';
    this.onCancelUpdateMsg();
  }

  onShowEmojiPicker() {
    this.emojiService.handleShowPicker();
    this.showSearchUserName ? this.userService.emitShowSearchUser(!this.showSearchUserName) : '';
  }

  sendShowSearchUser() {
    this.userService.emitShowSearchUser(!this.showSearchUserName);
    this.toggleEmojiPicker ? this.emojiService.handleShowPicker() : '';
  }

  onButtonClick() {
    this.isMainEmoji = true;
    this.userService.setClickedInsideButton(true);
  }

  onAddReaction(message_id: string) {
    this.channelService.updateChannelData('messages', 'message_id', message_id, { reaction: this.chosenReaction });
  }

  onAddThreadMsg(event: Event) {
    if (!this.message_content && this.showSearchUserName) {
      this.userService.emitShowSearchUser(false);
    }
    const inputElement = event.target as HTMLInputElement;
    const enteredText = inputElement.selectionStart;
    if (enteredText !== null) {
      const currentChar = this.message_content[enteredText - 1];
      if (currentChar === '@') {
        this.sendShowSearchUser();
      }
    }
  }
}
