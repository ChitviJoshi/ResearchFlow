import { useState } from "react";

function CreateReviewModal({ isOpen, onClose, onCreate, repo, paperVersions }) {
  const [versionId, setVersionId] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const professors = repo?.collaborators?.filter((c) => c.user?.role === "professor") || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!versionId || !professorId) {
      setError("Select a draft and a professor");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onCreate({ versionId, professorId, comment });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create review request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>New review request</h2>

        {paperVersions.length === 0 ? (
          <p className="home-status">Upload a paper version first before requesting a review.</p>
        ) : professors.length === 0 ? (
          <p className="home-status">Add a professor as a collaborator on this repo first.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}

            <label>
              Draft to review
              <select value={versionId} onChange={(e) => setVersionId(e.target.value)} required>
                <option value="">Select a version...</option>
                {paperVersions.map((v) => (
                  <option key={v._id} value={v._id}>v{v.versionNumber} — {v.fileName}</option>
                ))}
              </select>
            </label>

            <label>
              Reviewer
              <select value={professorId} onChange={(e) => setProfessorId(e.target.value)} required>
                <option value="">Select a professor...</option>
                {professors.map((c) => (
                  <option key={c.user._id} value={c.user._id}>{c.user.name}</option>
                ))}
              </select>
            </label>

            <label>
              Note <span className="optional">(optional)</span>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Anything you'd like the reviewer to focus on" />
            </label>

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-accent" disabled={submitting}>
                {submitting ? "Sending..." : "Request review"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default CreateReviewModal;