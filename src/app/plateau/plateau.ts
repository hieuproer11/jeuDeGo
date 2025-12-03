import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Piece } from '../piece/piece';

@Component({
  selector: 'app-plateau',
  imports: [CommonModule, Piece],
  templateUrl: './plateau.html',
  styleUrl: './plateau.css',
})
export class Plateau {
  size = 9;
  board: number[][] = []; // 0 = vide, 1 = noir, 2 = blanc
  overlayBoard: number[][] = [];
  currentPlayer: 1 | 2 = 1; // 1 = noir, 2 = blanc
  passCount = 0;
  gameOver = false;

  constructor(private router: Router) {
    this.reset();
  }

  reset() {
    this.board = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
    this.overlayBoard = Array(this.size - 1).fill(null).map(() => Array(this.size - 1).fill(0));
    this.currentPlayer = 1;
    this.passCount = 0;
    this.gameOver = false;
  }

  makeAiMove() {
    // Logique IA à implémenter
    console.log('AI move');
  }

  onIntersectionClick(row: number, col: number) {
    if (this.gameOver) return;
    
    // Si la position est vide, placer une pierre
    if (this.board[row][col] === 0) {
      this.board[row][col] = this.currentPlayer;
      this.passCount = 0; // Reset pass count on move
      this.switchPlayer();
    }
  }

  onIntersectionRightClick(event: MouseEvent, row: number, col: number) {
    event.preventDefault();
    if (this.gameOver) return;
    
    // Supprimer la pierre si elle existe
    if (this.board[row][col] !== 0) {
      this.board[row][col] = 0;
    }
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
  }

  pass() {
    if (this.gameOver) return;
    
    this.passCount++;
    
    // Si les deux joueurs passent consécutivement, la partie se termine
    if (this.passCount >= 2) {
      this.gameOver = true;
      alert('Partie terminée ! Les deux joueurs ont passé.');
    } else {
      this.switchPlayer();
    }
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
