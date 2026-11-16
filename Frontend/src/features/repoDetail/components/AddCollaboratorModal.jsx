import { useState } from "react";

function AddCollaboratorModal({ isOpen, onClose, onAdd, ownEmail }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    if (submitting) return;
    setEmail("");
    setError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!clean) {
      setError("Enter an email address");
      return;
    }
    if (ownEmail && clean === ownEmail.toLowerCase()) {
      setError("That is your own account");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onAdd(clean);
      setEmail("");
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add this person");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add a person</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error" role="alert">{error}</div>}

          <p className="field-hint">
            They need a ResearchFlow account first. A professor you add can be asked to review your papers and can
            join the discussion.
          </p>

          <label>
            Their email address
            <input type="text" inputMode="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={handleClose}>Cancel</button>
            <button type="submit" className="btn btn-accent" disabled={submitting}>
              {submitting ? "Adding..." : "Add person"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCollaboratorModal;
