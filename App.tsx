import React, { useState, useMemo } from 'react';
import { Activity, Zap, CheckCircle2, RotateCcw, Calculator, ArrowRight, BrainCircuit } from 'lucide-react';
import VideoUploader from './components/VideoUploader';
import SpeedGauge from './components/SpeedGauge';
import AnalysisPlayer from './components/AnalysisPlayer';
import { FPS, VideoResolution, ProcessingState, ManualCalculation } from './types';
import { analyzeVideo } from './services/geminiService';

const App: React.FC = () => {
  // Configuration State
  const [fps, setFps] = useState<number>(FPS.FPS_60);
  const [resolution, setResolution] = useState<VideoResolution>(VideoResolution.FHD);
  
  // File State
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  // App Workflow State
  const [viewState, setViewState] = useState<'UPLOAD' | 'ANALYZE'>('UPLOAD');
  const [aiStatus, setAiStatus] = useState<ProcessingState>(ProcessingState.IDLE);
  const [techniqueReport, setTechniqueReport] = useState<{analysis: string, tips: string[]} | null>(null);

  // Calculation State
  const [releaseTime, setReleaseTime] = useState<number | null>(null);
  const [impactTime, setImpactTime] = useState<number | null>(null);
  const [pitchLength, setPitchLength] = useState<number>(18.5); // Default to generic length

  // Derived Calculation
  const calculation = useMemo<ManualCalculation>(() => {
    if (releaseTime !== null && impactTime !== null && impactTime > releaseTime) {
      const timeDiffSeconds = impactTime - releaseTime;
      const speedMps = pitchLength / timeDiffSeconds;
      const speedKmph = speedMps * 3.6;
      return {
        releaseTime,
        impactTime,
        pitchLengthMeters: pitchLength,
        calculatedSpeedKmph: isFinite(speedKmph) ? speedKmph : 0
      };
    }
    return {
      releaseTime,
      impactTime,
      pitchLengthMeters: pitchLength,
      calculatedSpeedKmph: 0
    };
  }, [releaseTime, impactTime, pitchLength]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setVideoUrl(url);
    setViewState('ANALYZE');
    // Reset Analysis
    setReleaseTime(null);
    setImpactTime(null);
    setTechniqueReport(null);
    setAiStatus(ProcessingState.IDLE);
  };

  const resetUpload = () => {
    setFile(null);
    setVideoUrl(null);
    setViewState('UPLOAD');
  };

  const triggerTechniqueAnalysis = async () => {
    if (!file) return;
    setAiStatus(ProcessingState.ANALYZING_TECHNIQUE);
    try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
             const base64 = (reader.result as string).split(',')[1];
             const result = await analyzeVideo(base64, file.type, fps, resolution);
             setTechniqueReport({
                analysis: result.techniqueAnalysis,
                tips: result.recommendations
             });
             setAiStatus(ProcessingState.COMPLETED);
        };
    } catch (e) {
        console.error(e);
        setAiStatus(ProcessingState.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 font-sans">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Compact Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              BowlSpeed <span className="text-primary">PRO</span>
            </h1>
            <p className="text-sm text-gray-500">Precision Manual Analysis Tool</p>
          </div>
          {viewState === 'ANALYZE' && (
             <button 
               onClick={resetUpload}
               className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors"
             >
               <RotateCcw className="w-4 h-4" />
               New Analysis
             </button>
          )}
        </div>

        {viewState === 'UPLOAD' ? (
             <div className="max-w-2xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-8">
                 <div className="glass-panel p-8 rounded-2xl">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-display">1</span>
                        Start Session
                    </h2>
                    <VideoUploader 
                        onFileSelect={handleFileSelect}
                        selectedFile={file}
                        fps={fps}
                        onFpsChange={setFps}
                        resolution={resolution}
                        onResolutionChange={setResolution}
                        disabled={false}
                    />
                 </div>
             </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in zoom-in-95">
                
                {/* Left Column: Player & Controls */}
                <div className="lg:col-span-7 space-y-6">
                    {videoUrl && (
                        <AnalysisPlayer 
                            videoUrl={videoUrl}
                            fps={fps}
                            onTimeUpdate={() => {}}
                            onMarkRelease={setReleaseTime}
                            onMarkImpact={setImpactTime}
                            releaseTime={releaseTime}
                            impactTime={impactTime}
                        />
                    )}

                    {/* Manual Parameter Inputs */}
                    <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-primary">
                        <div className="flex items-center gap-2 mb-4 text-primary">
                            <Calculator className="w-5 h-5" />
                            <h3 className="font-semibold">Physics Parameters</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Estimated Distance (Meters)</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        value={pitchLength}
                                        onChange={(e) => setPitchLength(parseFloat(e.target.value))}
                                        step="0.1"
                                        className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white font-mono w-full focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <button onClick={() => setPitchLength(9.0)} className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-gray-400">Short (9m)</button>
                                    <button onClick={() => setPitchLength(15.0)} className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-gray-400">Good (15m)</button>
                                    <button onClick={() => setPitchLength(18.5)} className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-gray-400">Full (18.5m)</button>
                                </div>
                             </div>

                             <div className="space-y-2">
                                <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Measured Time (Seconds)</label>
                                <div className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-gray-300 font-mono w-full">
                                    {(releaseTime !== null && impactTime !== null) 
                                        ? (impactTime - releaseTime).toFixed(3) + 's' 
                                        : '--.--s'}
                                </div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Results */}
                <div className="lg:col-span-5 space-y-6">
                    
                    {/* Main Gauge */}
                    <div className="glass-panel rounded-2xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                        <h3 className="text-center text-gray-400 text-sm uppercase tracking-widest font-semibold mb-6">Calculated Speed</h3>
                        <div className="flex justify-center mb-6">
                            <SpeedGauge speed={calculation.calculatedSpeedKmph} unit="KPH" />
                        </div>
                        
                        <div className="flex justify-center gap-8 border-t border-white/5 pt-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold font-display text-white">
                                    {(calculation.calculatedSpeedKmph * 0.621371).toFixed(1)}
                                </div>
                                <div className="text-xs text-gray-500 font-bold uppercase">MPH</div>
                            </div>
                            <div className="w-px bg-white/10" />
                            <div className="text-center">
                                <div className="text-2xl font-bold font-display text-white">
                                    {calculation.calculatedSpeedKmph.toFixed(1)}
                                </div>
                                <div className="text-xs text-gray-500 font-bold uppercase">KPH</div>
                            </div>
                        </div>
                    </div>

                    {/* AI Technique Section */}
                    <div className="glass-panel p-6 rounded-2xl">
                         <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <BrainCircuit className="w-5 h-5 text-secondary" />
                                AI Technique Coach
                            </h3>
                            {aiStatus === ProcessingState.IDLE && (
                                <button 
                                    onClick={triggerTechniqueAnalysis}
                                    className="text-xs bg-secondary/20 hover:bg-secondary/30 text-secondary px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                                >
                                    Analyze Form <ArrowRight className="w-3 h-3" />
                                </button>
                            )}
                         </div>

                         {aiStatus === ProcessingState.ANALYZING_TECHNIQUE && (
                             <div className="flex flex-col items-center justify-center py-8 text-gray-400 space-y-3">
                                 <Activity className="w-8 h-8 animate-spin text-secondary" />
                                 <span className="text-sm">Analyzing biomechanics...</span>
                             </div>
                         )}

                         {techniqueReport && (
                             <div className="space-y-4 animate-in fade-in">
                                 <p className="text-sm text-gray-300 leading-relaxed">
                                     {techniqueReport.analysis}
                                 </p>
                                 <div className="space-y-2">
                                     {techniqueReport.tips.map((tip, i) => (
                                         <div key={i} className="flex items-start gap-2 text-xs text-gray-400 bg-white/5 p-2 rounded">
                                             <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5" />
                                             {tip}
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         )}
                         
                         {aiStatus === ProcessingState.ERROR && (
                             <div className="text-red-400 text-xs bg-red-500/10 p-3 rounded">
                                 Could not analyze technique. Please try again.
                             </div>
                         )}
                    </div>

                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default App;