export const BLANK_CHAR = 0;
export const GRID_SIZE = 9;

const generatePuzzle = (difficulty: number): number[][] => {
    const base = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(BLANK_CHAR));
    const solution = fillGrid(base);
    if (typeof solution === 'boolean') {
        // This should not happen in a well-formed puzzle generator,
        // but we handle it gracefully.
        return base;
    }
    return removeNumbers(solution, difficulty);
};

const solvePuzzle = (board: number[][]): number[][] | null => {
    const solution = fillGrid(board.map(row => [...row]));
    return typeof solution !== 'boolean' ? solution : null;
};

export const generateSudoku = (difficulty: number) => {
    const puzzle = generatePuzzle(difficulty);
    const solution = solvePuzzle(puzzle);
    return { puzzle, solution: solution || puzzle };
};

export const isSolved = (board: number[][]): boolean => {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (board[i][j] === BLANK_CHAR || !isValid(board, i, j, board[i][j])) {
                return false;
            }
        }
    }
    return true;
};

export const findConflicts = (board: number[][]): { row: number, col: number }[] => {
    const conflicts: { row: number, col: number }[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const val = board[r][c];
            if (val !== BLANK_CHAR && !isValid(board, r, c, val)) {
                conflicts.push({ row: r, col: c });
            }
        }
    }
    return conflicts;
};

function fillGrid(grid: number[][]): number[][] | boolean {
    let row = -1;
    let col = -1;
    let isEmpty = true;
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j] === BLANK_CHAR) {
                row = i;
                col = j;
                isEmpty = false;
                break;
            }
        }
        if (!isEmpty) break;
    }

    if (isEmpty) return grid;

    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    for (const num of nums) {
        if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (fillGrid(grid)) {
                return grid;
            }
            grid[row][col] = BLANK_CHAR;
        }
    }

    return false;
}

function removeNumbers(board: number[][], count: number): number[][] {
    const newBoard = board.map(row => [...row]);
    let removed = 0;
    while (removed < count) {
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);
        if (newBoard[row][col] !== BLANK_CHAR) {
            newBoard[row][col] = BLANK_CHAR;
            removed++;
        }
    }
    return newBoard;
}

function isValid(board: number[][], row: number, col: number, num: number): boolean {
    for (let i = 0; i < GRID_SIZE; i++) {
        if ((board[row][i] === num && i !== col) || (board[i][col] === num && i !== row)) {
            return false;
        }
    }

    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[startRow + i][startCol + j] === num && (startRow + i !== row || startCol + j !== col)) {
                return false;
            }
        }
    }

    return true;
}

function shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}