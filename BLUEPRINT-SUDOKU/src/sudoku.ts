/**
 * Sudoku Generation and Validation Utilities
 * Implements a backtracking algorithm to generate puzzles with a unique solution.
 */

const SIZE = 9;
const BOX_SIZE = 3;

// A helper function to shuffle arrays
function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Finds the next empty cell (represented by 0)
function findEmpty(board: number[][]): [number, number] | null {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) {
        return [r, c];
      }
    }
  }
  return null;
}

// Checks if a number can be placed at a given position
function isValid(board: number[][], row: number, col: number, num: number): boolean {
  // Check row and column
  for (let i = 0; i < SIZE; i++) {
    if (board[row][i] === num && i !== col) return false;
    if (board[i][col] === num && i !== row) return false;
  }

  // Check 3x3 box
  const startRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const startCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  for (let r = startRow; r < startRow + BOX_SIZE; r++) {
    for (let c = startCol; c < startCol + BOX_SIZE; c++) {
      if (board[r][c] === num && r !== row && c !== col) {
        return false;
      }
    }
  }

  return true;
}

// --- Core Backtracking Solver ---
function solve(board: number[][]): boolean {
  const emptyPos = findEmpty(board);
  if (!emptyPos) {
    return true; // Board is solved
  }

  const [row, col] = emptyPos;
  const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  for (const num of numbers) {
    if (isValid(board, row, col, num)) {
      board[row][col] = num;
      if (solve(board)) {
        return true;
      }
      board[row][col] = 0; // Backtrack
    }
  }

  return false;
}

// Function to check if a puzzle has a unique solution
function countSolutions(board: number[][]): number {
    const emptyPos = findEmpty(board);
    if (!emptyPos) {
        return 1; // Solution found
    }

    let count = 0;
    const [row, col] = emptyPos;
    
    for (let num = 1; num <= 9; num++) {
        if (isValid(board, row, col, num)) {
            board[row][col] = num;
            count += countSolutions(board);
            board[row][col] = 0; // Backtrack
            if (count > 1) {
                return 2; // Optimization: stop if more than one solution is found
            }
        }
    }
    return count;
}


// --- Main Puzzle Generation Function ---
export function generateSudoku(difficulty: number): { puzzle: number[][]; solution: number[][] } {
  // 1. Create a completely solved board
  const solution: number[][] = Array(SIZE).fill(0).map(() => Array(SIZE).fill(0));
  solve(solution);

  // 2. Create the puzzle by removing cells
  const puzzle = solution.map(r => [...r]);
  const cells = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      cells.push([r, c]);
    }
  }
  shuffle(cells);

  let cellsToRemove = Math.max(20, Math.min(difficulty, 64)); 
  
  for (const [row, col] of cells) {
    if (cellsToRemove === 0) break;
    
    const backup = puzzle[row][col];
    puzzle[row][col] = 0;

    const tempBoard = puzzle.map(r => [...r]);
    const solutionsCount = countSolutions(tempBoard);

    if (solutionsCount !== 1) {
      puzzle[row][col] = backup; // Restore if it affects unique solution
    } else {
      cellsToRemove--;
    }
  }

  return { puzzle, solution };
}

// --- Validation and Conflict Finding ---

export function isSolved(board: number[][]): boolean {
  const rows = Array.from({ length: SIZE }, () => new Set<number>());
  const cols = Array.from({ length: SIZE }, () => new Set<number>());
  const boxes = Array.from({ length: SIZE }, () => new Set<number>());

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const value = board[r][c];
      if (value === 0) {
        return false; // Not solved if any cell is empty
      }

      const boxIndex = Math.floor(r / BOX_SIZE) * BOX_SIZE + Math.floor(c / BOX_SIZE);

      if (rows[r].has(value) || cols[c].has(value) || boxes[boxIndex].has(value)) {
        return false; // Found a duplicate, so not solved
      }
      
      rows[r].add(value);
      cols[c].add(value);
      boxes[boxIndex].add(value);
    }
  }

  return true;
}


export function findConflicts(board: number[][]): { row: number; col: number }[] {
  const conflictCoordinates = new Set<string>();

  // Use maps to track seen numbers and their first occurrence's coordinates
  const rows = Array.from({ length: SIZE }, () => new Map<number, {row: number, col: number}>());
  const cols = Array.from({ length: SIZE }, () => new Map<number, {row: number, col: number}>());
  const boxes = Array.from({ length: SIZE }, () => new Map<number, {row: number, col: number}>());

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const value = board[r][c];
      if (value === 0) continue; // Ignore empty cells

      const boxIndex = Math.floor(r / BOX_SIZE) * BOX_SIZE + Math.floor(c / BOX_SIZE);

      // Check row for conflict
      if (rows[r].has(value)) {
        const first = rows[r].get(value)!;
        conflictCoordinates.add(`${first.row}-${first.col}`);
        conflictCoordinates.add(`${r}-${c}`);
      } else {
        rows[r].set(value, {row: r, col: c});
      }

      // Check column for conflict
      if (cols[c].has(value)) {
        const first = cols[c].get(value)!;
        conflictCoordinates.add(`${first.row}-${first.col}`);
        conflictCoordinates.add(`${r}-${c}`);
      } else {
        cols[c].set(value, {row: r, col: c});
      }

      // Check box for conflict
      if (boxes[boxIndex].has(value)) {
        const first = boxes[boxIndex].get(value)!;
        conflictCoordinates.add(`${first.row}-${first.col}`);
        conflictCoordinates.add(`${r}-${c}`);
      } else {
        boxes[boxIndex].set(value, {row: r, col: c});
      }
    }
  }

  return Array.from(conflictCoordinates).map(s => {
    const [row, col] = s.split('-').map(Number);
    return { row, col };
  });
}
