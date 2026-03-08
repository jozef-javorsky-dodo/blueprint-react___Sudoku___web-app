import React from 'react';
import Cell from './Cell';

interface SudokuBoardProps {
    board: number[][];
    initialBoard: number[][];
    onCellSelect: (row: number, col: number) => void;
    selectedCell: { row: number; col: number } | null;
    conflicts: { row: number; col: number }[];
    isGenerating: boolean;
}

const SudokuBoard: React.FC<SudokuBoardProps> = React.memo(
    ({ board, initialBoard, onCellSelect, selectedCell, conflicts, isGenerating }) => {
        const selectedValue = selectedCell ? board[selectedCell.row][selectedCell.col] : 0;

        return (
            <div className="sudoku-board-wrapper">
                {isGenerating && (
                    <div className="loading-overlay" aria-live="polite" aria-busy="true">
                        <div className="spinner"></div>
                        <p>Generating Puzzle...</p>
                    </div>
                )}
                <div className={`sudoku-board ${isGenerating ? 'is-blurred' : ''}`} role="grid" aria-label="Sudoku Puzzle Board">
                    {board.map((row, rowIndex) => (
                        <div key={`row-${rowIndex}`} role="row" className="sudoku-row">
                            {row.map((value, colIndex) => {
                                const isInitial = initialBoard[rowIndex][colIndex] !== 0;
                                const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                                const isHighlighted = !isSelected && selectedValue !== 0 && value === selectedValue;
                                const isRelated = selectedCell ? (
                                    rowIndex === selectedCell.row || 
                                    colIndex === selectedCell.col ||
                                    (Math.floor(rowIndex / 3) === Math.floor(selectedCell.row / 3) && Math.floor(colIndex / 3) === Math.floor(selectedCell.col / 3))
                                ) : false;
                                const isConflict = conflicts.some(c => c.row === rowIndex && c.col === colIndex);
                                const isThickRight = colIndex === 2 || colIndex === 5;
                                const isThickBottom = rowIndex === 2 || rowIndex === 5;

                                return (
                                    <Cell
                                        key={`cell-${rowIndex}-${colIndex}`}
                                        value={value}
                                        isInitial={isInitial}
                                        isSelected={isSelected}
                                        isHighlighted={isHighlighted}
                                        isRelated={isRelated}
                                        isConflict={isConflict}
                                        isThickRight={isThickRight}
                                        isThickBottom={isThickBottom}
                                        row={rowIndex}
                                        col={colIndex}
                                        onClick={() => !isGenerating && onCellSelect(rowIndex, colIndex)}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    }
);

export default SudokuBoard;