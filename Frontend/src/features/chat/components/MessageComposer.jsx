import { useRef, useState } from "react";

const TYPE_ORDER = ["paper", "dataset", "experiment", "result"];
const TYPE_LABELS = { paper: "Papers", dataset: "Datasets", experiment: "Experiments", result: "Results" };
const STATUS_LABELS = { open: "open", approved: "approved", changes_requested: "changes requested" };

function MessageComposer({ versions, reviews, onSend }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [versionId, setVersionId] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [reviewId, setReviewId] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const fileInput = useRef(null);

  const pickedVersion = versions.find((v) => v._id === versionId);
  const canSend = !sending && Boolean(text.trim() || file || versionId);

  const resetFileInput = () => {
    if (fileInput.current) fileInput.current.value = "";
  };

  const chooseFile = (e) => {
    const chosen = e.target.files[0];
    if (!chosen) return;
    setFile(chosen);
    setVersionId("");
    setShowPicker(false);
  };

  const chooseVersion = (e) => {
    setVersionId(e.target.value);
    if (e.target.value) {
      setFile(null);
      resetFileInput();
    }
  };

  const clearAttachment = () => {
    setFile(null);
    setVersionId("");
    resetFileInput();
  };

  const submit = async () => {
    if (!canSend) return;
    setError("");
    setSending(true);
    try {
      const formData = new FormData();
      formData.append("body", text.trim());
      if (file) formData.append("file", file);
      if (versionId) formData.append("versionId", versionId);
      if (reviewId) formData.append("reviewRequestId", reviewId);
      await onSend(formData);
      setText("");
      setReviewId("");
      setShowPicker(false);
      clearAttachment();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send the message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    // Enter sends, Shift+Enter adds a new line
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form
      className="composer"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {error && <div className="auth-error">{error}</div>}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={2}
        maxLength={2000}
        placeholder="Write a message..."
      />

      {(file || pickedVersion) && (
        <div className="composer-chip">
          <span>{file ? file.name : `${pickedVersion.fileName} (v${pickedVersion.versionNumber})`}</span>
          <button type="button" onClick={clearAttachment} aria-label="Remove attachment">&times;</button>
        </div>
      )}
      {file && (
        <p className="composer-hint">
          This file is compared with what is already in the repository. It is not uploaded.
        </p>
      )}

      <div className="composer-row">
        <input ref={fileInput} type="file" hidden onChange={chooseFile} />
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileInput.current.click()}>
          Check a file
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setShowPicker((s) => !s)}
          disabled={versions.length === 0}
        >
          Pick from repo
        </button>

        {showPicker && (
          <select value={versionId} onChange={chooseVersion} aria-label="Pick an item from this repository">
            <option value="">Choose an item...</option>
            {TYPE_ORDER.map((type) => {
              const group = versions.filter((v) => v.type === type);
              if (group.length === 0) return null;
              return (
                <optgroup key={type} label={TYPE_LABELS[type]}>
                  {group.map((v) => (
                    <option key={v._id} value={v._id}>v{v.versionNumber} - {v.fileName}</option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        )}

        {reviews.length > 0 && (
          <select value={reviewId} onChange={(e) => setReviewId(e.target.value)} aria-label="Link to a review">
            <option value="">Not linked to a review</option>
            {reviews.map((r) => (
              <option key={r._id} value={r._id}>
                Review: {r.student?.name} &amp; {r.professor?.name} ({STATUS_LABELS[r.status]})
              </option>
            ))}
          </select>
        )}

        <button type="submit" className="btn btn-accent composer-send" disabled={!canSend}>
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
}

export default MessageComposer;