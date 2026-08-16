// Single repo view: version timeline (papers/datasets/experiments/results),
// upload new version, and link to that repo's review requests

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useRepoDetail } from "../hooks/useRepoDetail.js";
import VersionTimeline from "../components/VersionTimeline.jsx";
import UploadVersionModal from "../components/UploadVersionModal.jsx";
import "../style/repoDetail.scss";

function RepoDetail() {
  const { repoId } = useParams();
  const { repo, versions, loading, error, uploadVersion } = useRepoDetail(repoId);
  const [modalOpen, setModalOpen] = useState(false);

  if (loading) return <p className="home-status">Loading repository...</p>;
  if (error) return <p className="home-status error">{error}</p>;
  if (!repo) return null;

  return (
    <div className="repo-detail-page">
      <Link to="/" className="back-link">&larr; All repositories</Link>

      <header className="repo-detail-header">
        <div>
          <h1>{repo.name}</h1>
          {repo.description && <p className="repo-description">{repo.description}</p>}
        </div>
        <button className="btn btn-accent" onClick={() => setModalOpen(true)}>Upload version</button>
      </header>

      <section className="repo-detail-section">
        <h2>Version history</h2>
        <VersionTimeline versions={versions} />
      </section>

      <UploadVersionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onUpload={uploadVersion} />
    </div>
  );
}

export default RepoDetail;