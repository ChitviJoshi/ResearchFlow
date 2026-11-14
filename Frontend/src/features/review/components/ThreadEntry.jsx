import { useState } from "react";
import axiosInstance from "../../../shared/utils/axiosInstance";
import { Icon } from "../../../shared/components/icons.jsx";

const ACTIONS = { student: "submitted a draft", professor: "returned feedback" };

function ThreadEntry({ entry, who }) {
  const [downloading, setDownloading] = useState(false);
  const version = entry.version;
  const role = entry.uploadedByRole;
  const when = new Date(entry.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

  const handleDownload = async () => {
    if (!version) return;
    setDownloading(true);
    try {
      const res = await axiosInstance.get(`/versions/file/${version.fileId}`, { responseType: "blob" });
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
    <li className={`round role-${role}`}>
      <span className="round-node" aria-hidden="true">
        <Icon name={role === "professor" ? "review" : "upload"} size={16} />
      </span>

      <div className="round-body">
        <div className="round-head">
          <strong>{who || (role === "professor" ? "Professor" : "Student")}</strong>
          <span className="round-action">{ACTIONS[role]}</span>
          <time dateTime={entry.createdAt}>{when}</time>
        </div>

        {version && (
          <button type="button" className="round-file" onClick={handleDownload} disabled={downloading}>
            <Icon name="paper" size={18} />
            <span className="round-file-name">{version.fileName}</span>
            <span className="round-file-ver">v{version.versionNumber}</span>
            <Icon name="download" size={15} className="round-file-dl" />
            <span className="sr-only">{downloading ? "Downloading" : "Download"}</span>
          </button>
        )}

        {entry.comment && <p className="round-comment">{entry.comment}</p>}
      </div>
    </li>
  );
}

export default ThreadEntry;
