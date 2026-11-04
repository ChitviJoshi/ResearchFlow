import { Link } from "react-router-dom";
import AttachmentCard from "./AttachmentCard.jsx";

const ROLE_LABELS = { student: "Student", professor: "Professor" };
const STATUS_LABELS = { open: "Open", approved: "Approved", changes_requested: "Changes requested" };

function MessageBubble({ message, isOwn }) {
  const when = new Date(message.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

  return (
    <article className={`chat-message${isOwn ? " own" : ""}`}>
      <div className="chat-message-head">
        <strong>{message.sender?.name || "Unknown user"}</strong>
        <span>{ROLE_LABELS[message.sender?.role]}</span>
        <span>{when}</span>
      </div>

      {message.reviewRequest && (
        <Link to={`/reviews/${message.reviewRequest._id}`} className="chat-review-chip">
          About a review ({STATUS_LABELS[message.reviewRequest.status]})
        </Link>
      )}

      {message.body && <p className="chat-body">{message.body}</p>}
      {message.attachment && <AttachmentCard attachment={message.attachment} />}
    </article>
  );
}

export default MessageBubble;