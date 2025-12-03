import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-piece',
  imports: [],
  templateUrl: './piece.component.html',
  styleUrl: './piece.component.css',
})
export class Piece {
  @Input() color: 'black' | 'white' = 'black';
}
