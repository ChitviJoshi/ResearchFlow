import { useId, useState } from "react";
import LineageView from "./LineageView.jsx";
import { Icon, TYPE_META } from "../../../shared/components/icons.jsx";

/**
 * Evidence block inside a message. For a checked file it says where in the
 * repo that exact file was found (as its own upload, or inside a notebook or
 * zip); every match can open its lineage.
 */
function AttachmentCard({ attachment }) {
  const uid = useId();
  const [openId, setOpenId] = useState(null);
  const isCheck = attachment.kind === "file-check";
  // a match whose version was deleted comes back as null
  const matches = (attachment.matches || []).filter((m) => m.version);
  const found = matches.length > 0;
  const openMatch = matches.find((m) => m.version._id === openId);

  const tone = found ? ` type-${matches[0].version.type}` : isCheck ? " not-found" : "";

  return (
    <div className={`evidence${tone}`}>
      <div className="evidence-head">
        <Icon name={isCheck ? "scan" : "link"} size={14} />
        <span>{isCheck ? "File check" : "From this repository"}</span>
      </div>

      <p className="evidence-file">{attachment.fileName}</p>

      {isCheck && (
        <p className={`evidence-status${found ? "" : " is-missing"}`}>
          {found
            ? `Found in ${matches.length} place${matches.length === 1 ? "" : "s"} in this repository`
            : "Not found in this repository. No uploaded version contains this exact file, so there is nothing to trace."}
        </p>
      )}

      {found && (
        <ul className="match-list">
          {matches.map((m) => {
            const v = m.version;
            const meta = TYPE_META[v.type];
            const open = openId === v._id;
            return (
              <li key={`${v._id}-${m.matchedAs}`} className={`match-row type-${v.type}`}>
                <span className="match-node" aria-hidden="true"><Icon name={meta.icon} size={14} /></span>
                <span className="match-text">
                  <span className="match-name">
                    {v.fileName} <span className="match-ver">v{v.versionNumber}</span>
                  </span>
                  {isCheck && (
                    <span className="match-how">
                      {m.matchedAs === "inside" ? `Contains this file at ${m.insidePath}` : "This exact file"}
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  className="match-toggle"
                  aria-expanded={open}
                  aria-controls={`${uid}-${v._id}`}
                  onClick={() => setOpenId(open ? null : v._id)}
                >
                  Lineage
                  <Icon name="chevron" size={14} className={open ? "is-open" : ""} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {openId && (
        <div className="expand" id={`${uid}-${openId}`}>
          {openMatch?.matchedAs === "inside" && (
            <p className="evidence-status">
              This file only exists inside {openMatch.version.fileName}, so this is the lineage of that item.
            </p>
          )}
          <LineageView versionId={openId} />
        </div>
      )}
    </div>
  );
}

export default AttachmentCard;
