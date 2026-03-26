'use client';

import { useEffect, useState } from 'react';
import { applyPreset, getDefaultPreset } from '@/constants/defaultPresets';

export function useFirstTimeSetup() {
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFirstTime = () => {
      try {
        const hasCompletedOnboarding = localStorage.getItem('onboardingComplete');
        const hasAppliedDefaultPreset = localStorage.getItem('defaultPresetApplied');
        
        if (!hasCompletedOnboarding || !hasAppliedDefaultPreset) {
          // Apply productive preset immediately for first-time users
          const defaultPreset = getDefaultPreset();
          applyPreset(defaultPreset);
          
          // Mark that default preset has been applied
          localStorage.setItem('defaultPresetApplied', 'true');
          
          // If onboarding hasn't been completed, mark that this is first time
          if (!hasCompletedOnboarding) {
            setIsFirstTime(true);
          }
        }
      } catch (error) {
        console.error('Error in first time setup:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkFirstTime();
  }, []);

  const markOnboardingComplete = () => {
    localStorage.setItem('onboardingComplete', 'true');
    setIsFirstTime(false);
  };

  return {
    isFirstTime,
    isLoading,
    markOnboardingComplete
  };
}
