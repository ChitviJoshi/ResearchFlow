import { useState, useEffect, useCallback, useRef } from "react";
import * as chatApi from "../services/chat.api";

const POLL_MS = 10000;

/**
 * Loads a repo's discussion and keeps it fresh: new messages are fetched
 * every 10 seconds while the tab is visible. Sending appends the saved
 * message straight away, so it never waits for the next refresh.
 */
export const useChat = (repoId) => {
  const [repo, setRepo] = useState(null);
  const [versions, setVersions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const busy = useRef(false); // a refresh is already running
  const sentCount = useRef(0); // bumps on every send, so an older refresh can't overwrite a new message

  const refreshMessages = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    const startedAt = sentCount.current;
    try {
      const res = await chatApi.getMessages(repoId);
      if (startedAt === sentCount.current) setMessages(res.data.messages);
    } catch {
      // keep what is on screen; the next refresh tries again
    } finally {
      busy.current = false;
    }
  }, [repoId]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [repoRes, versionsRes, reviewsRes, messagesRes] = await Promise.all([
          chatApi.getRepoById(repoId),
          chatApi.getVersionsByRepo(repoId),
          chatApi.getReviewsByRepo(repoId),
          chatApi.getMessages(repoId),
        ]);
        if (cancelled) return;
        setRepo(repoRes.data.repo);
        setVersions(versionsRes.data.versions);
        setReviews(reviewsRes.data.reviewRequests);
        setMessages(messagesRes.data.messages);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Failed to load the discussion");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [repoId]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!document.hidden) refreshMessages();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [refreshMessages]);

  const sendMessage = async (formData) => {
    const res = await chatApi.postMessage(repoId, formData);
    sentCount.current += 1;
    const saved = res.data.message;
    setMessages((prev) => (prev.some((m) => m._id === saved._id) ? prev : [...prev, saved]));
  };

  return { repo, versions, reviews, messages, loading, error, sendMessage };
};