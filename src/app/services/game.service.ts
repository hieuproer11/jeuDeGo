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
  
  // Historique des plateaux pour la règle du ko
  private boardHistory: string[] = [];
  
  // Komi (règle française: 7.5 points pour Blanc)
  private readonly komi = 7.5;
  
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
    this.boardHistory = [];
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
    
    // Vérifier et capturer les groupes adverses sans libertés
    const capturedCount = this.captureDeadGroupsOnBoard(newBoard, row, col);
    
    // Règle du suicide: interdire si la chaîne n'a pas de libertés (sauf si capture)
    if (capturedCount === 0) {
      const myGroup = this.getGroup(newBoard, row, col);
      if (this.countLiberties(newBoard, myGroup) === 0) {
        return false; // Suicide interdit
      }
    }
    
    // Règle du ko: vérifier qu'on ne reproduit pas un état antérieur
    const boardString = this.boardToString(newBoard);
    if (this.boardHistory.includes(boardString)) {
      return false; // Ko: répétition interdite
    }
    
    // Tout est ok, on applique le coup
    this.board.set(newBoard);
    this.boardHistory.push(boardString);
    
    // Mettre à jour le score si des pierres ont été capturées
    if (capturedCount > 0) {
      if (this.currentPlayer() === 1) {
        this.blackScore.update(score => score + capturedCount);
      } else {
        this.whiteScore.update(score => score + capturedCount);
      }
    }
    
    return true;
  }

  /**
   * Capture les groupes adverses qui n'ont plus de libertés
   * @param board Plateau sur lequel effectuer les captures
   * @param lastRow Ligne de la dernière pierre placée
   * @param lastCol Colonne de la dernière pierre placée
   * @returns Nombre de pierres capturées
   */
  private captureDeadGroupsOnBoard(board: number[][], lastRow: number, lastCol: number): number {
    const opponent = this.currentPlayer() === 1 ? 2 : 1;
    let capturedCount = 0;

    // Vérifier les 4 directions adjacentes
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    for (const [dr, dc] of directions) {
      const adjRow = lastRow + dr;
      const adjCol = lastCol + dc;
      
      // Si c'est une pierre adverse
      if (this.isValidPosition(adjRow, adjCol) && board[adjRow][adjCol] === opponent) {
        const group = this.getGroup(board, adjRow, adjCol);
        
        // Si le groupe n'a pas de libertés, le capturer
        if (this.countLiberties(board, group) === 0) {
          for (const [r, c] of group) {
            board[r][c] = 0;
            capturedCount++;
          }
        }
      }
    }

    return capturedCount;
  }

  /**
   * Récupère toutes les pierres d'un groupe connecté
   * @param board Plateau
   * @param row Ligne de départ
   * @param col Colonne de départ
   * @returns Liste des positions du groupe
   */
  private getGroup(board: number[][], row: number, col: number): [number, number][] {
    const color = board[row][col];
    const group: [number, number][] = [];
    const visited = new Set<string>();
    
    const explore = (r: number, c: number) => {
      const key = `${r},${c}`;
      if (visited.has(key)) return;
      if (!this.isValidPosition(r, c)) return;
      if (board[r][c] !== color) return;
      
      visited.add(key);
      group.push([r, c]);
      
      // Explorer les 4 directions
      explore(r - 1, c);
      explore(r + 1, c);
      explore(r, c - 1);
      explore(r, c + 1);
    };
    
    explore(row, col);
    return group;
  }

  /**
   * Compte les libertés d'un groupe
   * @param board Plateau
   * @param group Liste des positions du groupe
   * @returns Nombre de libertés
   */
  private countLiberties(board: number[][], group: [number, number][]): number {
    const liberties = new Set<string>();
    
    for (const [r, c] of group) {
      // Vérifier les 4 directions adjacentes
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      
      for (const [dr, dc] of directions) {
        const adjRow = r + dr;
        const adjCol = c + dc;
        
        if (this.isValidPosition(adjRow, adjCol) && board[adjRow][adjCol] === 0) {
          liberties.add(`${adjRow},${adjCol}`);
        }
      }
    }
    
    return liberties.size;
  }

  /**
   * Vérifie si une position est valide sur le plateau
   */
  private isValidPosition(row: number, col: number): boolean {
    const size = this.boardSize();
    return row >= 0 && row < size && col >= 0 && col < size;
  }

  /**
   * Convertit le plateau en string pour détecter les répétitions
   */
  private boardToString(board: number[][]): string {
    return board.map(row => row.join(',')).join(';');
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

  /**
   * Calcule le score final selon les règles françaises
   * Score = territoire + pierres sur le goban + pierres capturées + komi (pour Blanc)
   * @returns {black: number, white: number}
   */
  calculateFinalScore(): { black: number; white: number } {
    const currentBoard = this.board();
    
    // Compter les pierres sur le goban
    let blackStones = 0;
    let whiteStones = 0;
    
    for (let i = 0; i < currentBoard.length; i++) {
      for (let j = 0; j < currentBoard[i].length; j++) {
        if (currentBoard[i][j] === 1) blackStones++;
        if (currentBoard[i][j] === 2) whiteStones++;
      }
    }
    
    // Compter les territoires
    const territories = this.countTerritories();
    
    // Score final = pierres capturées (déjà dans le score) + pierres sur goban + territoires
    const blackTotal = this.blackScore() + blackStones + territories.black;
    const whiteTotal = this.whiteScore() + whiteStones + territories.white + this.komi;
    
    return {
      black: blackTotal,
      white: whiteTotal
    };
  }

  /**
   * Compte les territoires de chaque joueur
   * Un territoire est un ensemble d'intersections vides entourées par une seule couleur
   */
  private countTerritories(): { black: number; white: number } {
    const currentBoard = this.board();
    const visited = new Set<string>();
    let blackTerritory = 0;
    let whiteTerritory = 0;
    
    for (let i = 0; i < currentBoard.length; i++) {
      for (let j = 0; j < currentBoard[i].length; j++) {
        const key = `${i},${j}`;
        
        if (currentBoard[i][j] === 0 && !visited.has(key)) {
          // Trouver toutes les intersections vides connectées
          const emptyGroup = this.getEmptyGroup(currentBoard, i, j, visited);
          
          // Déterminer à qui appartient ce territoire
          const owner = this.getTerritoryOwner(currentBoard, emptyGroup);
          
          if (owner === 1) {
            blackTerritory += emptyGroup.length;
          } else if (owner === 2) {
            whiteTerritory += emptyGroup.length;
          }
          // Si owner === 0, c'est un territoire neutre (ne compte pour personne)
        }
      }
    }
    
    return { black: blackTerritory, white: whiteTerritory };
  }

  /**
   * Récupère un groupe d'intersections vides connectées
   */
  private getEmptyGroup(board: number[][], row: number, col: number, visited: Set<string>): [number, number][] {
    const group: [number, number][] = [];
    
    const explore = (r: number, c: number) => {
      const key = `${r},${c}`;
      if (visited.has(key)) return;
      if (!this.isValidPosition(r, c)) return;
      if (board[r][c] !== 0) return;
      
      visited.add(key);
      group.push([r, c]);
      
      explore(r - 1, c);
      explore(r + 1, c);
      explore(r, c - 1);
      explore(r, c + 1);
    };
    
    explore(row, col);
    return group;
  }

  /**
   * Détermine le propriétaire d'un territoire
   * @returns 1 (noir), 2 (blanc), ou 0 (neutre/contesté)
   */
  private getTerritoryOwner(board: number[][], emptyGroup: [number, number][]): number {
    const adjacentColors = new Set<number>();
    
    for (const [r, c] of emptyGroup) {
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      
      for (const [dr, dc] of directions) {
        const adjRow = r + dr;
        const adjCol = c + dc;
        
        if (this.isValidPosition(adjRow, adjCol)) {
          const color = board[adjRow][adjCol];
          if (color !== 0) {
            adjacentColors.add(color);
          }
        }
      }
    }
    
    // Si le territoire touche les deux couleurs, il est neutre
    if (adjacentColors.size !== 1) {
      return 0;
    }
    
    // Sinon, il appartient à la seule couleur adjacente
    return Array.from(adjacentColors)[0];
  }
}
