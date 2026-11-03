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
  // CHANGE 1: only an approved request is closed; "changes_requested" still accepts a resubmission
  const isClosed = reviewRequest.status === "approved";

  return (
    <div className="review-detail-page">
      <Link to={`/repos/${reviewRequest.repo}/reviews`} className="back-link">&larr; All review requests</Link>

      <header className="review-detail-header">
        <div>
          <h1>Review with {reviewRequest.student.name} &amp; {reviewRequest.professor.name}</h1>
          <span className={`review-status status-${reviewRequest.status}`}>{STATUS_LABELS[reviewRequest.status]}</span>
        </div>
        {/* CHANGE 2: the professor keeps the buttons until the request is approved */}
        {isProfessor && !isClosed && (
          <div className="review-actions">
            <button className="btn btn-ghost" onClick={() => updateStatus("changes_requested")}>Request changes</button>
            <button className="btn btn-accent" onClick={() => updateStatus("approved")}>Approve</button>
          </div>
        )}
      </header>

      <ReviewThread thread={reviewRequest.thread} />

      {/* CHANGE 3: the upload form shows until the request is approved */}
      {!isClosed && <AddRoundForm onSubmit={addThreadEntry} />}
      {isClosed && <p className="home-status">This review request is approved and closed.</p>}
    </div>
  );
}

export default ReviewDetail;