// Modelo que define la estructura de una miniatura

export interface Miniature {
  id: string;                                   // ID único del documento
  image: string;                                // URL de la imagen
  num_de_regs_inv_o_idnt: string;               // Número de registro o inventario
  objeto: string;                               // Objeto representado
  tipologia: string;                            // Tipología del objeto
  autoria_taller_emisor: string;                // Autoría, taller o emisor
  titulo: string;                               // Título de la obra
  materias: string;                             // Materias utilizadas
  tecnicas: string;                             // Técnicas aplicadas
  contextocultural_escuela: string;             // Contexto cultural o escuela
  dimensiones: string;                          // Dimensiones físicas
  peso: string;                                 // Peso en gramos u otra unidad
  procedencia: string;                          // Procedencia del objeto
  localizacion_topografica: string;             // Ubicación topográfica
  estado_de_conservacion: 'bueno' | 'deficiente' | 'pesimo';           // Estado físico actual
  estado_de_restauracion: 'urgente' | 'conveniente' | 'no conveniente'; // Necesidad de restauración
  observaciones: string;                        // Comentarios adicionales
  titularidad: string;                          // Propietario o institución
  forma_de_ingreso: string;                     // Forma en que ingresó a la colección
  fuente_de_ingreso: string;                    // Origen o fuente del ingreso
  fecha_de_ingreso: string;                     // Fecha en formato local

  createdBy?: string;          // UID del usuario que creó el documento
  lastModifiedBy?: string;     // UID del usuario que lo modificó por última vez
}
