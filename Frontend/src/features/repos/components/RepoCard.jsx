import { Link } from "react-router-dom";
import { Icon } from "../../../shared/components/icons.jsx";
import { timeAgo } from "../../../shared/utils/format.js";

function RepoCard({ repo, currentUserId }) {
  const isOwner = repo.owner?._id === currentUserId;
  const people = (repo.collaborators?.length || 0) + 1;

  return (
    <li>
      <Link to={`/repos/${repo._id}`} className="repo-row">
        <span className="repo-row-icon"><Icon name="folder" size={20} /></span>

        <span className="repo-row-main">
          <span className="repo-row-name">{repo.name.trim()}</span>
          {repo.description && <span className="repo-row-desc">{repo.description}</span>}
        </span>

        <span className="repo-row-meta">
          <span className={`role-chip ${isOwner ? "owner" : "shared"}`}>
            {isOwner ? "Owner" : `Shared by ${repo.owner?.name}`}
          </span>
          <span className="repo-row-sub">
            {people} {people === 1 ? "person" : "people"}
            {repo.isPrivate && (
              <>
                {" · "}<Icon name="lock" size={12} className="inline-icon" /> Private
              </>
            )}
            {" · "}Updated {timeAgo(repo.updatedAt)}
          </span>
        </span>

        <Icon name="chevronRight" size={18} className="repo-row-go" />
      </Link>
    </li>
  );
}

export default RepoCard;
