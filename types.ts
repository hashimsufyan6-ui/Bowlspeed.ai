export interface AnalysisResult {
  techniqueAnalysis: string;
  recommendations: string[];
}

export interface ManualCalculation {
  releaseTime: number | null;
  impactTime: number | null;
  pitchLengthMeters: number;
  calculatedSpeedKmph: number;
}

export enum FPS {
  FPS_30 = 30,
  FPS_60 = 60,
  FPS_120 = 120,
  FPS_240 = 240,
}

export enum VideoResolution {
  SD = 'SD (480p)',
  HD = 'HD (720p)',
  FHD = 'FHD (1080p)',
  UHD = '4K (UHD)',
}

export enum ProcessingState {
  IDLE = 'IDLE',
  READY = 'READY',
  ANALYZING_TECHNIQUE = 'ANALYZING_TECHNIQUE',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}