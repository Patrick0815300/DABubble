import { Injectable } from '@angular/core';
import { Firestore } from 'firebase/firestore';
import { MainServiceService } from './main-service.service';
import { ChatServiceService } from './chat-service.service';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {

  constructor(private firestore: Firestore, private mainService: MainServiceService, private chatService: ChatServiceService) { }

  loadChannels() {
    const channels = this.mainService.getChannelRef('channels')
    console.log(channels);

  }
}
