import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonButton, IonIcon, IonAvatar } from '@ionic/angular/standalone';
import { HeaderComponent } from "../../../shared/components/header/header.component";
import { CustomInputComponent } from "../../../shared/components/custom-input/custom-input.component";
import { lockClosedOutline, mailOutline, bodyOutline, personOutline, alertCircleOutline, imageOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { FirebaseService } from 'src/app/services/firebase.service';
import { User } from 'src/app/models/user.model';
import { UtilsService } from 'src/app/services/utils.service';
import { SupabaseService } from 'src/app/services/supabase.service';
import { Miniature } from 'src/app/models/miniature.model';
import { doc, collection } from 'firebase/firestore';

@Component({
  selector: 'app-add-update-miniature',
  templateUrl: './add-update-miniature.component.html',
  styleUrls: ['./add-update-miniature.component.scss'],
  imports: [
    IonAvatar, IonIcon, IonButton, IonContent, CommonModule,
    FormsModule, HeaderComponent, CustomInputComponent, ReactiveFormsModule
  ]
})
export class AddUpdateMiniatureComponent implements OnInit {
  @Input() miniature: Miniature | null = null;
  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);
  supabaseService = inject(SupabaseService);
  user: User = {} as User;

  form = new FormGroup({
    id: new FormControl(''),
    image: new FormControl('', [Validators.required]),
    num_de_regs_inv_o_idnt: new FormControl('', [Validators.required, Validators.minLength(4)]),
    objeto: new FormControl('', Validators.required),
    tipologia: new FormControl('', Validators.required),
    autoria_taller_emisor: new FormControl('', Validators.required),
    titulo: new FormControl('', Validators.required),
    materias: new FormControl('', Validators.required),
    tecnicas: new FormControl('', Validators.required),
    contextocultural_escuela: new FormControl('', Validators.required),
    dimensiones: new FormControl('1x1 cm', Validators.required),
    peso: new FormControl('1 gm', Validators.required),
    procedencia: new FormControl('', Validators.required),
    localizacion_topografica: new FormControl('', Validators.required),
    estado_de_conservacion: new FormControl('', Validators.required),
    estado_de_restauracion: new FormControl('', Validators.required),
    observaciones: new FormControl(''),
    titularidad: new FormControl('', Validators.required),
    forma_de_ingreso: new FormControl('', Validators.required),
    fuente_de_ingreso: new FormControl('', Validators.required),
    fecha_de_ingreso: new FormControl(new Date().toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }), [Validators.required, Validators.minLength(4)]),
    createdBy: new FormControl(''),
    lastModifiedBy: new FormControl('')
  });

  constructor() {
    addIcons({
      mailOutline, lockClosedOutline, bodyOutline, alertCircleOutline,
      personOutline, imageOutline, checkmarkCircleOutline
    });
  }

  ngOnInit() {
    this.user = this.utilsService.getLocalStorageUser();
    if (this.miniature) {
      this.form.patchValue(this.miniature);
    }
  }

  async takeImage() {
    const dataUrl = (await this.utilsService.takePicture("Imagen")).dataUrl;
    if (dataUrl) {
      this.form.controls.image.setValue(dataUrl);
    }
  }

  async submit() {
    if (this.miniature) {
      await this.updateMiniature();
    } else {
      await this.createMiniature();
    }
  }

  async createMiniature() {
    const loading = await this.utilsService.loading();
    await loading.present();

    try {
      // Generar ID único para la nueva miniatura
      const id = doc(collection(this.firebaseService.firestore, `miniatures`)).id;

      // Subir imagen y reemplazar el campo en el form
      const imageDataUrl = this.form.value.image;
      const imagePath = `${this.user.uid}/${Date.now()}`;
      const imageUrl = await this.supabaseService.uploadImage(imagePath, imageDataUrl!);
      this.form.controls.image.setValue(imageUrl);

      // Preparar datos con createdBy y lastModifiedBy
      const dataToSave = {
        ...this.form.value,
        id,
        createdBy: this.user.uid,
        lastModifiedBy: this.user.uid
      };

      // Guardar solo en la colección global 'miniatures'
      await this.firebaseService.addDocumentWithId('miniatures', id, dataToSave);

      this.utilsService.dismissModal({ success: true });
      this.utilsService.presentToast({
        color: "success",
        duration: 1500,
        message: "Miniatura añadida exitosamente",
        position: "middle",
        icon: 'checkmark-circle-outline'
      });

    } catch (error: any) {
      this.utilsService.presentToast({
        color: "danger",
        duration: 2500,
        message: error.message,
        position: "middle",
        icon: 'alert-circle-outline'
      });
    } finally {
      loading.dismiss();
    }
  }

  async updateMiniature() {
    const loading = await this.utilsService.loading();
    await loading.present();

    const id = this.miniature!.id;
    const path = `miniatures/${id}`;

    try {
      // Si la imagen cambió, se reemplaza en Supabase
      if (this.form.value.image !== this.miniature!.image) {
        const imageDataUrl = this.form.value.image;
        const imagePath = await this.supabaseService.getFilePath(this.miniature!.image);
        const imageUrl = await this.supabaseService.uploadImage(imagePath!, imageDataUrl!);
        this.form.controls.image.setValue(imageUrl);
      }

      // Preparamos datos para actualizar
      const dataToUpdate = {
        ...this.form.value,
        lastModifiedBy: this.user.uid // actualizar quien modificó
      };
      delete dataToUpdate.id; // el id ya está en la ruta

      // Actualizar documento en la colección global
      await this.firebaseService.updateDocument(path, dataToUpdate);

      this.utilsService.dismissModal({ success: true });
      this.utilsService.presentToast({
        color: "success",
        duration: 1500,
        message: "Miniatura actualizada exitosamente",
        position: "middle",
        icon: 'checkmark-circle-outline'
      });

    } catch (error: any) {
      this.utilsService.presentToast({
        color: "danger",
        duration: 2500,
        message: error.message,
        position: "middle",
        icon: 'alert-circle-outline'
      });
    } finally {
      loading.dismiss();
    }
  }
}
