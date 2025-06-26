'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useExploreState } from '@/context/ExploreStateContext';

export const usePreservedNavigation = () => {
  const router = useRouter();
  const { hasState } = useExploreState();

  const navigateToExplore = useCallback(() => {
    // Always use router.push for programmatic navigation
    // This ensures the ExploreStateContext state is preserved
    router.push('/explore');
  }, [router]);

  const navigateToCollection = useCallback((id: string) => {
    router.push(`/explore/${id}`);
  }, [router]);

  return {
    navigateToExplore,
    navigateToCollection,
    hasPreservedState: hasState(),
  };
}; 