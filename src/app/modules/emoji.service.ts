import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmojiService {
  private emojiSubject = new BehaviorSubject<string>('');
  private logShowPickerSubject = new BehaviorSubject<boolean>(false);
  emoji$ = this.emojiSubject.asObservable();
  toggle_emoji_picker$ = this.logShowPickerSubject.asObservable();
  isPickerOpen = false;
  constructor() { }

  selectEmoji(emoji: string) {
    this.emojiSubject.next(emoji);
  }

  handleShowPicker() {
    this.isPickerOpen = !this.isPickerOpen;
    this.logShowPickerSubject.next(this.isPickerOpen);
  }
}
