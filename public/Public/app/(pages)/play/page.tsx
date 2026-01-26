
'use client';

import { useState } from 'react';
import MobileAppLayout from '../../components/common/MobileAppLayout';
import ChessBoard from '../../components/chess/ChessBoardNew';
import GameControls from '../../components/features/GameControls';
import { createInitialState, GameState } from '../../lib/chessEngine';

export default function PlayPage() {
  // Game state for demo (replace with real logic as needed)
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [isPlayerWhite, setIsPlayerWhite] = useState(true);

  // Demo player/opponent info
  const player = {
    name: 'Grandmaster_X',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQ3HQrFfrNdnKSHXU4A49F9JihIeW9yKHIE07EjgOZ-OkNcksLfCqi07k7sOLht6noRlaIFyyAMgXVJrkPrWL_I_3-yvR2jyYe0E0batDnzQ-gqZHLzm7dsRcnHc67-uXKRTAwpYKb7EMTn5RlhoSsSoTbmitkNHcv_oD-FZXJCCIdGAJUYI3HLoTsTGDaldKtuwkYYkrFPVr45KlEdCKhDCuOJVKIgxscRbYkLIzG9InVYPmwyLMRWnkJ95bAZ1gdYiuqBpBeHkOW',
    elo: 2450,
    time: '03:42',
    material: '♙♙♘',
    materialDiff: '+1 material',
  };

  return (
    <MobileAppLayout>
      {/* Top App Bar */}
      <div className="flex items-center dark:bg-background-dark p-4 pb-2 justify-between">
        <div className="text-white flex size-12 shrink-0 items-center">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Live Match</h2>
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-full bg-green-500"></div>
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">On-Chain Sync</span>
          </div>
        </div>
        <div className="flex w-12 items-center justify-end">
          <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-transparent text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </div>
      {/* Opponent Profile Header */}
      <div className="flex p-4 border-b border-white/5 bg-black/20">
        <div className="flex w-full flex-col gap-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-4">
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg h-16 w-16 border border-white/10" style={{backgroundImage: `url('${player.avatar}')`}}></div>
              <div className="flex flex-col justify-center">
                <p className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">{player.name}</p>
                <p className="text-[#9da6b9] text-sm font-normal leading-normal">ELO {player.elo}</p>
              </div>
            </div>
            <div className="bg-zinc-800/80 px-4 py-2 rounded-lg border border-white/10">
              <p className="text-white text-2xl font-bold font-mono tracking-tighter">{player.time}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Captured Material Top */}
      <div className="px-4 py-2 flex items-center justify-between bg-black/10">
        <div className="flex gap-1 text-zinc-400">
          <span className="text-lg">{player.material}</span>
        </div>
        <div className="text-xs font-bold text-zinc-500">{player.materialDiff}</div>
      </div>
      {/* Chessboard Area */}
      <div className="flex-1 flex items-center justify-center p-2 bg-zinc-900/40">
        <div className="w-full aspect-square rounded-lg overflow-hidden shadow-2xl shadow-primary/20 border-4 border-zinc-800 flex items-center justify-center">
          <ChessBoard
            gameState={gameState}
            onMove={() => {}}
            isPlayerWhite={isPlayerWhite}
            disabled={false}
            lastMove={null}
            showCoordinates={false}
            highlightLegalMoves={true}
          />
        </div>
      </div>
      {/* Mobile Controls */}
      <div className="w-full px-4 pb-4">
        <GameControls
          gameState={gameState}
          onNewGame={() => setGameState(createInitialState())}
          onUndo={() => {}}
          onFlipBoard={() => setIsPlayerWhite((w) => !w)}
          isPlayerWhite={isPlayerWhite}
          isSinglePlayer={true}
        />
      </div>
    </MobileAppLayout>
  );
}
