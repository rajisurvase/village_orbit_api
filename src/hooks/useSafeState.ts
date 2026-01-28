/**
 * Safe State Hook
 * Prevents state updates on unmounted components
 */

import { useState, useCallback, useRef, useEffect, Dispatch, SetStateAction } from 'react';

/**
 * A useState that only updates if the component is still mounted
 * Prevents "Can't perform state update on unmounted component" warnings
 */
export function useSafeState<T>(initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(initialValue);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const setSafeState: Dispatch<SetStateAction<T>> = useCallback((value) => {
    if (mountedRef.current) {
      setState(value);
    }
  }, []);

  return [state, setSafeState];
}

/**
 * Hook to check if component is mounted
 */
export function useIsMounted(): () => boolean {
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return useCallback(() => mountedRef.current, []);
}

export default useSafeState;
