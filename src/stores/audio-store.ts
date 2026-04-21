import { create } from "zustand";

interface AudioState {
  currentBeatId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  audioUrl: string | null;
  seekTo: number | null; // For global player to catch
  isPreview: boolean;

  play: (beatId: string, url: string, isPreview?: boolean) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (time: number) => void;
  clearSeek: () => void;
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
  seekTo: null,
  isPreview: true,

  play: (beatId, url, isPreview = true) => {
    set({
      currentBeatId: beatId,
      audioUrl: url,
      isPlaying: true,
      currentTime: 0,
      duration: 0,
      seekTo: null,
      isPreview,
    });
  },

  pause: () => set({ isPlaying: false }),

  resume: () => {
    if (get().currentBeatId) {
      set({ isPlaying: true });
    }
  },

  seek: (time) => set({ seekTo: time }),
  clearSeek: () => set({ seekTo: null }),

  stop: () =>
    set({
      currentBeatId: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      audioUrl: null,
      seekTo: null,
    }),

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
}));
