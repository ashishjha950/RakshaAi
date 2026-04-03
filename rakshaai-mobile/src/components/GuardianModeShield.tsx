/**
 * GuardianModeShield.tsx — Context-aware wrapper that collapses nav in stealth mode.
 * Wraps children and hides them behind DisguiseModeScreen when guardian mode is active.
 * This component is used at the navigation root level.
 */
import React from 'react';
import { useSafety } from '@/context/SafetyContext';

interface Props {
  children: React.ReactNode;
}

export const GuardianModeShield: React.FC<Props> = ({ children }) => {
  // Navigation-level guardian mode is handled by RootNavigator.
  // This shield is a pass-through — RootNavigator does the conditional rendering.
  const { isGuardianMode } = useSafety();

  if (isGuardianMode) {
    // DisguiseModeScreen is rendered directly by RootNavigator — nothing here
    return null;
  }

  return <>{children}</>;
};
