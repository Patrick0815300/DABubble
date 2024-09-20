import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignInComponent } from './sign-in/sign-in.component';

export const routes: Routes = [
    {path: "", component: LoginComponent},
    {path: "signIn", component: SignInComponent}
];
