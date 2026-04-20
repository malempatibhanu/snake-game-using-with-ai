import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import { DUMMY_TRACKS } from '../data/music';

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = DUMMY_TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((e) => console.error("Audio playback error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const skipForward = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % DUMMY_TRACKS.length);
    // Usually want it to play if skipping
    setIsPlaying(true);
  };

  const skipBack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + DUMMY_TRACKS.length) % DUMMY_TRACKS.length);
    setIsPlaying(true);
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const handleEnded = () => {
    skipForward();
  };

  return (
    <div className="vhs-border p-4 flex items-center justify-between w-full">
      <div className="flex items-center gap-4 tear-box">
        <div className="w-12 h-12 border-2 border-[#0ff] bg-[#000] flex items-center justify-center p-1 relative">
          {isPlaying && <div className="absolute inset-0 bg-[#f0f] animate-pulse opacity-50"></div>}
          <div className="w-full h-full border border-[#f0f] flex items-center justify-center">
            <span className="text-[10px] font-sans text-[#0ff]">VOL</span>
          </div>
        </div>
        <div>
          <h3 className="font-display text-[#f0f] text-sm md:text-md uppercase tracking-wider shadow-[2px_2px_0_#0ff]">
            {currentTrack.title}
          </h3>
          <p className="text-xl font-sans text-[#0ff]">// {currentTrack.artist}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={skipBack}
          className="btn-sys p-2"
        >
          <SkipBack size={20} />
        </button>
        <button 
          onClick={togglePlay}
          className="btn-sys p-3"
        >
          {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current ml-1" />}
        </button>
        <button 
          onClick={skipForward}
          className="btn-sys p-2"
        >
          <SkipForward size={20} />
        </button>
      </div>

      <div className="hidden sm:flex items-center gap-2">
        <button 
          onClick={toggleMute}
          className="btn-sys p-2"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      <audio 
        ref={audioRef} 
        src={currentTrack.url}
        onEnded={handleEnded}
      />
    </div>
  );
}
