import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { VisitForm } from './features/agent/visit-form/visit-form';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'agente', component: VisitForm },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
