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

  constructor(private router: Router) {
    this.reset();
  }

  reset() {
    this.board = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
  }

  makeAiMove() {
    // Logique IA à implémenter
    console.log('AI move');
  }

  onCellClick(row: number, col: number) {
    console.log(`Clicked: ${row}, ${col}`);
    // Logique de placement de pierre
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
