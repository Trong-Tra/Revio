import { useState, useEffect, useCallback } from 'react';
import { papersApi, searchApi, type Paper } from '../api/client';

interface UsePapersOptions {
  field?: string;
  search?: string;
  page?: number;
  perPage?: number;
}

export function usePapers(options: UsePapersOptions = {}) {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ page: number; perPage: number; total: number } | null>(null);

  const fetchPapers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await searchApi.search({
        q: options.search,
        field: options.field,
        page: options.page,
      });
      
      setPapers(response.data);
      setMeta(response.meta || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch papers');
    } finally {
      setLoading(false);
    }
  }, [options.field, options.search, options.page]);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  return { papers, loading, error, meta, refetch: fetchPapers };
}

export function usePaper(id: string | undefined) {
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchPaper = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await papersApi.get(id);
        setPaper(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch paper');
      } finally {
        setLoading(false);
      }
    };

    fetchPaper();
  }, [id]);

  return { paper, loading, error };
}
