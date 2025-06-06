import { Component, inject, OnInit, OnDestroy } from '@angular/core'; // Añadido OnDestroy para limpieza 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonFab, IonFabButton, IonIcon, IonLabel, IonItem, IonItemSliding, IonList,
  IonItemOptions, IonItemOption, IonAvatar, IonChip, IonSkeletonText, IonRefresher,
  IonRefresherContent, RefresherEventDetail, IonCard
} from '@ionic/angular/standalone';
import { UtilsService } from 'src/app/services/utils.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { HeaderComponent } from "../../../shared/components/header/header.component";
import { addIcons } from 'ionicons';
import { add, createOutline, trashOutline, bodyOutline, chevronForwardOutline, searchOutline } from 'ionicons/icons';
import { AddUpdateMiniatureComponent } from 'src/app/shared/components/add-update-miniature/add-update-miniature.component';
import { ViewMiniatureComponent } from 'src/app/shared/components/view-miniature/view-miniature.component';
import { Miniature } from 'src/app/models/miniature.model';
import { User } from 'src/app/models/user.model';
import { SupabaseService } from 'src/app/services/supabase.service';
import { QueryOptions } from '../../../services/query-options.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonCard, IonRefresherContent, IonRefresher, IonSkeletonText, IonChip, IonAvatar,
    IonItemOption, IonItemOptions, IonList, IonItemSliding, IonItem, IonLabel,
    IonIcon,ViewMiniatureComponent, IonFabButton, IonFab, IonContent, CommonModule, FormsModule, HeaderComponent
  ]
})
export class HomePage implements OnInit, OnDestroy {
  utilsService = inject(UtilsService);
  firebaseService = inject(FirebaseService);
  supabaseService = inject(SupabaseService);

  miniatures: Miniature[] = []; // Array con los registros de inventario
  loading: boolean = false; // Control de carga para mostrar skeleton o datos
  private miniaturesSub: any; // Suscripción para cancelar y evitar fugas de memoria

  user: User;
  
  constructor() {
    addIcons({chevronForwardOutline,searchOutline,createOutline,trashOutline,add,bodyOutline});
    this.user = this.utilsService.getLocalStorageUser()!;
  }

  ngOnInit() {
    console.log('[HomePage] ngOnInit ejecutado');
  }

  ngOnDestroy() {
    console.log('[HomePage] ngOnDestroy ejecutado - limpiando suscripción');
    if (this.miniaturesSub) {
      this.miniaturesSub.unsubscribe();
    }
  }

  async getMiniatures() {
    this.loading = true;

    // Ahora obtenemos miniaturas de la colección global
    const path: string = `miniatures`;

    // Orden ascendente por campo num_de_regs_inv_o_idnt
    const queryOptions: QueryOptions = { orderBy: { field: "num_de_regs_inv_o_idnt", direction: "asc" } };

    // Cancelar suscripción previa si existe para evitar memoria
    if (this.miniaturesSub) {
      this.miniaturesSub.unsubscribe();
    }

    // Suscribirse a cambios en la colección global con orden
    this.miniaturesSub = (await this.firebaseService.getCollectionData(path, queryOptions)).subscribe({
      next: (res: any[]) => {
        console.log('[HomePage] getMiniatures - datos recibidos:', res.length, 'registros');
        // Mapear datos para que coincidan con la interfaz Miniature
        this.miniatures = res.map(doc => ({
          id: doc.id,
          image: doc.image,
          num_de_regs_inv_o_idnt: doc.num_de_regs_inv_o_idnt,
          objeto: doc.objeto,
          tipologia: doc.tipologia,
          autoria_taller_emisor: doc.autoria_taller_emisor,
          titulo: doc.titulo,
          materias: doc.materias,
          tecnicas: doc.tecnicas,
          contextocultural_escuela: doc.contextocultural_escuela,
          dimensiones: doc.dimensiones,
          peso: doc.peso,
          procedencia: doc.procedencia,
          localizacion_topografica: doc.localizacion_topografica,
          estado_de_conservacion: doc.estado_de_conservacion,
          estado_de_restauracion: doc.estado_de_restauracion,
          observaciones: doc.observaciones,
          titularidad: doc.titularidad,
          forma_de_ingreso: doc.forma_de_ingreso,
          fuente_de_ingreso: doc.fuente_de_ingreso,
          fecha_de_ingreso: doc.fecha_de_ingreso,
          createdBy: doc.createdBy,
          lastModifiedBy: doc.lastModifiedBy,
        }));
        this.loading = false;
      },
      error: (err: any) => {
        console.error('[HomePage] Error al obtener registros de inventario', err);
        this.loading = false;
      }
    });
  }

  async addUpdateMiniature(miniature?: Miniature) {
    console.log('[HomePage] addUpdateMiniature - abriendo modal', miniature);
    const success = await this.utilsService.presentModal({
      component: AddUpdateMiniatureComponent,
      cssClass: "add-update-modal",
      componentProps: { miniature }
    });
    if (success) {
      console.log('[HomePage] addUpdateMiniature - modal cerrado con éxito, refrescando lista');
      this.getMiniatures();
    }
  }

  ionViewWillEnter() {
    console.log('[HomePage] ionViewWillEnter - cargando miniaturas');
    this.getMiniatures();
  }

  confirmDeleteMiniature(miniature: Miniature) {
    console.log('[HomePage] confirmDeleteMiniature - confirmando eliminación', miniature);
    this.utilsService.presentAlert({
      header: 'Eliminar registro',
      message: '¿Está seguro de que desea eliminar el registro?',
      buttons: [
        { text: 'No' },
        {
          text: 'Sí',
          handler: () => {
            this.deleteMiniature(miniature);
          }
        }
      ]
    });
  }

  async deleteMiniature(miniature: Miniature) {
    console.log('[HomePage] deleteMiniature - iniciando eliminación', miniature);
    const loading = await this.utilsService.loading();
    await loading.present();

    // Ruta del documento en colección global
    const path: string = `miniatures/${miniature.id}`;

    // Obtener ruta de imagen para borrar en Supabase
    const imagePath = await this.supabaseService.getFilePath(miniature.image);

    try {
      console.log('[HomePage] deleteMiniature - borrando imagen en supabase', imagePath);
      if (imagePath) {
        await this.supabaseService.deleteFile(imagePath);
      } else {
        console.warn('[HomePage] deleteMiniature - no se encontró ruta de imagen para borrar');
      }

      console.log('[HomePage] deleteMiniature - borrando documento en firestore', path);
      await this.firebaseService.deleteDocument(path);

      // Actualizar array local
      this.miniatures = this.miniatures.filter(m => m.id !== miniature.id);
      console.log('[HomePage] deleteMiniature - registro eliminado localmente');

      this.utilsService.presentToast({
        color: "success",
        duration: 1500,
        message: "Registro borrado exitosamente",
        position: "middle",
        icon: 'checkmark-circle-outline'
      });

    } catch (error: unknown) {
      console.error("[HomePage] deleteMiniature - error al borrar registro o imagen:", error);
      const message = error && typeof error === 'object' && 'message' in error
        ? (error as { message: string }).message
        : 'Error desconocido';
      this.utilsService.presentToast({
        color: "danger",
        duration: 2500,
        message: message,
        position: "middle",
        icon: 'alert-circle-outline'
      });
    } finally {
      loading.dismiss();
    }
  }

  async viewMiniature(miniature: Miniature) {
    console.log('[HomePage] viewMiniature - abriendo modal', miniature);
    const modal = await this.utilsService.presentModal({
      component: ViewMiniatureComponent,
      cssClass: "view-miniature-modal",
      componentProps: { miniature }
    });
  }

  doRefresh(event: any) {
    console.log('[HomePage] doRefresh - refrescando miniaturas');
    this.getMiniatures();
    event.target.complete();
  }
}
