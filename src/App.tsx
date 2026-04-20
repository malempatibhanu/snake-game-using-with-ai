import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';
import { Gamepad2 } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col pt-8 pb-24 px-4 select-none relative z-10">
      
      <header className="flex flex-col items-center justify-center mb-8">
        <div className="flex items-center gap-4 mb-4 tear-box">
          <Gamepad2 size={40} className="text-[#f0f]" />
          <h1 
            className="text-4xl md:text-5xl font-display font-bold glitch-text uppercase tracking-widest"
            data-text="SYS.SNAKE"
          >
            SYS.SNAKE
          </h1>
        </div>
        <p className="scan-text font-sans text-xl border-b-2 border-[#0ff] px-2 uppercase shadow-[2px_2px_0_#f0f] tracking-widest">
          // audio_link.established //
        </p>
      </header>

      <main className="flex-1 flex items-center justify-center relative w-full mb-12">
        <SnakeGame />
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 border-t-4 border-[#0ff] bg-[#000] z-20">
        <div className="max-w-4xl mx-auto">
          <MusicPlayer />
        </div>
      </footer>
      
    </div>
  );
}
