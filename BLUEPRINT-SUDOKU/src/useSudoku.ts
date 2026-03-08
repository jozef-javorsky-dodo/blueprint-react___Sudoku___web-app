import { useReducer, useCallback, useEffect, useRef } from 'react';
import { isSolved, findConflicts } from './utils/sudoku';

type Notification = {
    id: number;
    type: 'success' | 'error' | 'info';
    message: string;
};

export interface GameState {
    initialBoard: number[][];
    board: number[][];
    solution: number[][];
    selectedCell: { row: number; col: number } | null;
    conflicts: { row: number; col: number }[];
    history: number[][][];
    isSolved: boolean;
    isGenerating: boolean;
    notification: Notification | null;
}

export type GameAction =
    | { type: 'START_GENERATING' }
    | { type: 'NEW_GAME_READY'; payload: { puzzle: number[][], solution: number[][] } }
    | { type: 'SELECT_CELL'; payload: { row: number; col: number } }
    | { type: 'INPUT_NUMBER'; payload: { number: number } }
    | { type: 'ERASE_CELL' }
    | { type: 'UNDO' }
    | { type: 'HINT' }
    | { type: 'SOLVE_PUZZLE' }
    | { type: 'CLEAR_NOTIFICATION' }
    | { type: 'SET_NOTIFICATION'; payload: Notification }
    | { type: 'MOVE_SELECTION'; payload: { direction: 'up' | 'down' | 'left' | 'right' } };

const createNotification = (type: 'success' | 'error' | 'info', message: string): Notification => ({
    id: Date.now(),
    type,
    message,
});

const getEmptyState = (): GameState => ({
    initialBoard: Array(9).fill(Array(9).fill(0)),
    board: Array(9).fill(Array(9).fill(0)),
    solution: Array(9).fill(Array(9).fill(0)),
    selectedCell: null,
    conflicts: [],
    history: [],
    isSolved: false,
    isGenerating: true,
    notification: null,
});

const updateBoardState = (state: GameState, newBoard: number[][]): GameState => {
    const conflicts = findConflicts(newBoard);
    const solved = !conflicts.length && isSolved(newBoard);
    return {
        ...state,
        board: newBoard,
        history: [...state.history, newBoard],
        conflicts,
        isSolved: solved,
        notification: solved ? createNotification('success', 'Puzzle Solved! Great job!') : state.notification,
    };
};

function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
        case 'START_GENERATING':
            return { ...state, isGenerating: true, selectedCell: null };

        case 'NEW_GAME_READY':
            return {
                initialBoard: action.payload.puzzle,
                board: action.payload.puzzle,
                solution: action.payload.solution,
                selectedCell: null,
                conflicts: [],
                history: [action.payload.puzzle],
                isSolved: false,
                isGenerating: false,
                notification: createNotification('info', 'New game started!'),
            };

        case 'SELECT_CELL':
            if (state.isGenerating) return state;
            return { ...state, selectedCell: action.payload };

        case 'INPUT_NUMBER': {
            if (state.isGenerating || state.isSolved) return state;
            const { selectedCell, initialBoard, board } = state;
            if (!selectedCell || initialBoard[selectedCell.row][selectedCell.col] !== 0) {
                return state;
            }
            const newBoard = board.map(r => [...r]);
            newBoard[selectedCell.row][selectedCell.col] = action.payload.number;
            return updateBoardState(state, newBoard);
        }

        case 'ERASE_CELL': {
            if (state.isGenerating || state.isSolved) return state;
            const { selectedCell, initialBoard, board } = state;
            if (!selectedCell || initialBoard[selectedCell.row][selectedCell.col] !== 0) {
                return state;
            }
            const newBoard = board.map(r => [...r]);
            newBoard[selectedCell.row][selectedCell.col] = 0;
            return updateBoardState(state, newBoard);
        }

        case 'UNDO': {
            if (state.isGenerating || state.history.length <= 1) {
                return { ...state, notification: createNotification('error', 'Cannot undo further.') };
            }
            const newHistory = state.history.slice(0, -1);
            const previousBoard = newHistory[newHistory.length - 1];
            const conflicts = findConflicts(previousBoard);
            return { ...state, board: previousBoard, history: newHistory, conflicts, isSolved: false };
        }

        case 'HINT': {
            if (state.isGenerating || state.isSolved) return state;
            const { selectedCell, solution, initialBoard } = state;
            if (!selectedCell) {
                return { ...state, notification: createNotification('info', 'Select an empty cell to get a hint.') };
            }
            if (initialBoard[selectedCell.row][selectedCell.col] !== 0) {
                return { ...state, notification: createNotification('info', 'Cannot hint an initial cell.') };
            }
            const newBoard = state.board.map(r => [...r]);
            newBoard[selectedCell.row][selectedCell.col] = solution[selectedCell.row][selectedCell.col];
            return updateBoardState(state, newBoard);
        }

        case 'SOLVE_PUZZLE':
            if (state.isGenerating) return state;
            return updateBoardState(state, state.solution);

        case 'CLEAR_NOTIFICATION':
            return { ...state, notification: null };

        case 'MOVE_SELECTION': {
            if (state.isGenerating || !state.selectedCell) return state;
            const { row, col } = state.selectedCell;
            let newRow = row;
            let newCol = col;
            switch (action.payload.direction) {
                case 'up': newRow = (row - 1 + 9) % 9; break;
                case 'down': newRow = (row + 1) % 9; break;
                case 'left': newCol = (col - 1 + 9) % 9; break;
                case 'right': newCol = (col + 1) % 9; break;
            }
            return { ...state, selectedCell: { row: newRow, col: newCol } };
        }

        default:
            return state;
    }
}

export const useSudoku = (difficulty: number) => {
    const [state, dispatch] = useReducer(gameReducer, getEmptyState());
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        // Create the worker
        workerRef.current = new Worker(new URL('./sudoku-worker.ts', import.meta.url), { type: 'module' });

        // Listen for messages from the worker
        workerRef.current.onmessage = (e: MessageEvent) => {
            const { puzzle, solution } = e.data;
            dispatch({ type: 'NEW_GAME_READY', payload: { puzzle, solution } });
        };

        // Initial game generation
        handleNewGame(difficulty);

        // Cleanup worker on unmount
        return () => {
            workerRef.current?.terminate();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleNewGame = useCallback((newDifficulty: number) => {
        dispatch({ type: 'START_GENERATING' });
        workerRef.current?.postMessage({ difficulty: newDifficulty });
    }, []);

    const handleCellSelect = useCallback((row: number, col: number) => {
        dispatch({ type: 'SELECT_CELL', payload: { row, col } });
    }, []);

    const handleInputNumber = useCallback((number: number) => {
        dispatch({ type: 'INPUT_NUMBER', payload: { number } });
    }, []);

    const handleErase = useCallback(() => dispatch({ type: 'ERASE_CELL' }), []);
    const handleUndo = useCallback(() => dispatch({ type: 'UNDO' }), []);
    const handleHint = useCallback(() => dispatch({ type: 'HINT' }), []);
    const handleSolve = useCallback(() => dispatch({ type: 'SOLVE_PUZZLE' }), []);
    const clearNotification = useCallback(() => dispatch({ type: 'CLEAR_NOTIFICATION' }), []);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (state.isSolved || state.isGenerating) return;

        const key = event.key;
        if (key >= '1' && key <= '9') {
            dispatch({ type: 'INPUT_NUMBER', payload: { number: parseInt(key, 10) } });
        } else if (key === 'Backspace' || key === 'Delete') {
            dispatch({ type: 'ERASE_CELL' });
        } else if (key.startsWith('Arrow')) {
            event.preventDefault(); // Prevent page scroll
            const direction = key.substring(5).toLowerCase() as 'up' | 'down' | 'left' | 'right';
            dispatch({ type: 'MOVE_SELECTION', payload: { direction } });
        }
    }, [state.isSolved, state.isGenerating, dispatch]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return {
        state,
        handleNewGame,
        handleCellSelect,
        handleInputNumber,
        handleErase,
        handleUndo,
        handleHint,
        handleSolve,
        clearNotification,
    };
};