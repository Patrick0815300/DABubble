import { Component } from '@angular/core';
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
import { ChatareaComponent } from "../chatarea/chatarea.component";

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
    ChatareaComponent
  ],
  templateUrl: './main-component.component.html',
  styleUrl: './main-component.component.scss',
})
export class MainComponentComponent {
  state_text: string = 'schließen';
  state_icon: string = 'assets/img/icons/Hide-navigation.svg';
  close = false;
  state!: boolean;
  open_logout!: boolean;
  open_show_profil!: boolean;
  open_update_profil!: boolean;
  open_dialog_add_user: boolean = false;
  hide_navigation: boolean = false;

  constructor(
    private navService: NavService,
    private logOutService: LogOutService,
    private showProfileService: ShowProfilService,
    private updateProfilService: UpdateProfilService
  ) {
    this.navService.state$.subscribe(state => {
      this.state = state;
    });
    this.logOutService.open_logout$.subscribe(state => {
      this.open_logout = state;
    });
    this.showProfileService.open_show_profil$.subscribe(state => {
      this.open_show_profil = state;
    });
    this.updateProfilService.open_update_profil$.subscribe(state => {
      this.open_update_profil = state;
    });
  }

  toggleNavigation() {
    if (!this.close) {
      this.state_text = 'schließen';
    } else {
      this.state_text = 'öffnen   ';
    }
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

  onAddUser() {
    this.onCloseDialog();
    this.open_dialog_add_user = true;
  }

  onCancelAddUser() {
    this.open_dialog_add_user = false;
  }

  onCloseLogout() {
    this.logOutService.updateProfile();
  }
  onCloseShowProfil() {
    this.showProfileService.updateProfile();
  }
  onCloseUpdateProfil() {
    this.onCloseShowProfil();
    this.updateProfilService.updateProfile();
  }
}
