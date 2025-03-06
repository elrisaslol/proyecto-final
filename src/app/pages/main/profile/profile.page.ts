import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonAvatar, IonButton, IonCol, IonIcon, IonLabel, IonItem } from '@ionic/angular/standalone';
import { UtilsService } from 'src/app/services/utils.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SupabaseService } from 'src/app/services/supabase.service';
import { User } from 'src/app/models/user.model';
import { HeaderComponent } from "../../../shared/components/header/header.component";
import { addIcons } from 'ionicons';
import { cameraOutline, personOutline, personCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonItem, IonLabel, IonIcon, IonCol, IonButton, IonAvatar, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, HeaderComponent]
})
export class ProfilePage implements OnInit {
  utilsService = inject(UtilsService);
  firebaseService = inject(FirebaseService);
  supabaseService = inject(SupabaseService);
  user :User;
  constructor() { 
    this.user = this.utilsService.getLocalStorageUser();
    addIcons({personCircleOutline,cameraOutline,personOutline});
  }

  ngOnInit() {
  }


  async takeImage() {
    const imageDataUrl = (await this.utilsService.takePicture("Imagen de perfil")).dataUrl

    const loading = await this.utilsService.loading();
    await loading.present();

    const path: string = `users/${this.user.uid}`
    if (this.user.image) {
      const oldImagePath = await this.supabaseService.getFilePath(this.user.image)
      await this.supabaseService.deleteFile(oldImagePath!);
    }
    let imagePath = `${this.user.uid}/profile${Date.now()}`;

    const imageUrl = await this.supabaseService.uploadImage(imagePath, imageDataUrl!)
    this.user.image = imageUrl;

    this.firebaseService.updateDocument(path, {image: this.user.image}).then(res => {
      this.utilsService.saveInLocalStorage('user', this.user);
      this.utilsService.presentToast({
        color: "success",
        duration: 1500,
        message: "Foto de perfil actualizada exitosamente",
        position: "middle",
        icon: 'checkmark-circle-outline'
      })
    }).catch(error => {
      this.utilsService.presentToast({
        color: "danger",
        duration: 2500,
        message: error.message,
        position: "middle",
        icon: 'alert-circle-outline'
      })
    }).finally(() => {
      loading.dismiss();
    })
  }

}
