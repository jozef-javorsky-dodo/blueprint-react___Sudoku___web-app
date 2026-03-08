import { generateSudoku } from './utils/sudoku';

self.onmessage = (e: MessageEvent) => {
    const { difficulty } = e.data;
    const { puzzle, solution } = generateSudoku(difficulty);
    self.postMessage({ puzzle, solution });
};
