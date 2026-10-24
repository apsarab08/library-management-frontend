import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards';
export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/login.component').then(m => m.LoginComponent), data: { register: true } },
  { path: '', loadComponent: () => import('./pages/shell.component').then(m => m.ShellComponent), canActivate: [authGuard], children: [
    { path: '', pathMatch: 'full', redirectTo: 'books' },
    { path: 'books', loadComponent: () => import('./pages/catalog.component').then(m => m.CatalogComponent) },
    { path: 'my-borrowings', loadComponent: () => import('./pages/borrowings.component').then(m => m.BorrowingsComponent) },
    { path: 'fine-settings', canActivate: [adminGuard], loadComponent: () => import('./pages/fine-settings.component').then(m => m.FineSettingsComponent) },
  ] },
  { path: '**', redirectTo: '' },
];
