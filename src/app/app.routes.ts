import { Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { MainComponentComponent } from './main-component/main-component.component';
import { SigninComponent } from './components/signin/signin.component';

export const routes: Routes = [
  { path: '', component: SigninComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'desktop', component: MainComponentComponent },
];
