import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { ChooseAvatarComponent } from './choose-avatar/choose-avatar.component';
import { NewPasswordComponent } from './new-password/new-password.component';
import { NewPassword2Component } from './new-password2/new-password2.component';


export const routes: Routes = [
    { path: "", component: LoginComponent },
    { path: "signIn", component: SignInComponent },
    { path: "chooseAvatar", component: ChooseAvatarComponent },
    { path: "newPassword", component: NewPasswordComponent},
    { path: "newPassword2", component: NewPassword2Component}
];
