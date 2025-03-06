import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IonItem, IonIcon, IonInput, IonButton} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';

@Component({
  selector: 'app-custom-input',
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.scss'],
  imports: [IonItem, IonIcon, IonInput, ReactiveFormsModule, CommonModule, IonButton],
})
export class CustomInputComponent implements OnInit {
  @Input() control!: FormControl;
  @Input() type!: string;
  @Input() label!: string;
  @Input() autocomplete!: string;
  @Input() icon?: string;

  isPassword! :boolean;
  hide: boolean = true;

  constructor() {
    addIcons({ eyeOffOutline, eyeOutline})
   }

  ngOnInit() { this.isPassword = this.type == "password";}

  showOrHidePassword() {
    this.hide = !this.hide;
    if (this.hide) {
      this.type="password";
    } else {
      this.type="text";
    }
  }
}
