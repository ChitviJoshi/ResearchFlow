import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useRepoDetail } from "../hooks/useRepoDetail.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import VersionTimeline from "../components/VersionTimeline.jsx";
import UploadVersionModal from "../components/UploadVersionModal.jsx";
import DeleteRepoModal from "../components/DeleteRepoModal.jsx";
import Breadcrumbs from "../../../shared/components/Breadcrumbs.jsx";
import Skeleton from "../../../shared/components/Skeleton.jsx";
import { Icon, TYPE_META } from "../../../shared/components/icons.jsx";
import * as repoApi from "../services/repo.api";
import "../style/repoDetail.scss";

const TYPES = ["paper", "dataset", "experiment", "result"];

function RepoDetail() {
  const { repoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { repo, versions, loading, error, uploadVersion } = useRepoDetail(repoId);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  if (loading) {
    return (
      <div className="page repo-page">
        <Skeleton count={5} />
      </div>
    );
  }
  if (error) return <div className="page"><p className="home-status error">{error}</p></div>;
  if (!repo) return null;

  const isOwner = repo.owner?._id === user?._id;
  const repoName = repo.name.trim();
  const counts = TYPES.reduce((acc, t) => ({ ...acc, [t]: versions.filter((v) => v.type === t).length }), {});
  const shown = filter === "all" ? versions : versions.filter((v) => v.type === filter);

  const handleDelete = async () => {
    await repoApi.deleteRepo(repoId);
    navigate("/");
  };

  return (
    <div className="page repo-page">
      <Breadcrumbs items={[{ label: "Repositories", to: "/" }, { label: repoName }]} />

      <header className="repo-hero">
        <div className="repo-hero-main">
          <h1>{repoName}</h1>
          {repo.description && <p className="repo-description">{repo.description}</p>}
          <p className="repo-meta">
            Owned by <strong>{repo.owner?.name}</strong>
            <span aria-hidden="true"> · </span>
            {versions.length} {versions.length === 1 ? "version" : "versions"}
            <span aria-hidden="true"> · </span>
            {repo.isPrivate ? "Private" : "Public"}
          </p>
        </div>

        <div className="repo-actions">
          <Link to={`/repos/${repoId}/discussion`} className="btn btn-ghost">
            <Icon name="chat" size={16} /> Discussion
          </Link>
          <Link to={`/repos/${repoId}/reviews`} className="btn btn-ghost">
            <Icon name="review" size={16} /> Reviews
          </Link>
          <button className="btn btn-accent" onClick={() => setUploadOpen(true)}>
            <Icon name="upload" size={16} /> Upload version
          </button>
        </div>
      </header>

      <section className="repo-section" aria-labelledby="history-title">
        <div className="repo-section-head">
          <h2 id="history-title" className="section-title">Version history</h2>

          <div className="filter-chips" role="group" aria-label="Filter by type">
            <button
              type="button"
              className={`filter-chip${filter === "all" ? " active" : ""}`}
              aria-pressed={filter === "all"}
              onClick={() => setFilter("all")}
            >
              All <span>{versions.length}</span>
            </button>
            {TYPES.filter((t) => counts[t] > 0).map((t) => (
              <button
                key={t}
                type="button"
                className={`filter-chip type-${t}${filter === t ? " active" : ""}`}
                aria-pressed={filter === t}
                onClick={() => setFilter(filter === t ? "all" : t)}
              >
                <Icon name={TYPE_META[t].icon} size={13} />
                {TYPE_META[t].plural} <span>{counts[t]}</span>
              </button>
            ))}
          </div>
        </div>

        <VersionTimeline versions={shown} allVersions={versions} />
      </section>

      {isOwner && (
        <section className="danger-zone">
          <div>
            <h2>Delete this repository</h2>
            <p>Removes the repository with all its versions, files, reviews and discussion.</p>
          </div>
          <button className="btn btn-ghost btn-danger-outline" onClick={() => setDeleteOpen(true)}>
            <Icon name="trash" size={15} /> Delete repository
          </button>
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
