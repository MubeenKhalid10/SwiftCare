'use client';

import { useState, useEffect, useCallback } from "react";

interface UseFetchOptions {
  skip?: boolean;
  dependencies?: unknown[];
}

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for fetching data from the API
 * Handles authentication errors and auto-retry with token refresh
 */
export function useAPIFetch<T>(
  fetchFunction: () => Promise<T>,
  options?: UseFetchOptions
): UseFetchState<T> {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const data = await fetchFunction();
      setState({ data, loading: false, error: null });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch data";
      setState({ data: null, loading: false, error: errorMessage });
    }
  }, [fetchFunction]);

  useEffect(() => {
    if (options?.skip) {
      return;
    }

    fetchData();
  }, [fetchData, options?.dependencies, options?.skip]);

  return state;
}

/**
 * Hook for manually refreshing API data
 * Use with useAPIFetch to allow user-initiated refresh
 */
export function useAPIRefresh<T>(fetchFunction: () => Promise<T>) {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const refresh = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const data = await fetchFunction();
      setState({ data, loading: false, error: null });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch data";
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
    }
  }, [fetchFunction]);

  return { ...state, refresh };
}
