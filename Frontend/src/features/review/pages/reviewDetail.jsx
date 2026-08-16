// Single review request: thread of student uploads + professor annotated re-uploads,
// status control (approve / request changes) for the professor
import { useParams, Link } from "react-router-dom";
import { useReviewDetail } from "../hooks/useReviewDetail.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import ReviewThread from "../components/ReviewThread.jsx";
import AddRoundForm from "../components/AddRoundForm.jsx";
import "../style/review.scss";

const STATUS_LABELS = {
  open: "Open",
  approved: "Approved",
  changes_requested: "Changes requested",
};

function ReviewDetail() {
  const { reviewId } = useParams();
  const { user } = useAuth();
  const { reviewRequest, loading, error, addThreadEntry, updateStatus } = useReviewDetail(reviewId);

  if (loading) return <p className="home-status">Loading review request...</p>;
  if (error) return <p className="home-status error">{error}</p>;
  if (!reviewRequest) return null;

  const isProfessor = reviewRequest.professor._id === user?._id;
  const isOpen = reviewRequest.status === "open";

  return (
    <div className="review-detail-page">
      <Link to={`/repos/${reviewRequest.repo}/reviews`} className="back-link">&larr; All review requests</Link>

      <header className="review-detail-header">
        <div>
          <h1>Review with {reviewRequest.student.name} &amp; {reviewRequest.professor.name}</h1>
          <span className={`review-status status-${reviewRequest.status}`}>{STATUS_LABELS[reviewRequest.status]}</span>
        </div>
        {isProfessor && isOpen && (
          <div className="review-actions">
            <button className="btn btn-ghost" onClick={() => updateStatus("changes_requested")}>Request changes</button>
            <button className="btn btn-accent" onClick={() => updateStatus("approved")}>Approve</button>
          </div>
        )}
      </header>

      <ReviewThread thread={reviewRequest.thread} />

      {isOpen && <AddRoundForm onSubmit={addThreadEntry} />}
      {!isOpen && <p className="home-status">This review request is closed.</p>}
    </div>
  );
}

export default ReviewDetail;
