import { Injectable } from '@angular/core';
import { MainServiceService } from './main-service.service';
import { getDoc, updateDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ReactionServiceService {

  constructor(private mainService: MainServiceService) { }

  async addReactionToMessage(channelId: string, messageId: string, reactionType: string, userId: string, reactionPath: string): Promise<void> {
    const messageDocRef = this.mainService.getSingleChannelRef(`channels/${channelId}/messages`, messageId);
    const snapshot = await getDoc(messageDocRef);
    const messageData = snapshot.data();
    const reactions = messageData?.['reactions'] || [];

    const existingReactionIndex = reactions.findIndex((reaction: any) => reaction.type === reactionType && reaction.userId === userId);

    if (existingReactionIndex !== -1) {
      reactions[existingReactionIndex].count += 1;
    } else {
      reactions.push({
        type: reactionType,
        userId: userId,
        count: 1,
        path: reactionPath,
      });
    }
    await updateDoc(messageDocRef, { reactions: reactions });
  }
}
