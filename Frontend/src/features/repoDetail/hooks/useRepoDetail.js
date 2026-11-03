import { useState, useEffect, useCallback } from "react";
import * as versionApi from "../services/version.api";
import * as repoApi from "../services/repo.api";

export const useRepoDetail = (repoId) => {
  const [repo, setRepo] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
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
      if (!silent) setLoading(false);
    }
  }, [repoId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // The upload response has an unpopulated uploadedBy, so re-read the list.
  // Returns { version, duplicates, autoLinks } for the lineage UI later.
  const uploadVersion = async (formData) => {
    const res = await versionApi.uploadVersion(repoId, formData);
    await fetchAll({ silent: true });
    return res.data;
  };

  return { repo, versions, loading, error, uploadVersion, refetch: fetchAll };
};