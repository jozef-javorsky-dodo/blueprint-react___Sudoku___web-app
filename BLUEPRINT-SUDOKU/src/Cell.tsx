import React from 'react';

interface CellProps {
    value: number;
    isInitial: boolean;
    isSelected: boolean;
    isHighlighted: boolean;
    isRelated: boolean;
    isConflict: boolean;
    isThickRight: boolean;
    isThickBottom: boolean;
    row: number;
    col: number;
    onClick: () => void;
}

const Cell: React.FC<CellProps> = React.memo(
    ({ value, isInitial, isSelected, isHighlighted, isRelated, isConflict, isThickRight, isThickBottom, row, col, onClick }) => {
        const classNames = [
            'sudoku-cell',
            isInitial ? 'is-initial' : '',
            isSelected ? 'is-selected' : '',
            isHighlighted ? 'is-highlighted' : '',
            isRelated && !isSelected ? 'is-related' : '',
            isConflict ? 'is-conflict' : '',
            !isInitial && value !== 0 ? 'is-player-filled' : '',
            value === 0 ? 'is-empty' : '',
            isThickRight ? 'border-right-thick' : '',
            isThickBottom ? 'border-bottom-thick' : ''
        ].filter(Boolean).join(' ');

        const ariaLabel = `Row ${row + 1}, Column ${col + 1}, ${
            value === 0 ? 'Empty' : `Value ${value}`
        }${isInitial ? ', Read only' : ''}${isConflict ? ', Invalid conflict' : ''}`;

        return (
            <button
                type="button"
                role="gridcell"
                aria-selected={isSelected}
                aria-readonly={isInitial}
                aria-invalid={isConflict}
                aria-label={ariaLabel}
                onClick={onClick}
                className={classNames}
                tabIndex={isSelected ? 0 : -1}
            >
                {value !== 0 ? value : ''}
            </button>
        );
    }
);

export default Cell;