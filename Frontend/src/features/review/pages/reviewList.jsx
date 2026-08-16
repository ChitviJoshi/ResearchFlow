// List of review requests for a repo (open / approved / changes requested)
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useReviewList } from "../hooks/useReviewList.js";
import ReviewCard from "../components/ReviewCard.jsx";
import CreateReviewModal from "../components/CreateReviewModal.jsx";
import "../style/review.scss";

function ReviewList() {
  const { repoId } = useParams();
  const { reviews, repo, paperVersions, loading, error, createReviewRequest } = useReviewList(repoId);
  const [modalOpen, setModalOpen] = useState(false);

  if (loading) return <p className="home-status">Loading review requests...</p>;
  if (error) return <p className="home-status error">{error}</p>;

  return (
    <div className="review-list-page">
      <Link to={`/repos/${repoId}`} className="back-link">&larr; {repo?.name}</Link>

      <header className="review-list-header">
        <h1>Review requests</h1>
        <button className="btn btn-accent" onClick={() => setModalOpen(true)}>New review request</button>
      </header>

      {reviews.length === 0 ? (
        <p className="home-status">No review requests yet.</p>
      ) : (
        <div className="review-grid">
          {reviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </div>
      )}

      <CreateReviewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={createReviewRequest}
        repo={repo}
        paperVersions={paperVersions}
      />
    </div>
  );
}

export default ReviewList;