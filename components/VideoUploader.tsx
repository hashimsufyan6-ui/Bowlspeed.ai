import React, { useRef, useState } from 'react';
import { Upload, X, Film, AlertCircle, Settings, Monitor, Timer, Info } from 'lucide-react';
import { FPS, VideoResolution } from '../types';

interface VideoUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  fps: number;
  onFpsChange: (fps: number) => void;
  resolution: VideoResolution;
  onResolutionChange: (res: VideoResolution) => void;
  disabled: boolean;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ 
  onFileSelect, 
  selectedFile, 
  fps, 
  onFpsChange,
  resolution,
  onResolutionChange,
  disabled 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('video/')) {
      setError("Please upload a valid video file.");
      return;
    }
    // Limit to 100MB
    if (file.size > 100 * 1024 * 1024) {
      setError("File too large. Please upload a clip under 100MB.");
      return;
    }
    onFileSelect(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Settings Panel */}
      <div className="bg-surface p-5 rounded-xl border border-white/10 space-y-4">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
            <Settings className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Video Configuration</span>
        </div>

        {/* FPS Selection */}
        <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2 text-gray-400">
                <Timer className="w-4 h-4" />
                <span className="text-xs font-medium">Recording Frame Rate</span>
                <div className="group relative ml-auto">
                    <Info className="w-3 h-3 text-gray-600 hover:text-primary cursor-help" />
                    <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-black/90 border border-white/10 rounded text-[10px] text-gray-300 hidden group-hover:block z-50">
                        Select the FPS the video was <strong>recorded</strong> at. If it's a slow-motion video, select 120 or 240.
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-4 gap-2 bg-dark rounded-lg p-1 border border-white/5">
                {[FPS.FPS_30, FPS.FPS_60, FPS.FPS_120, FPS.FPS_240].map((val) => (
                    <button
                        key={val}
                        onClick={() => onFpsChange(val)}
                        disabled={disabled}
                        className={`flex flex-col items-center justify-center py-2 rounded-md transition-all ${
                            fps === val 
                            ? 'bg-primary text-black shadow-lg shadow-primary/20' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        } disabled:opacity-50`}
                    >
                        <span className="text-xs font-bold">{val}</span>
                        <span className="text-[9px] opacity-75">{val > 60 ? 'Slo-Mo' : 'Realtime'}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Resolution Selection */}
        <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2 text-gray-400">
                <Monitor className="w-4 h-4" />
                <span className="text-xs font-medium">Resolution Quality</span>
            </div>
            <div className="flex flex-wrap gap-1 bg-dark rounded-lg p-1 border border-white/5">
                {Object.values(VideoResolution).map((res) => (
                    <button
                        key={res}
                        onClick={() => onResolutionChange(res)}
                        disabled={disabled}
                        className={`flex-1 px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded-md transition-all ${
                            resolution === res 
                            ? 'bg-secondary text-white shadow-lg shadow-secondary/20' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        } disabled:opacity-50`}
                    >
                        {res.split(' ')[0]}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Drop Zone */}
      <div 
        className={`relative group rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out h-64 flex flex-col items-center justify-center
          ${dragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-white/10 hover:border-white/20 bg-surface'}
          ${disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept="video/*" 
          className="hidden" 
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {selectedFile ? (
          <div className="relative w-full h-full p-4 flex flex-col items-center justify-center z-10">
             <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-4 text-secondary neon-border border-secondary/50">
                <Film className="w-8 h-8" />
             </div>
             <p className="text-lg font-medium text-white mb-1 truncate max-w-[80%]">{selectedFile.name}</p>
             <p className="text-sm text-gray-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
             
             <button 
               onClick={(e) => {
                 e.stopPropagation();
                 onFileSelect(null as any);
               }}
               className="absolute top-4 right-4 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full transition-colors"
             >
               <X className="w-5 h-5" />
             </button>
          </div>
        ) : (
          <>
            <div className={`w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${dragActive ? 'text-primary' : 'text-gray-400'}`}>
              <Upload className="w-8 h-8" />
            </div>
            <p className="text-lg font-medium text-white mb-2">
              {dragActive ? "Drop video here" : "Click or drag to upload"}
            </p>
            <p className="text-sm text-gray-500 text-center max-w-xs">
              Upload a clear video of the bowling delivery. <br/>Max size: 100MB
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg text-sm border border-red-500/20">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};

export default VideoUploader;