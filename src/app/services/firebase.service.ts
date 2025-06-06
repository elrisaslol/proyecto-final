import { Injectable, inject } from '@angular/core';
import {
  Auth, createUserWithEmailAndPassword, sendPasswordResetEmail,
  signInWithEmailAndPassword, updateProfile, UserCredential
} from '@angular/fire/auth';
import {
  doc, Firestore, getDoc, setDoc, addDoc, collection, collectionData,
  query, updateDoc, deleteDoc, QueryConstraint, orderBy, limit
} from '@angular/fire/firestore';
import {
  deleteObject, uploadString
} from '@firebase/storage';
import {
  getDownloadURL, ref, Storage
} from '@angular/fire/storage';
import { QueryOptions } from './query-options.interface';
import { User } from '../models/user.model';
import { Miniature } from '../models/miniature.model';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  auth = inject(Auth);
  firestore = inject(Firestore);
  storage = inject(Storage);

  constructor() {}

  // 🔐 Autenticación
  signIn(user: User): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, user.email, user.password);
  }

  signUp(user: User): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, user.email, user.password);
  }

  async signOut() {
    await this.auth.signOut();
    localStorage.removeItem('user');
  }

  async getUserByUID(uid: string): Promise<User | null> {
    const data = await this.getDocument(`users/${uid}`);
    return data ? (data as User) : null;
  }

  async updateUser(displayName: string) {
    const user = this.auth.currentUser;
    if (user) {
      await updateProfile(user, { displayName });
    }
  }

  // 📚 Obtener miniaturas sin mapear
  getMiniaturesCollection() {
    const refCollection = collection(this.firestore, 'miniatures');
    return collectionData(refCollection, { idField: 'id' });
  }

  // 📚 Obtener miniaturas tipadas y mapeadas a Miniature
  getMiniaturesCollectionTyped(): Observable<Miniature[]> {
    const refCollection = collection(this.firestore, 'miniatures');
    return collectionData(refCollection, { idField: 'id' }).pipe(
      map((data: any[]) => data.map(doc => ({
        id: doc.id,
        image: doc.image || '',
        num_de_regs_inv_o_idnt: doc.num_de_regs_inv_o_idnt || '',
        objeto: doc.objeto || '',
        tipologia: doc.tipologia || '',
        autoria_taller_emisor: doc.autoria_taller_emisor || '',
        titulo: doc.titulo || '',
        materias: doc.materias || '',
        tecnicas: doc.tecnicas || '',
        contextocultural_escuela: doc.contextocultural_escuela || '',
        dimensiones: doc.dimensiones || '',
        peso: doc.peso || '',
        procedencia: doc.procedencia || '',
        localizacion_topografica: doc.localizacion_topografica || '',
        estado_de_conservacion: doc.estado_de_conservacion || '',
        estado_de_restauracion: doc.estado_de_restauracion || '',
        observaciones: doc.observaciones || '',
        titularidad: doc.titularidad || '',
        forma_de_ingreso: doc.forma_de_ingreso || '',
        fuente_de_ingreso: doc.fuente_de_ingreso || '',
        fecha_de_ingreso: doc.fecha_de_ingreso || '',
        createdBy: doc.createdBy || '',
        lastModifiedBy: doc.lastModifiedBy || ''
      })))
    );
  }

  // Método para crear o sobrescribir un documento
  async setDocument(path: string, data: any) {
    const docRef = doc(this.firestore, path);
    return await setDoc(docRef, data);
  }

  // 📄 Crear documento con ID generado automáticamente
  async addDocument(path: string, data: any) {
    const uid = this.auth.currentUser?.uid;
    const docData = {
      ...data,
      createdBy: uid || null,
      lastModifiedBy: uid || null
    };
    return addDoc(collection(this.firestore, path), docData);
  }

  // 📄 Crear documento con ID específico
  async addDocumentWithId(path: string, id: string, data: any) {
    const uid = this.auth.currentUser?.uid;
    const docData = {
      ...data,
      createdBy: uid || null,
      lastModifiedBy: uid || null
    };
    const docRef = doc(this.firestore, `${path}/${id}`);
    return setDoc(docRef, docData);
  }

  // ✏️ Actualizar documento
  async updateDocument(path: string, data: any) {
    const uid = this.auth.currentUser?.uid;
    const updatedData = {
      ...data,
      lastModifiedBy: uid || null
    };
    return updateDoc(doc(this.firestore, path), updatedData);
  }

  // ❌ Borrar documento
  deleteDocument(path: string) {
    return deleteDoc(doc(this.firestore, path));
  }

  // 📄 Obtener un solo documento
  async getDocument(path: string) {
    const docSnap = await getDoc(doc(this.firestore, path));
    return docSnap.exists() ? docSnap.data() : null;
  }

  // 🔍 Construcción de filtros para queries
  buildQueryConstraints(options?: QueryOptions): QueryConstraint[] {
    const constraints: QueryConstraint[] = [];
    if (options?.orderBy) {
      constraints.push(orderBy(options.orderBy.field, options.orderBy.direction));
    }
    if (options?.limit) {
      constraints.push(limit(options.limit));
    }
    return constraints;
  }

  // 📚 Obtener colección con filtros
  async getCollectionData(path: string, collectionQuery?: QueryOptions) {
    const refCollection = collection(this.firestore, path);
    const constraints = this.buildQueryConstraints(collectionQuery);
    return collectionData(query(refCollection, ...constraints), { idField: 'id' });
  }

  // 🔑 Recuperar contraseña
  sendRecoveryEmail(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  // 🔐 Verificar sesión activa
  async isAuthenticated(): Promise<boolean> {
    return new Promise((resolve) => {
      const unsubscribe = this.auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(!!user);
      });
    });
  }

  // 📷 Subida de imagen
  async uploadImage(path: string, imageDataUrl: string): Promise<string> {
    await uploadString(ref(this.storage, path), imageDataUrl, 'data_url');
    return getDownloadURL(ref(this.storage, path));
  }

  // 📂 Obtener ruta de archivo a partir de URL
  async getFilePath(url: string): Promise<string> {
    return ref(this.storage, url).fullPath;
  }

  // 🗑️ Borrar archivo de Supabase
  async deleteFile(path: string) {
    return deleteObject(ref(this.storage, path));
  }
}
