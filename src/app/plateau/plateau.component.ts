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

  constructor(
    private router: Router,
    public gameService: GameService
  ) {
    this.gameService.startNewGame();
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
    const winner = finalScore.black > finalScore.white ? 'Noir' : 'Blanc';
    const margin = Math.abs(finalScore.black - finalScore.white).toFixed(1);
    
    const message = `Partie terminée !\n\n` +
                    `Score final (règles françaises):\n` +
                    `Noir: ${finalScore.black.toFixed(1)} points\n` +
                    `Blanc: ${finalScore.white.toFixed(1)} points (avec komi de 7.5)\n\n` +
                    `${winner} gagne de ${margin} points !`;
    
    alert(message);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
