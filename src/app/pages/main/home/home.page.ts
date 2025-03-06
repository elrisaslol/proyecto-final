import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonFab, IonFabButton, IonIcon, IonLabel, IonItem, IonItemSliding, IonList, IonItemOptions, IonItemOption, IonAvatar, IonChip, IonSkeletonText, IonRefresher, IonRefresherContent, RefresherEventDetail, IonCard } from '@ionic/angular/standalone';
import { UtilsService } from 'src/app/services/utils.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { HeaderComponent } from "../../../shared/components/header/header.component";
import { addIcons } from 'ionicons';
import { add, createOutline, trashOutline, bodyOutline } from 'ionicons/icons';
import { AddUpdateMiniatureComponent } from 'src/app/shared/components/add-update-miniature/add-update-miniature.component';
import { Miniature } from 'src/app/models/miniature.model';
import { User } from 'src/app/models/user.model';
import { SupabaseService } from 'src/app/services/supabase.service';
import { QueryOptions } from '../../../services/query-options.interface';
import { IonRefresherCustomEvent } from '@ionic/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonCard, IonRefresherContent, IonRefresher, IonSkeletonText, IonChip, IonAvatar, IonItemOption, IonItemOptions, IonList, IonItemSliding, IonItem, IonLabel, IonIcon, IonFabButton, IonFab, IonContent, CommonModule, FormsModule, HeaderComponent]
})

export class HomePage implements OnInit {
  utilsService = inject(UtilsService);
  firebaseService = inject(FirebaseService)
  supabaseService = inject(SupabaseService);
  miniatures: Miniature[] = [];
  loading: boolean = false;
  constructor() { addIcons({createOutline,trashOutline,bodyOutline,add}); }

  ngOnInit() {
  }

  // signOut() {
  //   this.firebaseService.signOut().then(() => {
  //     this.utilsService.routerLink('/auth');
  //   });
  // }

  async getMiniatures() {
    this.loading = true;
    const user = this.utilsService.getLocalStorageUser();
    const path: string = `users/${user.uid}/miniatures`;
    const queryOptions: QueryOptions = {orderBy: {field: "number", direction: "desc"}}

    let timer: any;

    const resetTimer = () => {
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          sub.unsubscribe();

        }, 5000) 
    };

    let sub = (await this.firebaseService.getCollectionData(path, queryOptions)).subscribe({
      next: (res: any) => {
        console.log("Recibido cambio")
        console.log(res)
        this.miniatures = res;
        this.loading = false;
        resetTimer();
      },
    });
  }

  async addUpdateMiniature(miniature?: Miniature) {
    let success = await this.utilsService.presentModal({ component: AddUpdateMiniatureComponent, cssClass: "add-update-modal", componentProps: { miniature } })
    if (success) {
      this.getMiniatures()
    }
  }

  ionViewWillEnter() {
    this.getMiniatures();
  }

  confirmDeleteMiniature(miniature: Miniature) {
    this.utilsService.presentAlert({
      header: 'Eliminar carta',
      message: '¿Está seguro de que desea eliminar la carta?',
      buttons: [
        {
          text: 'No'
        }, {
          text: 'Sí',
          handler: () => {
            this.deleteMiniature(miniature);
          }
        }
      ]
    });
  }

  async deleteMiniature(miniature: Miniature) {

    const loading = await this.utilsService.loading();
    await loading.present();

    const user: User = this.utilsService.getLocalStorageUser()

    const path: string = `users/${user.uid}/miniatures/${miniature.id}`

    const imagePath = this.supabaseService.getFilePath(miniature.image)
    await this.supabaseService.deleteFile(imagePath!);

    this.firebaseService.deleteDocument(path).then(res => {
      this.miniatures = this.miniatures.filter(listedMiniature => listedMiniature.id !== miniature.id)
      this.utilsService.presentToast({
        color: "success",
        duration: 1500,
        message: "carta borrada exitosamente",
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
  doRefresh(event: any) {
    setTimeout(() => {
      this.getMiniatures();
      event.target.complete();
    }, 2000);
  }
 
}
