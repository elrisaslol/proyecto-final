import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';

export const noAuthGuard: CanActivateFn = async (route, state) => {
  const firebaseService = inject(FirebaseService);
  const utilsService = inject(UtilsService);

  const isAuthenticated = await firebaseService.isAuthenticated();

  if (!isAuthenticated) {
    return true;
  } else {
    return utilsService.urlTree('/main/home');
  }
};
