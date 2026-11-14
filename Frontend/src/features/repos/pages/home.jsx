import { useState } from "react";
import { useRepos } from "../hooks/useRepos.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import RepoCard from "../components/RepoCard.jsx";
import CreateRepoModal from "../components/CreateRepoModal.jsx";
import Skeleton from "../../../shared/components/Skeleton.jsx";
import { Icon } from "../../../shared/components/icons.jsx";
import "../style/home.scss";

function EmptyArt() {
  return (
    <svg className="empty-art" viewBox="0 0 150 96" fill="none" aria-hidden="true">
      <path d="M32 30 C 54 30, 54 66, 76 66 S 98 30, 118 30" stroke="#CBC2AC" strokeWidth="1.6" strokeDasharray="4 4" strokeLinecap="round" />
      <rect x="6" y="16" width="50" height="28" rx="9" fill="#F1EAD9" stroke="#8A6D3B" strokeWidth="1.3" />
      <rect x="50" y="52" width="50" height="28" rx="9" fill="#E1EAF0" stroke="#3D6A87" strokeWidth="1.3" />
      <rect x="94" y="16" width="50" height="28" rx="9" fill="#F4E4DD" stroke="#A15A3D" strokeWidth="1.3" />
    </svg>
  );
}

function Home() {
  const { repos, loading, error, createRepo } = useRepos();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const owned = repos.filter((r) => r.owner?._id === user?._id).length;
  const shared = repos.length - owned;
  const firstName = user?.name?.trim().split(/\s+/)[0];

  return (
    <div className="page home-page">
      <header className="page-head">
        <div>
          <p className="eyebrow">{firstName ? `Welcome back, ${firstName}` : "Welcome back"}</p>
          <h1>Your repositories</h1>
          {!loading && !error && repos.length > 0 && (
            <p className="page-sub">
              {repos.length} {repos.length === 1 ? "repository" : "repositories"}
              {owned > 0 && ` · ${owned} yours`}
              {shared > 0 && ` · ${shared} shared with you`}
            </p>
          )}
        </div>
        <button className="btn btn-accent" onClick={() => setModalOpen(true)}>
          <Icon name="plus" size={16} /> New repository
        </button>
      </header>

      {loading && <Skeleton count={4} />}
      {error && <p className="home-status error">{error}</p>}

      {!loading && !error && repos.length === 0 && (
        <div className="empty-state">
          <EmptyArt />
          <h2>Nothing here yet</h2>
          <p>A repository keeps your datasets, experiments, results and papers together, with every version.</p>
          <button className="btn btn-accent" onClick={() => setModalOpen(true)}>Create your first repository</button>
        </div>
      )}

      {repos.length > 0 && (
        <ul className="repo-list">
          {repos.map((repo) => (
            <RepoCard key={repo._id} repo={repo} currentUserId={user?._id} />
          ))}
        </ul>
      )}

      <CreateRepoModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onCreate={createRepo} />
    </div>
  );
}

export default Home;
