import { useState } from "react";
import axiosInstance from "../../../shared/utils/axiosInstance";
import { Icon, TYPE_META } from "../../../shared/components/icons.jsx";
import { timeOfDay } from "../../../shared/utils/format.js";

/**
 * One entry on the version timeline: a coloured node on the spine plus its details.
 * `sources` is a list of { item, source, reason }: what this version was derived from.
 */
function VersionCard({ version, isLatest, sources = [], onLinkSources }) {
  const [downloading, setDownloading] = useState(false);
  const meta = TYPE_META[version.type];

  /**
   * Downloads use axiosInstance (not a plain <a href>) so the JWT
   * interceptor attaches automatically, then we turn the response
   * into a blob the browser can save/open.
   */
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await axiosInstance.get(`/versions/file/${version.fileId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = version.fileName;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download file");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <li className={`tl-item type-${version.type}${isLatest ? " is-latest" : ""}`}>
      <span className="tl-node" aria-hidden="true">
        <Icon name={meta.icon} size={16} />
      </span>

      <div className="tl-body">
        <div className="tl-title">
          <span className="tl-name">{version.fileName}</span>
          <span className={`version-type-badge type-${version.type} tl-type-chip`}>{meta.label}</span>
          <span className="tl-version">v{version.versionNumber}</span>
          {isLatest && <span className="tl-latest">Latest</span>}
        </div>

        <p className="tl-meta">
          Uploaded by {version.uploadedBy?.name || "unknown"} · {timeOfDay(version.createdAt)}
        </p>

        {version.notes && <p className="tl-notes">{version.notes}</p>}

        {sources.length > 0 && (
          <p className="tl-derived">
            <Icon name="link" size={13} />
            <span>Derived from</span>
            {sources.map((s) => (
              <span
                key={s.item._id}
                className={`tl-source type-${s.item.type}${s.source === "manual" ? " is-manual" : ""}`}
                title={s.source === "manual" ? "Linked by hand" : "Found automatically"}
              >
                {s.item.fileName}
              </span>
            ))}
          </p>
        )}
      </div>

      <div className="tl-actions">
        {onLinkSources && (
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={() => onLinkSources(version)}
            aria-label={`Edit sources of ${version.fileName}`}
            title="Edit sources"
          >
            <Icon name="link" size={16} />
          </button>
        )}
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          onClick={handleDownload}
          disabled={downloading}
          aria-label={`Download ${version.fileName}`}
          title="Download"
        >
          <Icon name="download" size={16} />
        </button>
      </div>
    </li>
  );
}

export default VersionCard;
