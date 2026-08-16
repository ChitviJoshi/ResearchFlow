// Fetches the logged-in user's repo list for the dashboard
import { useState, useEffect, useCallback } from "react";
import * as repoApi from "../services/repo.api";

/**
 * Fetches the logged-in user's repos (owned + collaborator) and exposes
 * a refetch function + createRepo, so the dashboard can update instantly
 * after creating a new repo without a full page reload.
 */
export const useRepos = () => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRepos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await repoApi.getMyRepos();
      setRepos(res.data.repos);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load repos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  const createRepo = async (data) => {
    const res = await repoApi.createRepo(data);
    setRepos((prev) => [res.data.repo, ...prev]);
    return res.data.repo;
  };

  return { repos, loading, error, refetch: fetchRepos, createRepo };
};