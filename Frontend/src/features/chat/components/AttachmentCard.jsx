import { useState } from "react";
import LineageView from "./LineageView.jsx";

const TYPE_LABELS = { paper: "Paper", dataset: "Dataset", experiment: "Experiment", result: "Result" };

/**
 * Shows what a message points at. For a checked file it says where in the
 * repo that exact file was found (as its own upload, or inside a notebook
 * or zip), and every match can open its lineage.
 */
function AttachmentCard({ attachment }) {
  const [openId, setOpenId] = useState(null);
  const isCheck = attachment.kind === "file-check";
  // a match whose version was deleted comes back as null
  const matches = (attachment.matches || []).filter((m) => m.version);
  const openMatch = matches.find((m) => m.version._id === openId);

  return (
    <div className="attachment">
      <p className="attachment-title">
        {isCheck ? "File checked against this repository" : "Attached from this repository"}
      </p>
      <p className="attachment-file">{attachment.fileName}</p>

      {isCheck && matches.length === 0 && (
        <p className="attachment-note not-found">
          Not found in this repository. No uploaded version contains this exact file, so there is nothing to trace.
        </p>
      )}

      {matches.length > 0 && (
        <ul className="match-list">
          {matches.map((m) => {
            const v = m.version;
            const open = openId === v._id;
            return (
              <li key={`${v._id}-${m.matchedAs}`} className="match-row">
                <span className={`version-type-badge type-${v.type}`}>{TYPE_LABELS[v.type]}</span>
                <span>{v.fileName} v{v.versionNumber}</span>
                {isCheck && (
                  <span className="match-how">
                    {m.matchedAs === "inside" ? `contains this file (${m.insidePath})` : "this exact file"}
                  </span>
                )}
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setOpenId(open ? null : v._id)}
                >
                  {open ? "Hide lineage" : "Show lineage"}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {openMatch?.matchedAs === "inside" && (
        <p className="attachment-note">
          This file only exists inside {openMatch.version.fileName}, so this is the lineage of that item.
        </p>
      )}
      {openId && <LineageView versionId={openId} />}
    </div>
  );
}

export default AttachmentCard;