'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { CollectionDetail } from '../lib/types';

// Define types for filter state
interface FilterState {
  status: string;
  minPrice: string;
  maxPrice: string;
  country: string;
  state: string;
  search: string;
}

// Define the explore page state
interface ExplorePageState {
  onChainCollections: CollectionDetail[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  totalCollections: number;
  viewMode: 'grid' | 'list' | 'map';
  showFilters: boolean;
  filters: FilterState;
  countries: string[];
  states: string[];
  lastUpdated?: number;
}

// Define context methods
interface ExploreStateContextType {
  state: ExplorePageState;
  updateState: (updates: Partial<ExplorePageState>) => void;
  clearState: () => void;
  hasState: () => boolean;
}

// Initial state
const initialState: ExplorePageState = {
  onChainCollections: [],
  loading: true,
  error: null,
  page: 1,
  totalPages: 1,
  totalCollections: 0,
  viewMode: 'grid',
  showFilters: false,
  filters: {
    status: '',
    minPrice: '',
    maxPrice: '',
    country: '',
    state: '',
    search: '',
  },
  countries: [],
  states: [],
};

// Create context
const ExploreStateContext = createContext<ExploreStateContextType | undefined>(undefined);

// Provider component
interface ExploreStateProviderProps {
  children: ReactNode;
}

export const ExploreStateProvider: React.FC<ExploreStateProviderProps> = ({ children }) => {
  const [state, setState] = useState<ExplorePageState>(initialState);
  const stateRef = useRef<ExplorePageState>(state);
  
  // Keep ref in sync with state
  stateRef.current = state;

  const updateState = useCallback((updates: Partial<ExplorePageState>) => {
    setState(prevState => ({
      ...prevState,
      ...updates,
      lastUpdated: Date.now(),
    }));
  }, []);

  const clearState = useCallback(() => {
    setState(initialState);
  }, []);

  const hasState = useCallback(() => {
    // Use ref to get current state without creating dependency on state
    const currentState = stateRef.current;
    return currentState.lastUpdated !== undefined && currentState.onChainCollections.length > 0;
  }, []); // No dependencies - stable across renders

  const value: ExploreStateContextType = {
    state,
    updateState,
    clearState,
    hasState,
  };

  return (
    <ExploreStateContext.Provider value={value}>
      {children}
    </ExploreStateContext.Provider>
  );
};

// Hook to use the context
export const useExploreState = () => {
  const context = useContext(ExploreStateContext);
  if (context === undefined) {
    throw new Error('useExploreState must be used within an ExploreStateProvider');
  }
  return context;
}; 