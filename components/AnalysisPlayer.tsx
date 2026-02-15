import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Target, Timer, Rewind } from 'lucide-react';

interface AnalysisPlayerProps {
  videoUrl: string;
  fps: number;
  onTimeUpdate: (time: number) => void;
  onMarkRelease: (time: number) => void;
  onMarkImpact: (time: number) => void;
  releaseTime: number | null;
  impactTime: number | null;
}

const AnalysisPlayer: React.FC<AnalysisPlayerProps> = ({
  videoUrl,
  fps,
  onTimeUpdate,
  onMarkRelease,
  onMarkImpact,
  releaseTime,
  impactTime,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Convert seconds to ms string format (e.g. 00:01:450)
  const formatTime = (time: number) => {
    const seconds = Math.floor(time);
    const ms = Math.floor((time % 1) * 1000);
    return `${seconds.toString().padStart(2, '0')}s : ${ms.toString().padStart(3, '0')}ms`;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const stepFrame = (direction: 1 | -1) => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      // Frame duration in seconds
      const frameTime = 1 / fps;
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime + (direction * frameTime));
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  // Sync isPlaying state with video events (in case video ends or user scrubs)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    video.addEventListener('pause', handlePause);
    video.addEventListener('play', handlePlay);

    return () => {
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('play', handlePlay);
    };
  }, []);

  return (
    <div className="w-full space-y-4">
      <div className="relative bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full max-h-[500px] mx-auto"
          onTimeUpdate={handleTimeUpdate}
          playsInline
        />
        
        {/* Time Overlay */}
        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg border border-primary/20 flex items-center gap-3">
            <Timer className="w-4 h-4 text-primary" />
            <span className="font-mono text-xl font-bold text-white tracking-widest">
                {formatTime(currentTime)}
            </span>
        </div>

        {/* Marker Overlays */}
        {releaseTime !== null && (
             <div className="absolute top-4 left-4 bg-green-500/90 text-black px-3 py-1 rounded-md text-xs font-bold shadow-lg backdrop-blur-sm">
                RELEASE: {formatTime(releaseTime)}
             </div>
        )}
        {impactTime !== null && (
             <div className="absolute top-16 left-4 bg-red-500/90 text-white px-3 py-1 rounded-md text-xs font-bold shadow-lg backdrop-blur-sm">
                IMPACT: {formatTime(impactTime)}
             </div>
        )}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4 bg-surface p-4 rounded-xl border border-white/5">
            <button 
                onClick={() => stepFrame(-1)}
                className="p-3 hover:bg-white/10 rounded-full transition-colors text-gray-300 hover:text-white group"
                title="Previous Frame"
            >
                <ChevronLeft className="w-6 h-6 group-active:-translate-x-1 transition-transform" />
            </button>

            <button 
                onClick={togglePlay}
                className="w-14 h-14 bg-primary text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,240,255,0.3)]"
            >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
            </button>

            <button 
                onClick={() => stepFrame(1)}
                className="p-3 hover:bg-white/10 rounded-full transition-colors text-gray-300 hover:text-white group"
                title="Next Frame"
            >
                <ChevronRight className="w-6 h-6 group-active:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Tagging Controls */}
          <div className="flex items-center gap-3">
             <button
                onClick={() => onMarkRelease(currentTime)}
                className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    releaseTime !== null 
                    ? 'bg-green-500/20 border-green-500 text-green-400' 
                    : 'bg-surface border-white/10 text-gray-400 hover:bg-white/5 hover:border-green-500/50 hover:text-green-400'
                }`}
             >
                <span className="text-xs uppercase font-bold mb-1">1. Release Point</span>
                <Target className="w-5 h-5" />
             </button>

             <button
                onClick={() => onMarkImpact(currentTime)}
                className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    impactTime !== null 
                    ? 'bg-red-500/20 border-red-500 text-red-400' 
                    : 'bg-surface border-white/10 text-gray-400 hover:bg-white/5 hover:border-red-500/50 hover:text-red-400'
                }`}
             >
                <span className="text-xs uppercase font-bold mb-1">2. Impact Point</span>
                <Rewind className="w-5 h-5 rotate-180" />
             </button>
          </div>
      </div>
      
      <div className="text-center text-xs text-gray-500 font-mono">
        Stepping at 1/{fps}s intervals ({((1/fps)*1000).toFixed(2)}ms)
      </div>
    </div>
  );
};

export default AnalysisPlayer;