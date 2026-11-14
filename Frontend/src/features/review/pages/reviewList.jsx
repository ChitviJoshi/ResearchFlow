import { useState } from "react";
import { useParams } from "react-router-dom";
import { useReviewList } from "../hooks/useReviewList.js";
import ReviewCard from "../components/ReviewCard.jsx";
import CreateReviewModal from "../components/CreateReviewModal.jsx";
import Breadcrumbs from "../../../shared/components/Breadcrumbs.jsx";
import Skeleton from "../../../shared/components/Skeleton.jsx";
import { Icon } from "../../../shared/components/icons.jsx";
import "../style/review.scss";

function ReviewList() {
  const { repoId } = useParams();
  const { reviews, repo, paperVersions, loading, error, createReviewRequest } = useReviewList(repoId);
  const [modalOpen, setModalOpen] = useState(false);

  if (loading) return <div className="page"><Skeleton count={4} /></div>;
  if (error) return <div className="page"><p className="home-status error">{error}</p></div>;

  const approved = reviews.filter((r) => r.status === "approved").length;
  const waiting = reviews.length - approved;

  return (
    <div className="page">
      <Breadcrumbs
        items={[
          { label: "Repositories", to: "/" },
          { label: repo?.name?.trim() || "Repository", to: `/repos/${repoId}` },
          { label: "Reviews" },
        ]}
      />

      <header className="page-head">
        <div>
          <p className="eyebrow">Peer review</p>
          <h1>Review requests</h1>
          {reviews.length > 0 && (
            <p className="page-sub">{waiting} in progress · {approved} approved</p>
          )}
        </div>
        <button className="btn btn-accent" onClick={() => setModalOpen(true)}>
          <Icon name="plus" size={16} /> New review request
        </button>
      </header>

      {reviews.length === 0 ? (
        <div className="empty-state">
          <h2>No review requests yet</h2>
          <p>Upload a paper draft, then ask a collaborating professor to review it. Each round of feedback stays in one thread.</p>
        </div>
      ) : (
        <ul className="review-list">
          {reviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </ul>
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
