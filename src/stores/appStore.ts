import { create } from 'zustand';
import type { Container, Image, Volume, TabType, ContainerInspect, ContainerStats } from '../types/docker';

interface AppState {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  // Container state
  containers: Container[];
  setContainers: (containers: Container[]) => void;
  selectedContainer: Container | null;
  setSelectedContainer: (container: Container | null) => void;
  containerInspect: ContainerInspect | null;
  setContainerInspect: (inspect: ContainerInspect | null) => void;
  containerStats: ContainerStats | null;
  setContainerStats: (stats: ContainerStats | null) => void;
  containerLogs: string;
  setContainerLogs: (logs: string) => void;
  appendContainerLogs: (log: string) => void;

  // Image state
  images: Image[];
  setImages: (images: Image[]) => void;

  // Volume state
  volumes: Volume[];
  setVolumes: (volumes: Volume[]) => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Error state
  error: string | null;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'containers',
  setActiveTab: (tab) => set({ activeTab: tab, selectedContainer: null }),

  containers: [],
  setContainers: (containers) => set({ containers }),
  selectedContainer: null,
  setSelectedContainer: (container) => set({
    selectedContainer: container,
    containerLogs: '',
    containerInspect: null,
    containerStats: null
  }),
  containerInspect: null,
  setContainerInspect: (inspect) => set({ containerInspect: inspect }),
  containerStats: null,
  setContainerStats: (stats) => set({ containerStats: stats }),
  containerLogs: '',
  setContainerLogs: (logs) => set({ containerLogs: logs }),
  appendContainerLogs: (log) => set((state) => ({
    containerLogs: state.containerLogs + log
  })),

  images: [],
  setImages: (images) => set({ images }),

  volumes: [],
  setVolumes: (volumes) => set({ volumes }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  error: null,
  setError: (error) => set({ error }),
}));
