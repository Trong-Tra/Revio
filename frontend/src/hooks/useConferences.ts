import { useState, useEffect, useCallback } from 'react';
import { conferenceApi, type Conference } from '../api/client';

export function useConferences() {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await conferenceApi.list();
      setConferences(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conferences');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConferences();
  }, [fetchConferences]);

  return { conferences, loading, error, refetch: fetchConferences };
}

export function useConference(id: string | undefined) {
  const [conference, setConference] = useState<Conference | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchConference = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await conferenceApi.get(id);
        setConference(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch conference');
      } finally {
        setLoading(false);
      }
    };

    fetchConference();
  }, [id]);

  return { conference, loading, error };
}
