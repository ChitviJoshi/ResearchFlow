import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useRepoDetail } from "../hooks/useRepoDetail.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import VersionTimeline from "../components/VersionTimeline.jsx";
import UploadVersionModal from "../components/UploadVersionModal.jsx";
import DeleteRepoModal from "../components/DeleteRepoModal.jsx";
import * as repoApi from "../services/repo.api";
import "../style/repoDetail.scss";

function RepoDetail() {
  const { repoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { repo, versions, loading, error, uploadVersion } = useRepoDetail(repoId);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (loading) return <p className="home-status">Loading repository...</p>;
  if (error) return <p className="home-status error">{error}</p>;
  if (!repo) return null;

  const isOwner = repo.owner?._id === user?._id;

  const handleDelete = async () => {
    await repoApi.deleteRepo(repoId);
    navigate("/");
  };

  return (
    <div className="repo-detail-page">
      <Link to="/" className="back-link">&larr; All repositories</Link>

      <header className="repo-detail-header">
        <div>
          <h1>{repo.name}</h1>
          {repo.description && <p className="repo-description">{repo.description}</p>}
        </div>
        <div className="repo-detail-actions">
          <Link to={`/repos/${repoId}/discussion`} className="btn btn-ghost">Discussion</Link>
          <Link to={`/repos/${repoId}/reviews`} className="btn btn-ghost">Reviews</Link>
          <button className="btn btn-accent" onClick={() => setUploadOpen(true)}>Upload version</button>
        </div>
      </header>

      <section className="repo-detail-section">
        <h2>Version history</h2>
        <VersionTimeline versions={versions} />
      </section>

      {isOwner && (
        <section className="danger-zone">
          <div>
            <h2>Delete this repository</h2>
            <p>Removes the repository with all its versions, files, reviews and discussion.</p>
          </div>
          <button className="btn btn-danger" onClick={() => setDeleteOpen(true)}>Delete repository</button>
        </section>
      )}

      <UploadVersionModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} onUpload={uploadVersion} />
      <DeleteRepoModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        repoName={repo.name}
        versionCount={versions.length}
      />
    </div>
  );
}

export default RepoDetail;