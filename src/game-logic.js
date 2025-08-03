export class GameLogic {
  constructor() {
    this.reset();
  }

  reset() {
    this.board = [
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ];
    this.currentPlayer = 'X';
    this.winner = null;
    this.gameOver = false;
  }

  getBoard() {
    return this.board;
  }

  getCurrentPlayer() {
    return this.currentPlayer;
  }

  getWinner() {
    return this.winner;
  }

  isDraw() {
    return this.gameOver && !this.winner;
  }

  isGameOver() {
    return this.gameOver;
  }

  makeMove(row, col) {
    // Validate input
    if (row < 0 || row > 2 || col < 0 || col > 2) {
      return { success: false, message: 'Invalid position' };
    }

    // Check if game is over
    if (this.gameOver) {
      return { success: false, message: 'Game is already over' };
    }

    // Check if cell is already occupied
    if (this.board[row][col] !== '') {
      return { success: false, message: 'Cell is already occupied' };
    }

    // Make the move
    this.board[row][col] = this.currentPlayer;

    // Check for winner
    this.checkWinner();

    // Check for draw
    if (!this.winner && this.isBoardFull()) {
      this.gameOver = true;
    }

    // Switch player if game is not over
    if (!this.gameOver) {
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }

    return { success: true };
  }

  checkWinner() {
    // Check rows
    for (let row = 0; row < 3; row++) {
      if (this.board[row][0] !== '' && 
          this.board[row][0] === this.board[row][1] && 
          this.board[row][1] === this.board[row][2]) {
        this.winner = this.board[row][0];
        this.gameOver = true;
        return;
      }
    }

    // Check columns
    for (let col = 0; col < 3; col++) {
      if (this.board[0][col] !== '' && 
          this.board[0][col] === this.board[1][col] && 
          this.board[1][col] === this.board[2][col]) {
        this.winner = this.board[0][col];
        this.gameOver = true;
        return;
      }
    }

    // Check diagonals
    if (this.board[0][0] !== '' && 
        this.board[0][0] === this.board[1][1] && 
        this.board[1][1] === this.board[2][2]) {
      this.winner = this.board[0][0];
      this.gameOver = true;
      return;
    }

    if (this.board[0][2] !== '' && 
        this.board[0][2] === this.board[1][1] && 
        this.board[1][1] === this.board[2][0]) {
      this.winner = this.board[0][2];
      this.gameOver = true;
      return;
    }
  }

  isBoardFull() {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (this.board[row][col] === '') {
          return false;
        }
      }
    }
    return true;
  }
}
