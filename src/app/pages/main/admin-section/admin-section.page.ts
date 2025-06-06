import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonAvatar, IonButton, IonCol,
  IonIcon, IonLabel, IonItem, IonToggle, IonList
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';
addIcons({
  'trash-outline': trashOutline
});
import { HeaderComponent } from "../../../shared/components/header/header.component";
import { FirebaseService } from 'src/app/services/firebase.service';
import { User } from 'src/app/models/user.model';
import { Subscription } from 'rxjs';
import { Auth, authState } from '@angular/fire/auth';

@Component({
  selector: 'app-admin-section',
  templateUrl: './admin-section.page.html',
  styleUrls: ['./admin-section.page.scss'],
  standalone: true,
  imports: [
    IonList, IonItem, IonLabel, IonIcon, IonCol, IonButton, IonAvatar, IonContent,
    IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, HeaderComponent, IonToggle
  ]
})




export class AdminSectionPage implements OnInit, OnDestroy {
  firebaseService = inject(FirebaseService);
  auth = inject(Auth);

  users: User[] = [];
  usersSub?: Subscription;
  currentUserUid: string | null = null;

  constructor() { }

  async loadUsers() {
    const users$ = await this.firebaseService.getCollectionData('users');
    this.usersSub = users$.subscribe((docs) => {
      this.users = docs.map(doc => ({
        uid: doc['uid'] || doc['id'] || '',
        email: doc['email'] || '',
        password: '',
        name: doc['name'] || '',
        image: doc['image'] || '',
        admin: !!doc['admin']
      }));
    });
  }

  ngOnInit() {
    authState(this.auth).subscribe(user => {
      this.currentUserUid = user ? user.uid : null;
    });
    this.loadUsers();
  }

  ngOnDestroy() {
    if (this.usersSub) {
      this.usersSub.unsubscribe();
    }
  }

  async toggleAdmin(user: User, event: CustomEvent) {
    // Obtenemos el valor del toggle desde event.detail.checked
    const updatedAdmin = event.detail.checked;

    try {
      await this.firebaseService.updateDocument(`users/${user.uid}`, { admin: updatedAdmin });
      // Actualizamos localmente el array para reflejar el cambio inmediato
      const index = this.users.findIndex(u => u.uid === user.uid);
      if (index !== -1) {
        this.users[index].admin = updatedAdmin;
      }
    } catch (error) {
      console.error('Error actualizando admin:', error);
    }
  }

  async deleteUser(user: User) {
  const confirmed = confirm(`¿Estás seguro de que quieres eliminar a ${user.name}? Esta acción no se puede deshacer.`);
  if (!confirmed) return;

  try {
    await this.firebaseService.deleteDocument(`users/${user.uid}`);
    // Actualizar la lista local sin el usuario borrado para reflejar inmediatamente
    this.users = this.users.filter(u => u.uid !== user.uid);
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    alert('No se pudo eliminar el usuario. Inténtalo de nuevo.');
  }
}

}
