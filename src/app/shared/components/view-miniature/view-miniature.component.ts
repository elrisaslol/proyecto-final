import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonButton,
  IonIcon,
  IonAvatar,
  IonItem,
  IonLabel,
  IonList
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { Miniature } from 'src/app/models/miniature.model';
import { FirebaseService } from 'src/app/services/firebase.service'; // Importar servicio
import jsPDF from 'jspdf';

@Component({
  selector: 'app-view-miniature',
  templateUrl: './view-miniature.component.html',
  styleUrls: ['./view-miniature.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    IonContent,
    IonButton,
    IonIcon,
    IonAvatar,
    IonItem,
    IonLabel,
    IonList,
  ]
})
export class ViewMiniatureComponent implements OnInit {
  @Input() miniature!: Miniature;

  // Inyectar FirebaseService usando inject()
  private firebaseService = inject(FirebaseService);

  // Variables para mostrar nombres en la vista
  createdByName: string = 'Cargando...';
  lastModifiedByName: string = 'Cargando...';

  constructor() {}

  // Cargar nombres al iniciar componente
  async ngOnInit() {
    await this.loadUserNames();
  }

  // Método para cargar los nombres a partir de los UIDs
  private async loadUserNames() {
    // Si existe UID de creador, buscar nombre
    if (this.miniature.createdBy) {
      const userCreated = await this.firebaseService.getDocument(`users/${this.miniature.createdBy}`);
      this.createdByName = userCreated?.['displayName'] || userCreated?.['email'] || this.miniature.createdBy;
    } else {
      this.createdByName = 'Desconocido';
    }

    // Si existe UID de último modificador, buscar nombre
    if (this.miniature.lastModifiedBy) {
      const userModified = await this.firebaseService.getDocument(`users/${this.miniature.lastModifiedBy}`);
      this.lastModifiedByName = userModified?.['displayName'] || userModified?.['email'] || this.miniature.lastModifiedBy;
    } else {
      this.lastModifiedByName = 'Desconocido';
    }
  }

  printPDF() {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Detalle de Miniatura', 10, 10);

    if (this.miniature.image) {
      doc.addImage(this.miniature.image, 'JPEG', 10, 15, 60, 60);
    }

    let y = 80;
    const lineHeight = 10;

    const addText = (label: string, value: any) => {
      doc.setFontSize(12);
      doc.text(`${label}: ${value || '-'}`, 10, y);
      y += lineHeight;
    };

    addText('Número de Registro/Inventario', this.miniature.num_de_regs_inv_o_idnt);
    addText('Objeto', this.miniature.objeto);
    addText('Tipología', this.miniature.tipologia);
    addText('Autoría/Taller/Emisor', this.miniature.autoria_taller_emisor);
    addText('Título', this.miniature.titulo);
    addText('Materias', this.miniature.materias);
    addText('Técnicas', this.miniature.tecnicas);
    addText('Contexto Cultural/Escuela', this.miniature.contextocultural_escuela);
    addText('Dimensiones', this.miniature.dimensiones);
    addText('Peso', this.miniature.peso);
    addText('Procedencia', this.miniature.procedencia);
    addText('Localización Topográfica', this.miniature.localizacion_topografica);
    addText('Estado de Conservación', this.miniature.estado_de_conservacion);
    addText('Estado de Restauración', this.miniature.estado_de_restauracion);
    addText('Observaciones', this.miniature.observaciones);
    addText('Titularidad', this.miniature.titularidad);
    addText('Forma de Ingreso', this.miniature.forma_de_ingreso);
    addText('Fuente de Ingreso', this.miniature.fuente_de_ingreso);
    addText('Fecha de Ingreso', this.miniature.fecha_de_ingreso);

    // Añadimos creador y modificador al PDF también
    addText('Creado por', this.createdByName);
    addText('Última modificación por', this.lastModifiedByName);

    doc.save(`Miniatura_${this.miniature.num_de_regs_inv_o_idnt || 'detalle'}.pdf`);
  }
}
