import { useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

/**
 * Load data on mount and re-fetch when matching panel:update events arrive.
 */
export function useRealtimeData(
  loadFn: () => void,
  resources: string | string[],
  deps: unknown[] = []
) {
  const { subscribe } = useSocket();
  const loadRef = useRef(loadFn);
  loadRef.current = loadFn;

  const resourceKey = Array.isArray(resources) ? resources.join(',') : resources;

  useEffect(() => {
    loadRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    const handler = () => loadRef.current();
    return subscribe(resources, handler);
  }, [subscribe, resourceKey]);
}