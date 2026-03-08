import React, { useState } from 'react';
import Button from './components/Button';
import ButtonGroup from './components/ButtonGroup';

interface GameControlsProps {
    onNewGame: (difficulty: number) => void;
    onUndo: () => void;
    onHint: () => void;
    onSolve: () => void;
    onInput: (num: number) => void;
    onErase: () => void;
    canUndo: boolean;
    isGenerating: boolean;
}

type Difficulty = 'Easy' | 'Medium' | 'Hard';

const DIFFICULTY_LEVELS: { [key in Difficulty]: number } = {
    Easy: 35,
    Medium: 45,
    Hard: 55,
};

// Inline SVGs for zero dependencies and perfect coloring
const PlayIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const UndoIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"></path></svg>;
const HintIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14"></path></svg>;
const FlameIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"></path></svg>;
const EraserIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20H7L3 16C2.5 15.5 2.5 14.5 3 14L13 4C13.5 3.5 14.5 3.5 15 4L20 9C20.5 9.5 20.5 10.5 20 11L11 20"></path><path d="M17 14L10 7"></path></svg>;

const GameControls: React.FC<GameControlsProps> = React.memo(
    ({ onNewGame, onUndo, onHint, onSolve, onInput, onErase, canUndo, isGenerating }) => {
        const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('Medium');

        const handleNewGameClick = () => {
            onNewGame(DIFFICULTY_LEVELS[selectedDifficulty]);
        };

        return (
            <div className="control-card game-controls">
                
                {/* Mobile Numpad */}
                <div className="numpad-section">
                    <div className="numpad-grid">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <Button 
                                key={num} 
                                className="numpad-btn" 
                                onClick={() => onInput(num)}
                                disabled={isGenerating}
                                aria-label={`Input number ${num}`}
                            >
                                {num}
                            </Button>
                        ))}
                    </div>
                    <Button 
                        className="numpad-erase-btn" 
                        onClick={onErase} 
                        disabled={isGenerating}
                        icon={<EraserIcon />}
                        aria-label="Erase cell"
                    >
                        Erase
                    </Button>
                </div>

                <div className="divider"></div>

                <h2>New Game</h2>
                <ButtonGroup fill>
                    {(Object.keys(DIFFICULTY_LEVELS) as Difficulty[]).map(level => (
                        <Button
                            key={level}
                            className={selectedDifficulty === level ? 'bp5-active' : ''}
                            onClick={() => setSelectedDifficulty(level)}
                            disabled={isGenerating}
                            aria-label={`Set difficulty to ${level}`}
                        >
                            {level}
                        </Button>
                    ))}
                </ButtonGroup>
                <Button
                    intent="primary"
                    large
                    onClick={handleNewGameClick}
                    disabled={isGenerating}
                    icon={<PlayIcon />}
                >
                    Start Game
                </Button>

                <div className="divider"></div>

                <h2>Actions</h2>
                <ButtonGroup fill>
                    <Button
                        onClick={onUndo}
                        disabled={!canUndo}
                        icon={<UndoIcon />}
                    >
                        Undo
                    </Button>
                    <Button 
                        onClick={onHint}
                        disabled={isGenerating}
                        icon={<HintIcon />}
                    >
                        Hint
                    </Button>
                </ButtonGroup>
                <div className="mt-half">
                    <Button 
                        onClick={onSolve}
                        intent="danger"
                        disabled={isGenerating}
                        icon={<FlameIcon />}
                        large
                        fill
                    >
                        Solve Puzzle
                    </Button>
                </div>
            </div>
        );
    }
);

export default GameControls;