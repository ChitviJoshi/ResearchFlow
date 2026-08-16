import { useState } from "react";
import axiosInstance from "../../../shared/utils/axiosInstance";

const TYPE_LABELS = {
  paper: "Paper",
  dataset: "Dataset",
  experiment: "Experiment",
  result: "Result",
};

function VersionCard({ version }) {
  const [downloading, setDownloading] = useState(false);

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
    <div className="version-card">
      <div className="version-card-main">
        <span className={`version-type-badge type-${version.type}`}>
          {TYPE_LABELS[version.type]}
        </span>
        <span className="version-number">v{version.versionNumber}</span>
        <span className="version-filename">{version.fileName}</span>
      </div>
      <div className="version-card-meta">
        <span>{version.uploadedBy?.name}</span>
        <span>{new Date(version.createdAt).toLocaleString()}</span>
      </div>
      {version.notes && <p className="version-notes">{version.notes}</p>}
      <button className="btn btn-ghost btn-sm" onClick={handleDownload} disabled={downloading}>
        {downloading ? "Downloading..." : "Download"}
      </button>
    </div>
  );
}

export default VersionCard;