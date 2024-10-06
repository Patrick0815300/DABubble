import { Component, Input } from '@angular/core';
import { ChatareaComponent } from "../../chatarea/chatarea.component";

@Component({
  selector: 'app-middle-wrapper',
  standalone: true,
  imports: [ChatareaComponent],
  templateUrl: './middle-wrapper.component.html',
  styleUrl: './middle-wrapper.component.scss',
})
export class MiddleWrapperComponent {
  @Input() hasDefaultPadding: boolean = true;
}
