import { Link } from "react-router-dom";
import AttachmentCard from "./AttachmentCard.jsx";
import { initials, timeOfDay } from "../../../shared/utils/format.js";

const ROLE_LABELS = { student: "Student", professor: "Professor" };
const STATUS_LABELS = { open: "Open", approved: "Approved", changes_requested: "Changes requested" };

/** `showHeader` is false for follow-up messages from the same person, so a run of messages reads as one turn. */
function MessageBubble({ message, isOwn, showHeader = true }) {
  const role = message.sender?.role;
  const fullTime = new Date(message.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

  return (
    <article className={`msg${isOwn ? " own" : ""}${showHeader ? " first" : ""}`}>
      <span className={`avatar role-${role}${showHeader ? "" : " ghost"}`} aria-hidden="true">
        {initials(message.sender?.name)}
      </span>

      <div className="msg-main">
        {showHeader && (
          <header className="msg-head">
            <strong>{message.sender?.name || "Unknown user"}</strong>
            <span className="msg-role">{ROLE_LABELS[role]}</span>
            <time dateTime={message.createdAt}>{timeOfDay(message.createdAt)}</time>
          </header>
        )}

        <div className="msg-bubble" title={fullTime}>
          {message.reviewRequest && (
            <Link to={`/reviews/${message.reviewRequest._id}`} className="chat-review-chip">
              About a review · {STATUS_LABELS[message.reviewRequest.status]}
            </Link>
          )}
          {message.body && <p className="chat-body">{message.body}</p>}
          {message.attachment && <AttachmentCard attachment={message.attachment} />}
        </div>
      </div>
    </article>
  );
}

export default MessageBubble;
