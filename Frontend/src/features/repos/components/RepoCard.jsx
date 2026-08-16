import { Link } from "react-router-dom";

function RepoCard({ repo, currentUserId }) {
  const isOwner = repo.owner._id === currentUserId;

  return (
    <Link to={`/repos/${repo._id}`} className="repo-card">
      <div className="repo-card-header">
        <h3>{repo.name}</h3>
        <span className={`repo-badge ${repo.isPrivate ? "private" : "public"}`}>
          {repo.isPrivate ? "Private" : "Public"}
        </span>
      </div>
      {repo.description && <p className="repo-description">{repo.description}</p>}
      <div className="repo-meta">
        <span>{isOwner ? "Owned by you" : `By ${repo.owner.name}`}</span>
        {repo.collaborators?.length > 0 && (
          <span>{repo.collaborators.length} collaborator{repo.collaborators.length > 1 ? "s" : ""}</span>
        )}
      </div>
    </Link>
  );
}

export default RepoCard;
