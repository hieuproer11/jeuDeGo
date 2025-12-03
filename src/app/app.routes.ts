import { Routes } from '@angular/router';
import { Plateau } from './plateau/plateau';
import { Home } from './home/home';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'game', component: Plateau }
];
