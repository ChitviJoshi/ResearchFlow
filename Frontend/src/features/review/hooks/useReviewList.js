import { useState, useEffect, useCallback } from "react";
import * as reviewApi from "../services/review.api";
import * as repoApi from "../services/repo.api";

export const useReviewList = (repoId) => {
  const [reviews, setReviews] = useState([]);
  const [repo, setRepo] = useState(null);
  const [paperVersions, setPaperVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const [reviewsRes, repoRes, versionsRes] = await Promise.all([
        reviewApi.getReviewsByRepo(repoId),
        repoApi.getRepoById(repoId),
        repoApi.getVersionsByRepo(repoId),
      ]);
      setReviews(reviewsRes.data.reviewRequests);
      setRepo(repoRes.data.repo);
      setPaperVersions(versionsRes.data.versions.filter((v) => v.type === "paper"));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load review requests");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [repoId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // The create response has bare student/professor ids, so re-read the list
  const createReviewRequest = async (data) => {
    const res = await reviewApi.createReviewRequest(repoId, data);
    await fetchAll({ silent: true });
    return res.data.reviewRequest;
  };

  return { reviews, repo, paperVersions, loading, error, createReviewRequest };
};