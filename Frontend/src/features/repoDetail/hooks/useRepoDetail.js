// Fetches a single repo + its version timeline
import { useState, useEffect, useCallback } from "react";
import * as versionApi from "../services/version.api";
import * as repoApi from "../services/repo.api";

/**
 * Fetches a single repo's details plus its full version timeline.
 * Exposes uploadVersion so the UI can add a new version and see it
 * appear immediately without a manual refetch.
 */
export const useRepoDetail = (repoId) => {
  const [repo, setRepo] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [repoRes, versionsRes] = await Promise.all([
        repoApi.getRepoById(repoId),
        versionApi.getVersionsByRepo(repoId),
      ]);
      setRepo(repoRes.data.repo);
      setVersions(versionsRes.data.versions);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load repo");
    } finally {
      setLoading(false);
    }
  }, [repoId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const uploadVersion = async (formData) => {
    const res = await versionApi.uploadVersion(repoId, formData);
    setVersions((prev) => [res.data.version, ...prev]);
    return res.data.version;
  };

  return { repo, versions, loading, error, uploadVersion, refetch: fetchAll };
};