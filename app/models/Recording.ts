export interface Recording {
  id: string;
  title: string;
  uri: string;
  duration: number; // in milliseconds
  createdAt: string;
  updatedAt: string;
}

export interface LoopSettings {
  enabled: boolean;
  startTime: number; // in milliseconds
  endTime: number; // in milliseconds
}
