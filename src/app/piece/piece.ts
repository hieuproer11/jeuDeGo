import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-piece',
  imports: [],
  templateUrl: './piece.html',
  styleUrl: './piece.css',
})
export class Piece {
  @Input() color: 'black' | 'white' = 'black';
}
