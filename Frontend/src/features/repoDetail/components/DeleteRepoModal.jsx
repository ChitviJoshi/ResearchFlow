import { useState } from "react";

/**
 * GitHub-style confirmation: the delete button only unlocks once the
 * repository name has been typed out.
 */
function DeleteRepoModal({ isOpen, onClose, onConfirm, repoName, versionCount }) {
  const [typed, setTyped] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const name = repoName.trim();
  const canDelete = typed.trim() === name && !submitting;

  const handleClose = () => {
    if (submitting) return;
    setTyped("");
    setError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canDelete) return;
    setError("");
    setSubmitting(true);
    try {
      await onConfirm(); // the page navigates away on success
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete the repository");
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Delete this repository?</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <p className="delete-warning">
            This permanently deletes <strong>{name}</strong>, its {versionCount} stored
            version{versionCount === 1 ? "" : "s"} and files, every review request and the whole
            discussion. It cannot be undone.
          </p>

          <label>
            Type <strong>{name}</strong> to confirm
            <input type="text" value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus />
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={handleClose}>Cancel</button>
            <button type="submit" className="btn btn-danger" disabled={!canDelete}>
              {submitting ? "Deleting..." : "Delete repository"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DeleteRepoModal;