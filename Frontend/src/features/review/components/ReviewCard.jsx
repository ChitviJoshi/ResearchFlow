import { Link } from "react-router-dom";

const STATUS_LABELS = {
  open: "Open",
  approved: "Approved",
  changes_requested: "Changes requested",
};

function ReviewCard({ review }) {
  return (
    <Link to={`/reviews/${review._id}`} className="review-card">
      <div className="review-card-top">
        <span className={`review-status status-${review.status}`}>{STATUS_LABELS[review.status]}</span>
        <span className="review-round-count">{review.thread?.length || 0} round{review.thread?.length !== 1 ? "s" : ""}</span>
      </div>
      <p className="review-participants">{review.student?.name} &rarr; {review.professor?.name}</p>
      <p className="review-updated">Updated {new Date(review.updatedAt).toLocaleDateString()}</p>
    </Link>
  );
}

export default ReviewCard;