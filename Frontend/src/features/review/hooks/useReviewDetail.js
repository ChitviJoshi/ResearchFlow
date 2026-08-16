import { useState, useEffect, useCallback } from "react";
import * as reviewApi from "../services/review.api";

export const useReviewDetail = (reviewId) => {
  const [reviewRequest, setReviewRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await reviewApi.getReviewById(reviewId);
      setReviewRequest(res.data.reviewRequest);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load review request");
    } finally {
      setLoading(false);
    }
  }, [reviewId]);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  const addThreadEntry = async (formData) => {
    const res = await reviewApi.addThreadEntry(reviewId, formData);
    setReviewRequest(res.data.reviewRequest);
  };

  const updateStatus = async (status) => {
    const res = await reviewApi.updateStatus(reviewId, status);
    setReviewRequest(res.data.reviewRequest);
  };

  return { reviewRequest, loading, error, addThreadEntry, updateStatus, refetch: fetchReview };
};