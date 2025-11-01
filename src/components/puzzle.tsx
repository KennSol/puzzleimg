'use client';

import React, { useState, useEffect } from 'react';
import { Shuffle, RotateCcw, Trophy } from 'lucide-react';

interface Tile {
  value: number;
  position: number;
}

export default function Puzzle() {
  const IMAGE_URL = 'https://picsum.photos/600/600?random=1';

  const initialTiles: Tile[] = Array.from({ length: 9 }, (_, i) => ({
    value: i === 8 ? 0 : i + 1,
    position: i,
  }));

  const [tiles, setTiles] = useState<Tile[]>(initialTiles);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [leaderboard, setLeaderboard] = useState<{ moves: number; date: string }[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('puzzle-leaderboard');
    if (saved) setLeaderboard(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const isSolved = tiles.every((t, i) => t.value === (i === 8 ? 0 : i + 1));
    if (isSolved && moves > 0) {
      setIsWon(true);
      saveToLeaderboard();
    }
  }, [tiles, moves]);

  const saveToLeaderboard = () => {
    const newEntry = { moves, date: new Date().toLocaleString() };
    const updated = [...leaderboard, newEntry].sort((a, b) => a.moves - b.moves).slice(0, 5);
    setLeaderboard(updated);
    localStorage.setItem('puzzle-leaderboard', JSON.stringify(updated));
  };

  const shuffle = () => {
    let shuffled: Tile[];
    let attempts = 0;
    do {
      shuffled = [...initialTiles].sort(() => Math.random() - 0.5);
      attempts++;
    } while (!isSolvable(shuffled.map(t => t.value)) && attempts < 100);
    setTiles(shuffled.map((t, i) => ({ ...t, position: i })));
    setMoves(0);
    setIsWon(false);
  };

  const isSolvable = (grid: number[]) => {
    let inv = 0;
    for (let i = 0; i < 9; i++) {
      if (grid[i] === 0) continue;
      for (let j = i + 1; j < 9; j++) {
        if (grid[j] !== 0 && grid[i] > grid[j]) inv++;
      }
    }
    return inv % 2 === 0;
  };

  const getValidMoves = (emptyIdx: number) => {
    const r = Math.floor(emptyIdx / 3), c = emptyIdx % 3;
    const m: number[] = [];
    if (r > 0) m.push(emptyIdx - 3);
    if (r < 2) m.push(emptyIdx + 3);
    if (c > 0) m.push(emptyIdx - 1);
    if (c < 2) m.push(emptyIdx + 1);
    return m;
  };

  const handleTileClick = (idx: number) => {
    if (isWon) return;
    const emptyIdx = tiles.findIndex(t => t.value === 0);
    if (getValidMoves(emptyIdx).includes(idx)) {
      const newTiles = [...tiles];
      [newTiles[emptyIdx], newTiles[idx]] = [newTiles[idx], newTiles[emptyIdx]];
      setTiles(newTiles);
      setMoves(m => m + 1);
    }
  };

  const reset = () => {
    setTiles(initialTiles);
    setMoves(0);
    setIsWon(false);
  };

  const getClipPath = (value: number) => {
    if (value === 0) return 'inset(0)';
    const pos = value - 1;
    const row = Math.floor(pos / 3);
    const col = pos % 3;
    return `inset(${row * 33.333}% ${(2 - col) * 33.333}% ${(2 - row) * 33.333}% ${col * 33.333}%)`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Puzzle de Imagen</h1>
          <p className="text-gray-400">Desliza para reconstruir la foto</p>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-lg">Movimientos: <span className="text-purple-400 font-bold">{moves}</span></span>
          <div className="flex gap-2">
            <button onClick={shuffle} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all">
              <Shuffle className="w-5 h-5" />
            </button>
            <button onClick={reset} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all">
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* GRID FORZADO CON CSS PURO */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            width: '320px',
            height: '320px',
            margin: '0 auto',
            backgroundColor: '#1a1a1a',
            padding: '8px',
            borderRadius: '12px',
          }}
        >
          {tiles.map((tile, idx) => {
            const isEmpty = tile.value === 0;
            return (
              <button
                key={idx}
                onClick={() => handleTileClick(idx)}
                disabled={isEmpty || isWon}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '8px',
                  backgroundColor: isEmpty ? '#374151' : 'transparent',
                  cursor: isEmpty ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  transform: isEmpty ? 'none' : 'scale(1)',
                }}
                onMouseEnter={(e) => !isEmpty && !isWon && (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => !isEmpty && !isWon && (e.currentTarget.style.transform = 'scale(1)')}
              >
                {!isEmpty && (
                  <img
                    src={IMAGE_URL}
                    alt=""
                    style={{
                      width: '300%',
                      height: '300%',
                      objectFit: 'cover',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      clipPath: getClipPath(tile.value),
                      transform: `translate(${(tile.value - 1) % 3 * -100}%, ${Math.floor((tile.value - 1) / 3) * -100}%)`,
                    }}
                    draggable={false}
                  />
                )}
              </button>
            );
          })}
        </div>

        {isWon && (
          <div className="text-center p-4 bg-green-900 rounded-lg">
            <p className="text-xl font-bold">¡Completado!</p>
            <p className="text-green-300">En {moves} movimientos</p>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold">Mejores récords</span>
          </div>
          {leaderboard.length === 0 ? (
            <p className="text-gray-500 text-center">Sin récords aún</p>
          ) : (
            <ol className="space-y-1 text-sm">
              {leaderboard.map((e, i) => (
                <li key={i} className="flex justify-between text-gray-400">
                  <span>{i + 1}. {e.date}</span>
                  <span className="text-purple-400">{e.moves} mov.</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}