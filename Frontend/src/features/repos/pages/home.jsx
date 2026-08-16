// Dashboard: grid/list of the user's repos (like GitHub home), + "New Repo" action
import { useState } from "react";
import { useRepos } from "../hooks/useRepos.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import RepoCard from "../components/RepoCard.jsx";
import CreateRepoModal from "../components/CreateRepoModal.jsx";
import "../style/home.scss";

function Home() {
  const { repos, loading, error, createRepo } = useRepos();
  const { user, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="home-page">
      <header className="home-header">
        <div>
          <p className="auth-eyebrow">ResearchFlow</p>
          <h1>Your repositories</h1>
        </div>
        <div className="home-header-actions">
          <span className="current-user">{user?.name} · {user?.role}</span>
          <button className="btn btn-ghost" onClick={logout}>Log out</button>
          <button className="btn btn-accent" onClick={() => setModalOpen(true)}>New repository</button>
        </div>
      </header>

      {loading && <p className="home-status">Loading repositories...</p>}
      {error && <p className="home-status error">{error}</p>}

      {!loading && !error && repos.length === 0 && (
        <div className="home-empty">
          <p>You don't have any repositories yet.</p>
          <button className="btn btn-accent" onClick={() => setModalOpen(true)}>Create your first repository</button>
        </div>
      )}

      <div className="repo-grid">
        {repos.map((repo) => (
          <RepoCard key={repo._id} repo={repo} currentUserId={user?._id} />
        ))}
      </div>

      <CreateRepoModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onCreate={createRepo} />
    </div>
  );
}

export default Home;