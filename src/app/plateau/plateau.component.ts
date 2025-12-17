import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Piece } from '../piece/piece.component';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-plateau',
  imports: [CommonModule, Piece],
  templateUrl: './plateau.component.html',
  styleUrl: './plateau.component.css',
})
export class Plateau {
  passCount = 0;
  gameOver = false;
  finalScores: { black: number; white: number; winner: string; margin: number } | null = null;

  constructor(
    private router: Router,
    public gameService: GameService
  ) {
    // Ne démarrer une nouvelle partie que si aucune partie n'est en cours
    if (!this.gameService.gameStartedState()) {
      this.gameService.startNewGame();
    }
  }

  openSavedList() {
    this.router.navigate(['/saved']);
  }

  saveCurrent(name?: string) {
    try {
      this.gameService.saveCurrentGame(name);
      alert('Partie sauvegardée.');
    } catch (e) {
      alert('Erreur lors de la sauvegarde.');
    }
  }

  get board() {
    return this.gameService.boardState();
  }

  get currentPlayer() {
    return this.gameService.currentPlayerState();
  }

  get blackScore() {
    return this.gameService.blackScoreState();
  }

  get whiteScore() {
    return this.gameService.whiteScoreState();
  }

  reset() {
    this.gameService.reset();
    this.passCount = 0;
    this.gameOver = false;
    this.finalScores = null;
  }

  onIntersectionClick(row: number, col: number) {
    if (this.gameOver) return;
    
    // Si la position est vide, placer une pierre
    if (this.gameService.placeStone(row, col)) {
      this.passCount = 0; // Reset pass count on move
      this.gameService.switchPlayer();
    }
  }

  onIntersectionRightClick(event: MouseEvent, row: number, col: number) {
    event.preventDefault();
    if (this.gameOver) return;
    
    // Supprimer la pierre adverse et augmenter le score
    if (this.gameService.removeStone(row, col)) {
      // Pierre retirée avec succès, on ne change pas de joueur
    }
  }

  pass() {
    if (this.gameOver) return;
    
    this.passCount++;
    
    // Si les deux joueurs passent consécutivement, la partie se termine
    if (this.passCount >= 2) {
      this.gameOver = true;
      this.showFinalScore();
    } else {
      this.gameService.switchPlayer();
    }
  }

  showFinalScore() {
    const finalScore = this.gameService.calculateFinalScore();
    const winner = finalScore.black > finalScore.white ? 'Noir' : (finalScore.white > finalScore.black ? 'Blanc' : 'Égalité');
    const margin = Math.abs(finalScore.black - finalScore.white);
    
    this.finalScores = {
      black: finalScore.black,
      white: finalScore.white,
      winner,
      margin
    };
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
