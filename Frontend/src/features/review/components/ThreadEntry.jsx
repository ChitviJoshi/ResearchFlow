import { useState } from "react";
import axiosInstance from "../../../shared/utils/axiosInstance";

function ThreadEntry({ entry }) {
  const [downloading, setDownloading] = useState(false);
  const version = entry.version;

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
    <div className={`thread-entry role-${entry.uploadedByRole}`}>
      <div className="thread-entry-header">
        <span className="thread-entry-role">{entry.uploadedByRole === "student" ? "Student" : "Professor"}</span>
        <span className="thread-entry-date">{new Date(entry.createdAt).toLocaleString()}</span>
      </div>
      {version && (
        <button className="thread-entry-file" onClick={handleDownload} disabled={downloading}>
          {downloading ? "Downloading..." : `📄 ${version.fileName} (v${version.versionNumber})`}
        </button>
      )}
      {entry.comment && <p className="thread-entry-comment">{entry.comment}</p>}
    </div>
  );
}

export default ThreadEntry;