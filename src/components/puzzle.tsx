'use client';

import React, { useState, useEffect } from 'react';
import { Shuffle, RotateCcw, Trophy } from 'lucide-react';

export default function Puzzle() {
  // IMAGEN QUE SIEMPRE FUNCIONA
  const IMAGE_URL = 'https://picsum.photos/600/600?random=1';

  const [tiles, setTiles] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 0]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  // Cargar ranking
  const [leaderboard, setLeaderboard] = useState<{ moves: number; date: string }[]>([]);
  useEffect(() => {
    const saved = localStorage.getItem('puzzle-leaderboard');
    if (saved) setLeaderboard(JSON.parse(saved));
  }, []);

  // Verificar victoria
  useEffect(() => {
    if (!isWon && tiles.every((t, i) => t === (i === 8 ? 0 : i + 1)) && moves > 0) {
      setIsWon(true);
      const entry = { moves, date: new Date().toLocaleString() };
      const updated = [...leaderboard, entry].sort((a, b) => a.moves - b.moves).slice(0, 5);
      setLeaderboard(updated);
      localStorage.setItem('puzzle-leaderboard', JSON.stringify(updated));
    }
  }, [tiles, moves, isWon, leaderboard]); // ← Añadido isWon

  const shuffle = () => {
    let arr = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    do {
      arr = arr.sort(() => Math.random() - 0.5);
    } while (!isSolvable(arr));
    setTiles(arr);
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

  const move = (idx: number) => {
    const empty = tiles.indexOf(0);
    const valid = [
      empty - 1, empty + 1, empty - 3, empty + 3
    ].filter(i => 
      i >= 0 && i < 9 && 
      Math.abs(i % 3 - empty % 3) + Math.abs(Math.floor(i / 3) - Math.floor(empty / 3)) === 1
    );
    if (valid.includes(idx)) {
      const newTiles = [...tiles];
      [newTiles[empty], newTiles[idx]] = [newTiles[idx], newTiles[empty]];
      setTiles(newTiles);
      setMoves(m => m + 1);
    }
  };

  const getPosition = (value: number) => {
    if (value === 0) return 'center';
    const pos = value - 1;
    const x = (pos % 3) * 50;
    const y = Math.floor(pos / 3) * 50;
    return `${x}% ${y}%`;
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
            <button onClick={shuffle} className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              <Shuffle className="w-5 h-5" />
            </button>
            <button onClick={() => setTiles([1,2,3,4,5,6,7,8,0])} className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* GRID 3x3 FIJO */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          width: '320px',
          height: '320px',
          margin: '0 auto',
          backgroundColor: '#1f2937',
          padding: '12px',
          borderRadius: '16px',
        }}>
          {tiles.map((value, idx) => (
            <button
              key={idx}
              onClick={() => move(idx)}
              disabled={value === 0 || isWon}
              style={{
                borderRadius: '12px',
                backgroundColor: value === 0 ? '#374151' : 'transparent',
                backgroundImage: value === 0 ? 'none' : `url(${IMAGE_URL})`,
                backgroundSize: '300%',
                backgroundPosition: getPosition(value),
                backgroundRepeat: 'no-repeat',
                cursor: value === 0 ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: value === 0 ? 'none' : '0 4px 10px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={e => value !== 0 && !isWon && (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={e => value !== 0 && !isWon && (e.currentTarget.style.transform = 'scale(1)')}
            />
          ))}
        </div>

        {isWon && (
          <div className="text-center p-6 bg-green-900 rounded-xl">
            <p className="text-2xl font-bold">¡Completado!</p>
            <p className="text-green-300 mt-2">En {moves} movimientos</p>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span className="text-lg font-semibold">Mejores récords</span>
          </div>
          {leaderboard.length === 0 ? (
            <p className="text-gray-500 text-center">Sin récords aún</p>
          ) : (
            <ol className="space-y-2 text-sm">
              {leaderboard.map((e, i) => (
                <li key={i} className="flex justify-between text-gray-300">
                  <span>{i + 1}. {e.date}</span>
                  <span className="text-purple-400 font-medium">{e.moves} mov.</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
