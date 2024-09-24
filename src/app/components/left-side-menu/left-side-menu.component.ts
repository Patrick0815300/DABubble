import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { ProfileComponent } from '../../shared/profile/profile.component';
import { WrapperComponent } from '../../shared/wrapper/wrapper.component';
import { CommonModule } from '@angular/common';
import { NavService } from '../../modules/nav.service';

@Component({
  selector: 'app-left-side-menu',
  standalone: true,
  imports: [WrapperComponent, ProfileComponent, CommonModule],
  templateUrl: './left-side-menu.component.html',
  styleUrl: './left-side-menu.component.scss',
})
export class LeftSideMenuComponent {
  avatar = 'Elise_Roth.svg';
  is_authenticated = true;
  state: boolean = false;
  active: boolean = false;
  selectedIndex!: number;
  selectedChannelIndex!: number;
  collapse: boolean = false;
  expand: boolean = false;

  constructor(private navService: NavService) {
    this.navService.state$.subscribe(state => {
      this.state = state;
    });
  }

  onOpen() {
    this.navService.createChannel();
  }

  onActive() {
    this.active = true;
  }

  selectUser(index: number) {
    this.selectedIndex = index;
  }
  selectChannel(index: number) {
    this.selectedChannelIndex = index;
  }

  onCollapse() {
    this.collapse = !this.collapse;
  }
  onExpand() {
    this.expand = !this.expand;
  }
}
