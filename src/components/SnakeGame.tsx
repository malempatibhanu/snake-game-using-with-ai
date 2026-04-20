import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, Gamepad2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;
const GAME_SPEED = 120; // ms per tick

type Point = { x: number, y: number };

const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 }; // UP

function generateFood(currentSnake: Point[]): Point {
  let newFood: Point;
  let isOccupied = true;
  while (isOccupied) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    isOccupied = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
  }
  return newFood!;
}

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 15, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

  // Use a ref for the direction to avoid closure staleness in the game loop
  const dirRef = useRef(direction);
  // Also track the last executed direction to prevent 180-degree self-collisions in one tick
  const lastDirRef = useRef(direction);

  useEffect(() => {
    dirRef.current = direction;
  }, [direction]);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    dirRef.current = INITIAL_DIRECTION;
    lastDirRef.current = INITIAL_DIRECTION;
    setFood(generateFood(INITIAL_SNAKE));
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (!gameOver) {
      setIsPaused(prev => !prev);
    }
  };

  const gameLoop = useCallback(() => {
    if (isPaused || gameOver) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = {
        x: head.x + dirRef.current.x,
        y: head.y + dirRef.current.y
      };

      lastDirRef.current = dirRef.current;

      // Check collision with walls
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setGameOver(true);
        return prevSnake;
      }

      // Check collision with self
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => {
          const newScore = s + 10;
          setHighScore(prev => Math.max(prev, newScore));
          return newScore;
        });
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop(); // Remove tail if no food eaten
      }

      return newSnake;
    });
  }, [food, isPaused, gameOver]);

  // Main game tick
  useEffect(() => {
    const interval = setInterval(gameLoop, GAME_SPEED);
    return () => clearInterval(interval);
  }, [gameLoop]);

  // Handle keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ') {
        handlePause();
        return;
      }

      const currentDir = lastDirRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDir.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDir.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDir.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDir.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Keyboard controls for mobile UI
  const setMoveDir = (dir: Point) => {
    const currentDir = lastDirRef.current;
    if (dir.x !== 0 && currentDir.x !== 0) return;
    if (dir.y !== 0 && currentDir.y !== 0) return;
    setDirection(dir);
  };

  // Render on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000'; // Pure black for brutalist
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw Grid (Raw blocks)
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1;
    for (let i = 0; i <= CANVAS_SIZE; i += CELL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
      ctx.stroke();
    }

    // Draw Food (Cyan blocks)
    ctx.fillStyle = '#0ff';
    ctx.fillRect(food.x * CELL_SIZE + 2, food.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
    // Draw crosshair on food
    ctx.strokeStyle = '#f0f';
    ctx.lineWidth = 2;
    ctx.strokeRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

    // Draw Snake (Magenta solid with offset cyan shadow effect natively drawn)
    snake.forEach((segment, index) => {
      ctx.fillStyle = '#0ff'; // Shadow
      ctx.fillRect(segment.x * CELL_SIZE + 2, segment.y * CELL_SIZE + 2, CELL_SIZE, CELL_SIZE);
      ctx.fillStyle = index === 0 ? '#fff' : '#f0f'; // Head white, body magenta
      ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });

  }, [snake, food]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg">
      
      {/* Score Header */}
      <div className="flex justify-between items-center w-full px-2 tear-box">
        <div className="flex flex-col">
          <span className="text-xl font-sans text-white bg-[#f0f] px-2 mb-1 shadow-[2px_2px_0_#0ff]">CUR_VAL</span>
          <span className="text-4xl font-display text-[#0ff]">{score}</span>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-xl font-sans text-[#000] bg-[#0ff] px-2 mb-1 shadow-[-2px_2px_0_#f0f]">MAX_OP</span>
          <span className="text-4xl font-display text-[#f0f]">{highScore}</span>
        </div>
      </div>

      {/* Game Canvas Container */}
      <div className="relative vhs-border w-full aspect-square">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="w-full h-full object-contain"
        />
        
        {/* Overlays */}
        {(gameOver || isPaused) && (
          <div className="absolute inset-0 bg-[#000] bg-opacity-80 flex flex-col items-center justify-center z-10 scan-text p-4 border-4 border-[#f0f]">
            {gameOver ? (
              <>
                <div className="text-4xl md:text-5xl font-display font-bold text-[#f0f] mb-4 text-center glitch-text" data-text="FATAL_ERR">
                  FATAL_ERR
                </div>
                <div className="text-2xl font-sans text-white mb-8 bg-[#0ff] text-[#000] px-2">
                  SCORE // {score}
                </div>
                <button 
                  onClick={startGame}
                  className="btn-sys px-8 py-4 text-xl"
                >
                  <RotateCcw size={24} className="inline mr-2" /> REBOOT()
                </button>
              </>
            ) : (
              !gameOver && isPaused && snake.length === INITIAL_SNAKE.length && score === 0 ? (
                <>
                  <Gamepad2 size={48} className="text-[#0ff] mb-6 tear-box" />
                  <button 
                    onClick={startGame}
                    className="btn-sys px-8 py-4 text-xl"
                  >
                    EXECUTE_RUN
                  </button>
                </>
              ) : (
                <>
                  <div className="text-4xl font-display font-bold text-[#f0f] mb-8 glitch-text" data-text="HALTED">HALTED</div>
                  <button 
                    onClick={handlePause}
                    className="btn-sys px-8 py-4 text-xl"
                  >
                    RESUME_OP
                  </button>
                  <div className="mt-4 text-xl">KEY_CMD: [SPACE]</div>
                </>
              )
            )}
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="grid grid-cols-3 gap-3 mt-4 md:hidden w-full max-w-[200px] mx-auto tear-box">
        <div />
        <button onClick={() => setMoveDir({ x: 0, y: -1 })} className="btn-sys py-4 flex justify-center"><ArrowUp size={32} /></button>
        <div />
        <button onClick={() => setMoveDir({ x: -1, y: 0 })} className="btn-sys py-4 flex justify-center"><ArrowLeft size={32} /></button>
        <button onClick={() => setMoveDir({ x: 0, y: 1 })} className="btn-sys py-4 flex justify-center"><ArrowDown size={32} /></button>
        <button onClick={() => setMoveDir({ x: 1, y: 0 })} className="btn-sys py-4 flex justify-center"><ArrowRight size={32} /></button>
      </div>

      <div className="text-xl font-sans text-white bg-[#000] border-2 border-[#f0f] px-4 py-2 mt-2 hidden md:block">
        CMD: [W][A][S][D] OR [ARROWS] // INT: [SPACE]
      </div>
    </div>
  );
}
