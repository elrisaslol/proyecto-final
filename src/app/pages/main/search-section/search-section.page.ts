import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Miniature } from 'src/app/models/miniature.model';
import { HeaderComponent } from "../../../shared/components/header/header.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonFab, IonFabButton, IonIcon, IonLabel, IonItem, IonItemSliding, IonList,
  IonItemOptions, IonItemOption, IonAvatar, IonChip, IonSkeletonText,
  IonSelectOption, IonSelect, IonInput, IonCard, IonButton
} from '@ionic/angular/standalone';
import { ViewMiniatureComponent } from 'src/app/shared/components/view-miniature/view-miniature.component';
import { addIcons } from 'ionicons';
import { add, createOutline, trashOutline, bodyOutline, chevronForwardOutline, searchOutline } from 'ionicons/icons';
import { AddUpdateMiniatureComponent } from 'src/app/shared/components/add-update-miniature/add-update-miniature.component';
import { UtilsService } from 'src/app/services/utils.service';      // <-- Ajustar según ruta real
import { SupabaseService } from 'src/app/services/supabase.service'; // <-- Ajustar según ruta real
import { User } from 'src/app/models/user.model';


@Component({
  selector: 'app-search-section',
  templateUrl: './search-section.page.html',
  styleUrls: ['./search-section.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent, IonCard, IonSkeletonText, IonChip,
    IonAvatar, IonItem, IonItemSliding, IonItemOptions, IonItemOption, IonLabel,
    IonIcon, IonFab, IonFabButton, IonSelect, IonSelectOption, IonInput, IonButton,
    HeaderComponent, ViewMiniatureComponent, IonList
  ]
})
export class SearchSectionPage implements OnInit {
  searchTerm: string = '';
  searchField: string = 'all';

  miniatures: Miniature[] = [];          // Todos los registros cargados
  filteredMiniatures: Miniature[] = [];  // Resultados filtrados según búsqueda

  loading: boolean = false;               // Control para mostrar skeleton durante carga

  // Opciones para el filtro de búsqueda
  searchFieldsOptions = [
    { value: 'all', label: 'Todos los campos' },
    { value: 'num_de_regs_inv_o_idnt', label: 'Número de Registro' },
    { value: 'objeto', label: 'Objeto' },
    { value: 'tipologia', label: 'Tipología' },
    { value: 'autoria_taller_emisor', label: 'Autoría/Taller/Emisor' },
    { value: 'titulo', label: 'Título' },
    { value: 'materias', label: 'Materias' },
    { value: 'tecnicas', label: 'Técnicas' },
    { value: 'contextocultural_escuela', label: 'Contexto Cultural/Escuela' },
    { value: 'dimensiones', label: 'Dimensiones' },
    { value: 'peso', label: 'Peso' },
    { value: 'procedencia', label: 'Procedencia' },
    { value: 'localizacion_topografica', label: 'Localización Topográfica' },
    { value: 'estado_de_conservacion', label: 'Estado de Conservación' },
    { value: 'estado_de_restauracion', label: 'Estado de Restauración' },
    { value: 'observaciones', label: 'Observaciones' },
    { value: 'titularidad', label: 'Titularidad' },
    { value: 'forma_de_ingreso', label: 'Forma de Ingreso' },
    { value: 'fuente_de_ingreso', label: 'Fuente de Ingreso' },
    { value: 'fecha_de_ingreso', label: 'Fecha de Ingreso' }
  ];

  user: User;

  // Inyectamos servicios de utils y supabase para manejo de modales, toasts y almacenamiento
  constructor(
    private firebaseService: FirebaseService,
    private utilsService: UtilsService,
    private supabaseService: SupabaseService
  ) {
    addIcons({ chevronForwardOutline, searchOutline, createOutline, trashOutline, add, bodyOutline });
    this.user = this.utilsService.getLocalStorageUser()!
  }

  ngOnInit() {
    // No se cargan miniaturas al inicio para evitar consumo innecesario
  }

  // Método que se ejecuta al presionar el botón Buscar
  onSearch() {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      // Si no hay término de búsqueda, limpiar resultados y miniaturas cargadas
      this.filteredMiniatures = [];
      this.miniatures = [];
      return;
    }

    this.loading = true;

    // Suscribimos a la colección completa de miniaturas para filtrar localmente
    this.firebaseService.getMiniaturesCollectionTyped().subscribe({
      next: (miniatures) => {
        this.miniatures = miniatures;

        // Filtramos miniaturas según campo y término
        if (this.searchField === 'all') {
          this.filteredMiniatures = this.miniatures.filter(mini =>
            this.searchFieldsOptions
              .filter(opt => opt.value !== 'all')
              .some(opt => {
                const fieldValue = (mini as any)[opt.value];
                return fieldValue && fieldValue.toString().toLowerCase().includes(term);
              })
          );
        } else {
          this.filteredMiniatures = this.miniatures.filter(mini => {
            const fieldValue = (mini as any)[this.searchField];
            return fieldValue && fieldValue.toString().toLowerCase().includes(term);
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando miniaturas:', error);
        this.loading = false;
        this.utilsService.presentToast({
          color: 'danger',
          message: 'Error al cargar registros',
          duration: 2500,
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      }
    });
  }

  // Método para abrir modal de agregar o actualizar miniatura
  async addUpdateMiniature(miniature?: Miniature) {
    console.log('[SearchSectionPage] addUpdateMiniature - abriendo modal', miniature);
    const success = await this.utilsService.presentModal({
      component: AddUpdateMiniatureComponent,
      cssClass: "add-update-modal",
      componentProps: { miniature }
    });
    if (success) {
      console.log('[SearchSectionPage] addUpdateMiniature - modal cerrado con éxito, refrescando lista');
      this.onSearch();  // Volver a buscar para refrescar resultados
    }
  }

  // Método que confirma eliminación con alert
  confirmDeleteMiniature(miniature: Miniature) {
    console.log('[SearchSectionPage] confirmDeleteMiniature - confirmando eliminación', miniature);
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

  // Método para eliminar miniatura, borrando imagen y documento
  async deleteMiniature(miniature: Miniature) {
    console.log('[SearchSectionPage] deleteMiniature - iniciando eliminación', miniature);
    const loading = await this.utilsService.loading();
    await loading.present();

    const path: string = `miniatures/${miniature.id}`;

    try {
      // Obtener ruta imagen en Supabase para eliminar
      const imagePath = await this.supabaseService.getFilePath(miniature.image);

      if (imagePath) {
        console.log('[SearchSectionPage] deleteMiniature - borrando imagen en supabase', imagePath);
        await this.supabaseService.deleteFile(imagePath);
      } else {
        console.warn('[SearchSectionPage] deleteMiniature - no se encontró ruta de imagen para borrar');
      }

      console.log('[SearchSectionPage] deleteMiniature - borrando documento en firestore', path);
      await this.firebaseService.deleteDocument(path);

      // Actualizar lista local
      this.miniatures = this.miniatures.filter(m => m.id !== miniature.id);
      this.filteredMiniatures = this.filteredMiniatures.filter(m => m.id !== miniature.id);

      this.utilsService.presentToast({
        color: "success",
        duration: 1500,
        message: "Registro borrado exitosamente",
        position: "middle",
        icon: 'checkmark-circle-outline'
      });

    } catch (error: unknown) {
      console.error("[SearchSectionPage] deleteMiniature - error al borrar registro o imagen:", error);
      const message = error && typeof error === 'object' && 'message' in error
        ? (error as { message: string }).message
        : 'Error desconocido';
      this.utilsService.presentToast({
        color: "danger",
        duration: 2500,
        message,
        position: "middle",
        icon: 'alert-circle-outline'
      });
    } finally {
      loading.dismiss();
    }
  }

  // Método para abrir modal que muestra detalle de la miniatura
  async viewMiniature(miniature: Miniature) {
    console.log('[SearchSectionPage] viewMiniature - abriendo modal', miniature);
    await this.utilsService.presentModal({
      component: ViewMiniatureComponent,
      cssClass: "view-miniature-modal",
      componentProps: { miniature }
    });
  }

}
