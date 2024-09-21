import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-new-password2',
  standalone: true,
  imports: [
    FooterComponent,
    MatToolbarModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    RouterModule,
  ],
  templateUrl: './new-password2.component.html',
  styleUrl: './new-password2.component.scss'
})
export class NewPassword2Component {

}
