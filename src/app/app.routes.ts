import { Routes } from '@angular/router';
import { Plateau } from './plateau/plateau.component';
import { Home } from './home/home.component';
import { SavedGames } from './saved-games/saved-games.component';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'game', component: Plateau },
  { path: 'saved', component: SavedGames }
];
