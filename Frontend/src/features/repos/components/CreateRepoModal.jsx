import { useState } from "react";

function CreateRepoModal({ isOpen, onClose, onCreate }) {
  const [form, setForm] = useState({ name: "", description: "", isPrivate: true });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Repo name is required");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onCreate(form);
      setForm({ name: "", description: "", isPrivate: true });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create repo");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>New repository</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <label>
            Repository name
            <input type="text" name="name" value={form.name} onChange={handleChange} autoFocus required />
          </label>

          <label>
            Description <span className="optional">(optional)</span>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
          </label>

          <label className="checkbox-row">
            <input type="checkbox" name="isPrivate" checked={form.isPrivate} onChange={handleChange} />
            Private repository
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-accent" disabled={submitting}>
              {submitting ? "Creating..." : "Create repository"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRepoModal;