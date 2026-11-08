// Given: loads the library from the server and lets components reload it after a change.
import { useCallback, useEffect, useState } from 'react';
import type { Library } from '@memory-vault/shared';
import type { ApiClient } from '../api/client';

export function useLibrary(client: ApiClient) {
  const [library, setLibrary] = useState<Library>({ media: [], series: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    try {
      setLibrary(await client.request<Library>('/api/library'));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the library');
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { library, loading, error, reload };
}
