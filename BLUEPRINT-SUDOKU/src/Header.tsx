import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="app-header">
            <h1>
                <span className="icon" role="img" aria-label="Sudoku Grid Icon">🎲</span>
                <span className="text-gradient">Sudoku</span>
            </h1>
        </header>
    );
};

export default Header;