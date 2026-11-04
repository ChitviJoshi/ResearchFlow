import { useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useChat } from "../hooks/useChat.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import MessageBubble from "../components/MessageBubble.jsx";
import MessageComposer from "../components/MessageComposer.jsx";
import "../style/chat.scss";

function Discussion() {
  const { repoId } = useParams();
  const { user } = useAuth();
  const { repo, versions, reviews, messages, loading, error, sendMessage } = useChat(repoId);
  const listRef = useRef(null);
  const stickToBottom = useRef(true);

  // Only follow new messages if the reader is already at the bottom
  const handleScroll = () => {
    const el = listRef.current;
    if (el) stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  useEffect(() => {
    const el = listRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleSend = async (formData) => {
    stickToBottom.current = true;
    await sendMessage(formData);
  };

  if (loading) return <p className="home-status">Loading discussion...</p>;
  if (error) return <p className="home-status error">{error}</p>;

  return (
    <div className="chat-page">
      <Link to={`/repos/${repoId}`} className="back-link">&larr; {repo?.name}</Link>

      <header className="chat-header">
        <h1>Discussion</h1>
        <p>Attach an experiment, image or result to a message to see where it came from.</p>
      </header>

      <div className="chat-list" ref={listRef} onScroll={handleScroll}>
        {messages.length === 0 ? (
          <p className="chat-empty">No messages yet. Say something, or check a file against this repository.</p>
        ) : (
          messages.map((m) => (
            <MessageBubble key={m._id} message={m} isOwn={m.sender?._id === user?._id} />
          ))
        )}
      </div>

      <MessageComposer versions={versions} reviews={reviews} onSend={handleSend} />
    </div>
  );
}

export default Discussion;