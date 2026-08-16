import { useState } from "react";

function AddRoundForm({ onSubmit }) {
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Select a file to upload");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("comment", comment);
      await onSubmit(formData);
      setFile(null);
      setComment("");
      e.target.reset();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add round");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="add-round-form" onSubmit={handleSubmit}>
      <h3>Add a new round</h3>
      {error && <div className="auth-error">{error}</div>}
      <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder="e.g. Revise section 3, check citations in section 5"
      />
      <button type="submit" className="btn btn-accent" disabled={submitting}>
        {submitting ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}

export default AddRoundForm;