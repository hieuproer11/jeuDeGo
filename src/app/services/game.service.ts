import { Injectable, signal } from '@angular/core';

/**
 * Service de gestion de l'état du jeu de Go
 * Gère le plateau, les joueurs, les scores et les tours
 */
@Injectable({
  providedIn: 'root'
})
export class GameService {
  // Taille du plateau (9x9 par défaut)
  private readonly boardSize = signal(9);
  
  // Plateau de jeu : 0 = vide, 1 = noir, 2 = blanc
  private readonly board = signal<number[][]>([]);
  
  // Joueur actuel : 1 = noir, 2 = blanc
  private readonly currentPlayer = signal(1);
  
  // Scores des joueurs
  private readonly blackScore = signal(0);
  private readonly whiteScore = signal(0);
  
  // État de la partie
  private readonly gameStarted = signal(false);
  
  // Signaux en lecture seule pour les composants
  readonly boardState = this.board.asReadonly();
  readonly currentPlayerState = this.currentPlayer.asReadonly();
  readonly blackScoreState = this.blackScore.asReadonly();
  readonly whiteScoreState = this.whiteScore.asReadonly();
  readonly gameStartedState = this.gameStarted.asReadonly();
  readonly boardSizeState = this.boardSize.asReadonly();

  constructor() {
    this.initializeBoard();
  }

  /**
   * Initialise un nouveau plateau vide
   */
  private initializeBoard(): void {
    const size = this.boardSize();
    const newBoard = Array(size).fill(null).map(() => Array(size).fill(0));
    this.board.set(newBoard);
  }

  /**
   * Démarre une nouvelle partie
   */
  startNewGame(): void {
    this.initializeBoard();
    this.currentPlayer.set(1); // Noir commence
    this.blackScore.set(0);
    this.whiteScore.set(0);
    this.gameStarted.set(true);
  }

  /**
   * Place une pierre sur le plateau
   * @param row Ligne
   * @param col Colonne
   * @returns true si la pierre a été placée, false sinon
   */
  placeStone(row: number, col: number): boolean {
    const currentBoard = this.board();
    
    // Vérifier que la case est vide
    if (currentBoard[row][col] !== 0) {
      return false;
    }

    // Créer une copie du plateau et placer la pierre
    const newBoard = currentBoard.map(r => [...r]);
    newBoard[row][col] = this.currentPlayer();
    this.board.set(newBoard);
    
    return true;
  }

  /**
   * Change le joueur actuel
   */
  switchPlayer(): void {
    this.currentPlayer.set(this.currentPlayer() === 1 ? 2 : 1);
  }

  /**
   * Retire une pierre du plateau et augmente le score
   * @param row Ligne
   * @param col Colonne
   * @returns true si la pierre a été retirée, false sinon
   */
  removeStone(row: number, col: number): boolean {
    const currentBoard = this.board();
    const stone = currentBoard[row][col];
    
    // Vérifier qu'il y a une pierre adverse
    if (stone === 0 || stone === this.currentPlayer()) {
      return false;
    }

    // Créer une copie du plateau et retirer la pierre
    const newBoard = currentBoard.map(r => [...r]);
    newBoard[row][col] = 0;
    this.board.set(newBoard);
    
    // Augmenter le score du joueur actuel
    if (this.currentPlayer() === 1) {
      this.blackScore.update(score => score + 1);
    } else {
      this.whiteScore.update(score => score + 1);
    }
    
    return true;
  }

  /**
   * Réinitialise la partie
   */
  reset(): void {
    this.startNewGame();
  }
}
