import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { VisitForm } from './features/agent/visit-form/visit-form';
import { VisitGrid } from './features/admin/visit-grid/visit-grid';
import { VisitDetail } from './features/admin/visit-detail/visit-detail';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'agente', component: VisitForm },
  { path: 'admin', component: VisitGrid},
  { path: 'admin/visita/:id', component: VisitDetail},
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
