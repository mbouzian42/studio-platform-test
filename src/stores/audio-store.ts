import { create } from "zustand";

interface AudioState {
  currentBeatId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  audioUrl: string | null;

  play: (beatId: string, url: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  currentBeatId: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  audioUrl: null,

  play: (beatId, url) => {
    set({
      currentBeatId: beatId,
      audioUrl: url,
      isPlaying: true,
      currentTime: 0,
      duration: 0,
    });
  },

  pause: () => set({ isPlaying: false }),

  resume: () => {
    if (get().currentBeatId) {
      set({ isPlaying: true });
    }
  },

  stop: () =>
    set({
      currentBeatId: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      audioUrl: null,
    }),

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
}));
