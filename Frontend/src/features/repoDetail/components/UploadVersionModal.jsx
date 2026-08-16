import { useState } from "react";

const TYPES = ["paper", "dataset", "experiment", "result"];

function UploadVersionModal({ isOpen, onClose, onUpload }) {
  const [file, setFile] = useState(null);
  const [type, setType] = useState("paper");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      formData.append("notes", notes);
      await onUpload(formData);
      setFile(null);
      setNotes("");
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload file");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Upload new version</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <label>
            File
            <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
          </label>

          <label>
            Type
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </label>

          <label>
            Notes <span className="optional">(optional)</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-accent" disabled={submitting}>
              {submitting ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadVersionModal;
