import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Header from './Header';
import SudokuBoard from './SudokuBoard';
import GameControls from './GameControls';
import { useSudoku } from './useSudoku';

function App() {
    const [difficulty, setDifficulty] = useState(45);
    const {
        state,
        handleNewGame,
        handleCellSelect,
        handleInputNumber,
        handleErase,
        handleUndo,
        handleHint,
        handleSolve,
        clearNotification,
    } = useSudoku(difficulty);

    useEffect(() => {
        if (state.notification) {
            const { type, message } = state.notification;
            const options = { duration: 3000, className: 'toast-style' };
            switch (type) {
                case 'success': toast.success(message, options); break;
                case 'error': toast.error(message, options); break;
                case 'info': toast(message, options); break;
            }
            clearNotification();
        }
    }, [state.notification, clearNotification]);

    useEffect(() => {
        if (state.isSolved && !state.isGenerating) {
            toast.success("Masterful! You've solved the puzzle!", {
                duration: 6000,
                icon: '🏆',
                className: 'toast-style',
            });
        }
    }, [state.isSolved, state.isGenerating]);

    const startNewGame = (newDifficulty: number) => {
        setDifficulty(newDifficulty);
        handleNewGame(newDifficulty);
    };

    return (
        <div className="App">
            <Toaster position="top-center" />
            <Header />
            <main className="main-container">
                <section className="board-area" aria-label="Sudoku board area">
                    <SudokuBoard
                        board={state.board}
                        initialBoard={state.initialBoard}
                        onCellSelect={handleCellSelect}
                        selectedCell={state.selectedCell}
                        conflicts={state.conflicts}
                        isGenerating={state.isGenerating}
                    />
                </section>
                <aside className="controls-area" aria-label="Game controls and numpad">
                    <GameControls
                        onNewGame={startNewGame}
                        onUndo={handleUndo}
                        onHint={handleHint}
                        onSolve={handleSolve}
                        onInput={handleInputNumber}
                        onErase={handleErase}
                        canUndo={state.history.length > 1 && !state.isGenerating}
                        isGenerating={state.isGenerating}
                    />
                </aside>
            </main>
            <footer className="app-footer">
                <p>Premium Sudoku © {new Date().getFullYear()}</p>
                <p className="author-tag">Crafted by jj (( dodo )) 🐝🐢🐘💻💾🍕🥦🛹⚛️🌌🍀🍃</p>
            </footer>
        </div>
    );
}

export default App;