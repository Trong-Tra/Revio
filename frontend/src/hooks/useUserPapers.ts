import { useState, useEffect, useCallback } from 'react';
import { userPapersApi, type Paper, type Review } from '../api/client';

export type { Paper, Review };

interface UseUserPapersReturn {
  papers: Paper[];
  reviews: Review[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserPapers(userId: string | undefined): UseUserPapersReturn {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    if (!userId) {
      setPapers([]);
      setReviews([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [papersData, reviewsData] = await Promise.all([
        userPapersApi.getUserPapers(userId),
        userPapersApi.getUserReviews(userId),
      ]);

      setPapers(papersData);
      setReviews(reviewsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return {
    papers,
    reviews,
    loading,
    error,
    refetch: fetchUserData,
  };
}
