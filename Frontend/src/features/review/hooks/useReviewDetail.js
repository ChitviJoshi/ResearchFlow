import { useState, useEffect, useCallback } from "react";
import * as reviewApi from "../services/review.api";

export const useReviewDetail = (reviewId) => {
  const [reviewRequest, setReviewRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // silent = refresh without the full-page loader, so forms stay mounted
  const fetchReview = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const res = await reviewApi.getReviewById(reviewId);
      setReviewRequest(res.data.reviewRequest);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load review request");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [reviewId]);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  // Mutation responses are not populated, so re-read the full document instead
  const addThreadEntry = async (formData) => {
    await reviewApi.addThreadEntry(reviewId, formData);
    await fetchReview({ silent: true });
  };

  const updateStatus = async (status) => {
    await reviewApi.updateStatus(reviewId, status);
    await fetchReview({ silent: true });
  };

  return { reviewRequest, loading, error, addThreadEntry, updateStatus, refetch: fetchReview };
};