import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './api';
export const authGuard: CanActivateFn = () => { const a = inject(AuthService); return a.token ? true : inject(Router).createUrlTree(['/login']); };
export const adminGuard: CanActivateFn = () => { const a = inject(AuthService); return a.isAdmin() ? true : inject(Router).createUrlTree(['/dashboard']); };
