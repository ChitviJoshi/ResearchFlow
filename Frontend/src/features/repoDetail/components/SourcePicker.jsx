import { useMemo, useState } from "react";
import { Icon, TYPE_META } from "../../../shared/components/icons.jsx";

const ORDER = ["dataset", "experiment", "result", "paper"];
const NONE = new Set();

/**
 * Checklist of items in the repository, grouped by type.
 * - `selected`: ids ticked by hand
 * - `locked`: ids linked automatically (shown ticked, cannot be changed)
 * - `blocked`: ids that cannot be chosen because that would create a loop
 */
function SourcePicker({ versions, selected, onChange, locked = NONE, blocked = NONE }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const groups = useMemo(
    () =>
      ORDER.map((type) => ({
        type,
        items: versions.filter((v) => v.type === type && (!q || v.fileName.toLowerCase().includes(q))),
      })).filter((g) => g.items.length > 0),
    [versions, q]
  );

  const toggle = (id) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  if (versions.length === 0) {
    return <p className="source-empty">Nothing else in this repository yet.</p>;
  }

  return (
    <div className="source-picker">
      {versions.length > 6 && (
        <input
          type="text"
          className="source-search"
          value={query}
          placeholder="Filter by file name"
          aria-label="Filter items by file name"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
        />
      )}

      <div className="source-groups">
        {groups.length === 0 && <p className="source-empty">Nothing matches that name.</p>}
        {groups.map((g) => (
          <fieldset key={g.type} className="source-group">
            <legend>{TYPE_META[g.type].plural}</legend>
            {g.items.map((v) => {
              const isLocked = locked.has(v._id);
              const isBlocked = blocked.has(v._id);
              return (
                <label key={v._id} className={`source-row type-${v.type}${isBlocked ? " is-blocked" : ""}`}>
                  <input
                    type="checkbox"
                    checked={isLocked || selected.includes(v._id)}
                    disabled={isLocked || isBlocked}
                    onChange={() => toggle(v._id)}
                  />
                  <span className="source-node" aria-hidden="true"><Icon name={TYPE_META[v.type].icon} size={13} /></span>
                  <span className="source-name">
                    {v.fileName} <span className="source-ver">v{v.versionNumber}</span>
                  </span>
                  {isLocked && <span className="source-tag">found automatically</span>}
                  {isBlocked && <span className="source-tag">would create a loop</span>}
                </label>
              );
            })}
          </fieldset>
        ))}
      </div>
    </div>
  );
}

export default SourcePicker;
