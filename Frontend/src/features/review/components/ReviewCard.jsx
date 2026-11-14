import { Link } from "react-router-dom";
import StatusPill from "./StatusPill.jsx";
import { Icon } from "../../../shared/components/icons.jsx";
import { initials, timeAgo } from "../../../shared/utils/format.js";

function ReviewCard({ review }) {
  const rounds = review.thread?.length || 0;

  return (
    <li>
      <Link to={`/reviews/${review._id}`} className="review-row">
        <span className="review-people" aria-hidden="true">
          <span className="avatar sm role-student">{initials(review.student?.name)}</span>
          <Icon name="arrow" size={14} />
          <span className="avatar sm role-professor">{initials(review.professor?.name)}</span>
        </span>

        <span className="review-row-main">
          <span className="review-row-title">
            {review.student?.name} <span>asked</span> {review.professor?.name} <span>to review</span>
          </span>
          <span className="review-row-sub">
            {rounds} {rounds === 1 ? "round" : "rounds"} · Updated {timeAgo(review.updatedAt)}
          </span>
        </span>

        <StatusPill status={review.status} />
        <Icon name="chevronRight" size={18} className="repo-row-go" />
      </Link>
    </li>
  );
}

export default ReviewCard;
