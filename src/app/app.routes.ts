import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { VisitForm } from './features/agent/visit-form/visit-form';
import { VisitGrid } from './features/admin/visit-grid/visit-grid';
import { VisitDetail } from './features/admin/visit-detail/visit-detail';
import { AgentAssignment } from './features/admin/agent-assignment/agent-assignment';
import { authGuard } from './core/guards/auth/auth-guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { 
    path: 'agente', 
    component: VisitForm, 
    canActivate: [authGuard], 
    data: { role: 'USER' } 
  },
  { 
    path: 'admin', 
    component: VisitGrid, 
    canActivate: [authGuard], 
    data: { role: 'ADMIN' } 
  },
  { 
    path: 'admin/visita/:id', 
    component: VisitDetail, 
    canActivate: [authGuard], 
    data: { role: 'ADMIN' } 
  },
  { 
    path: 'admin/asignacion', 
    component: AgentAssignment, 
    canActivate: [authGuard], 
    data: { role: 'ADMIN' } 
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];