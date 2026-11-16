import { useMemo, useState } from "react";
import SourcePicker from "./SourcePicker.jsx";

/** Every item that is, directly or indirectly, derived from `rootId`. */
function descendantsOf(rootId, versions) {
  const children = new Map();
  versions.forEach((v) =>
    (v.derivedFrom || []).forEach((d) => {
      const key = String(d.version);
      if (!children.has(key)) children.set(key, []);
      children.get(key).push(v._id);
    })
  );
  const seen = new Set();
  const stack = [rootId];
  while (stack.length) {
    const current = stack.pop();
    for (const child of children.get(current) || []) {
      if (!seen.has(child)) {
        seen.add(child);
        stack.push(child);
      }
    }
  }
  return seen;
}

/**
 * "What was this made from?" Mounted only while open, with key={version._id},
 * so the ticked list always starts from the saved links of that item.
 */
function LinkSourcesModal({ version, versions, onClose, onSave }) {
  const links = version.derivedFrom || [];
  const [selected, setSelected] = useState(() =>
    links.filter((d) => d.source === "manual").map((d) => String(d.version))
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const locked = useMemo(
    () => new Set(links.filter((d) => d.source !== "manual").map((d) => String(d.version))),
    [links]
  );
  const blocked = useMemo(() => descendantsOf(version._id, versions), [version._id, versions]);
  const candidates = versions.filter((v) => v._id !== version._id);

  const handleClose = () => {
    if (!submitting) onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const rejected = await onSave(version._id, selected);
      if (rejected.length) {
        const names = rejected.map((id) => versions.find((v) => v._id === id)?.fileName || id).join(", ");
        setError(`These could not be linked: ${names}`);
      } else {
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save the links");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <h2>Where did this come from?</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error" role="alert">{error}</div>}

          <p className="field-hint">
            Tick the items <strong>{version.fileName}</strong> was made from. Links found automatically, from notebooks
            and zip bundles, are locked.
          </p>

          <SourcePicker versions={candidates} selected={selected} onChange={setSelected} locked={locked} blocked={blocked} />

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={handleClose}>Cancel</button>
            <button type="submit" className="btn btn-accent" disabled={submitting}>
              {submitting ? "Saving..." : "Save sources"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LinkSourcesModal;
