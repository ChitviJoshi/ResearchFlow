// Single review request: thread of student uploads + professor annotated re-uploads,
// status control (approve / request changes) for the professor
import { useParams } from "react-router-dom";
import { useReviewDetail } from "../hooks/useReviewDetail.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import ReviewThread from "../components/ReviewThread.jsx";
import AddRoundForm from "../components/AddRoundForm.jsx";
import StatusPill from "../components/StatusPill.jsx";
import Breadcrumbs from "../../../shared/components/Breadcrumbs.jsx";
import Skeleton from "../../../shared/components/Skeleton.jsx";
import { Icon } from "../../../shared/components/icons.jsx";
import { initials } from "../../../shared/utils/format.js";
import "../style/review.scss";

function ReviewDetail() {
  const { reviewId } = useParams();
  const { user } = useAuth();
  const { reviewRequest, loading, error, addThreadEntry, updateStatus } = useReviewDetail(reviewId);

  if (loading) return <div className="page"><Skeleton count={4} /></div>;
  if (error) return <div className="page"><p className="home-status error">{error}</p></div>;
  if (!reviewRequest) return null;

  const isProfessor = reviewRequest.professor._id === user?._id;
  // only an approved request is closed; "changes_requested" still accepts a resubmission
  const isClosed = reviewRequest.status === "approved";
  const draftName = reviewRequest.thread[0]?.version?.fileName || "Paper review";
  const hasFeedback =
    reviewRequest.status !== "open" || reviewRequest.thread.some((t) => t.uploadedByRole === "professor");

  const steps = [
    { label: "Draft submitted", done: true },
    { label: "Professor feedback", done: hasFeedback },
    { label: "Approved", done: isClosed },
  ];
  const currentStep = steps.findIndex((s) => !s.done);

  return (
    <div className="page">
      <Breadcrumbs
        items={[
          { label: "Repositories", to: "/" },
          { label: "Reviews", to: `/repos/${reviewRequest.repo}/reviews` },
          { label: draftName },
        ]}
      />

      <header className="review-head">
        <div className="review-head-main">
          <p className="eyebrow">Review request</p>
          <h1>{draftName}</h1>
          <div className="review-who">
            <span className="avatar sm role-student" aria-hidden="true">{initials(reviewRequest.student.name)}</span>
            <span>{reviewRequest.student.name}</span>
            <Icon name="arrow" size={14} />
            <span className="avatar sm role-professor" aria-hidden="true">{initials(reviewRequest.professor.name)}</span>
            <span>{reviewRequest.professor.name}</span>
            <StatusPill status={reviewRequest.status} />
          </div>
        </div>

        {isProfessor && !isClosed && (
          <div className="review-actions">
            <button className="btn btn-ghost" onClick={() => updateStatus("changes_requested")}>
              <Icon name="alert" size={15} /> Request changes
            </button>
            <button className="btn btn-accent" onClick={() => updateStatus("approved")}>
              <Icon name="check" size={15} /> Approve
            </button>
          </div>
        )}
      </header>

      <ol className="stepper" aria-label="Review progress">
        {steps.map((s, i) => (
          <li
            key={s.label}
            className={`step${s.done ? " done" : ""}${i === currentStep ? " current" : ""}`}
            aria-current={i === currentStep ? "step" : undefined}
          >
            <span className="step-dot">{s.done ? <Icon name="check" size={13} strokeWidth={2.4} /> : i + 1}</span>
            <span className="step-label">{s.label}</span>
          </li>
        ))}
      </ol>

      <h2 className="section-title rounds-title">Rounds</h2>

      <ReviewThread
        thread={reviewRequest.thread}
        names={{ student: reviewRequest.student.name, professor: reviewRequest.professor.name }}
      >
        {isClosed ? (
          <li className="round round-next round-closed">
            <span className="round-node" aria-hidden="true"><Icon name="check" size={16} strokeWidth={2.2} /></span>
            <div className="round-body">
              <p className="round-closed-text">Approved. This review request is closed.</p>
            </div>
          </li>
        ) : (
          <li className="round round-next">
            <span className="round-node" aria-hidden="true"><Icon name="plus" size={16} /></span>
            <div className="round-body">
              <AddRoundForm onSubmit={addThreadEntry} />
            </div>
          </li>
        )}
      </ReviewThread>
    </div>
  );
}

export default ReviewDetail;
