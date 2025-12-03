import { Routes } from '@angular/router';
import { Plateau } from './plateau/plateau.component';
import { Home } from './home/home.component';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'game', component: Plateau }
];
