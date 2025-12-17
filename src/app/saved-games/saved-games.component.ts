import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-saved-games',
  imports: [CommonModule],
  templateUrl: './saved-games.component.html',
  styleUrl: './saved-games.component.css'
})
export class SavedGames {
  constructor(
    public router: Router,
    public gameService: GameService
  ) {}

  get savedGames() {
    return this.gameService.listSavedGames();
  }

  load(id: string) {
    if (this.gameService.loadSavedGame(id)) {
      this.router.navigate(['/game']);
    } else {
      alert('Impossible de charger la sauvegarde.');
    }
  }

  delete(id: string) {
    if (!confirm('Supprimer cette partie enregistrée ?')) return;
    this.gameService.deleteSavedGame(id);
  }

  saveCurrent() {
    const name = prompt('Nom de la sauvegarde', `Partie ${new Date().toLocaleString()}`) || undefined;
    try {
      this.gameService.saveCurrentGame(name);
      alert('Partie sauvegardée.');
    } catch (e) {
      alert('Erreur lors de la sauvegarde.');
    }
  }
}
