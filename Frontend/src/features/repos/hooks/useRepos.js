import { useState, useEffect, useCallback } from "react";
import * as repoApi from "../services/repo.api";

export const useRepos = () => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // silent = refresh without the full-page loader
  const fetchRepos = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const res = await repoApi.getMyRepos();
      setRepos(res.data.repos);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load repos");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  // The create response has an unpopulated owner, so re-read the list
  const createRepo = async (data) => {
    const res = await repoApi.createRepo(data);
    await fetchRepos({ silent: true });
    return res.data.repo;
  };

  return { repos, loading, error, refetch: fetchRepos, createRepo };
};