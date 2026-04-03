/**
 * useBackgroundTasks.ts — expo-task-manager background task management.
 *
 * Provides utilities to check registration status of background tasks.
 * Actual task definitions live in their respective service files.
 */
import { useCallback, useEffect, useState } from 'react';
import * as TaskManager from 'expo-task-manager';
import { GEO_TASK_NAME } from '@/utils/constants';

export interface BackgroundTaskState {
  geoTaskRegistered: boolean;
}

/**
 * Hook to inspect and manage background task registration state.
 */
export const useBackgroundTasks = (): BackgroundTaskState => {
  const [geoTaskRegistered, setGeoTaskRegistered] = useState(false);

  const checkRegistrations = useCallback(async () => {
    const geoReg = await TaskManager.isTaskRegisteredAsync(GEO_TASK_NAME).catch(() => false);
    setGeoTaskRegistered(geoReg);
  }, []);

  useEffect(() => {
    checkRegistrations();
    const interval = setInterval(checkRegistrations, 10000);
    return () => clearInterval(interval);
  }, [checkRegistrations]);

  return { geoTaskRegistered };
};
