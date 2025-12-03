import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-plateau',
  imports: [CommonModule],
  templateUrl: './plateau.html',
  styleUrl: './plateau.css',
})
export class Plateau {
  size = 9;
  board: number[][] = [];
  overlayBoard: number[][] = [];

  constructor(private router: Router) {
    this.reset();
  }

  reset() {
    this.board = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
    this.overlayBoard = Array(this.size - 1).fill(null).map(() => Array(this.size - 1).fill(0));
  }

  makeAiMove() {
    // Logique IA à implémenter
    console.log('AI move');
  }

  onIntersectionClick(row: number, col: number) {
    console.log(`Intersection clicked: ${row}, ${col}`);
    // Logique de placement de pierre aux intersections
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
