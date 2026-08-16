// Fetches review requests for a repo, or a single review thread by id
import { useState, useEffect, useCallback } from "react";
import * as reviewApi from "../services/review.api";
import * as repoApi from "../services/repo.api";

/**
 * Fetches review requests for a repo, plus the data needed to open a
 * new one: the repo's collaborators (candidate professors) and its
 * paper-type versions (candidate drafts to attach).
 */
export const useReviewList = (repoId) => {
  const [reviews, setReviews] = useState([]);
  const [repo, setRepo] = useState(null);
  const [paperVersions, setPaperVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
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
      setLoading(false);
    }
  }, [repoId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createReviewRequest = async (data) => {
    const res = await reviewApi.createReviewRequest(repoId, data);
    setReviews((prev) => [res.data.reviewRequest, ...prev]);
    return res.data.reviewRequest;
  };

  return { reviews, repo, paperVersions, loading, error, createReviewRequest };
};