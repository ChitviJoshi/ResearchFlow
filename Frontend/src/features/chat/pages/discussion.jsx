import { useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { useChat } from "../hooks/useChat.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import MessageBubble from "../components/MessageBubble.jsx";
import MessageComposer from "../components/MessageComposer.jsx";
import Breadcrumbs from "../../../shared/components/Breadcrumbs.jsx";
import Skeleton from "../../../shared/components/Skeleton.jsx";
import { dayKey, dayLabel } from "../../../shared/utils/format.js";
import "../style/chat.scss";

const SAME_TURN_MS = 5 * 60 * 1000;

function Discussion() {
  const { repoId } = useParams();
  const { user } = useAuth();
  const { repo, versions, reviews, messages, loading, error, sendMessage } = useChat(repoId);
  const listRef = useRef(null);
  const stickToBottom = useRef(true);

  // Day separators, and no repeated name/avatar for follow-ups from the same person
  const items = useMemo(() => {
    const out = [];
    messages.forEach((m, i) => {
      const prev = messages[i - 1];
      const newDay = !prev || dayKey(prev.createdAt) !== dayKey(m.createdAt);
      if (newDay) out.push({ kind: "day", key: `day-${m._id}`, label: dayLabel(m.createdAt) });
      const sameTurn =
        !newDay &&
        prev.sender?._id === m.sender?._id &&
        new Date(m.createdAt) - new Date(prev.createdAt) < SAME_TURN_MS;
      out.push({ kind: "msg", key: m._id, message: m, showHeader: !sameTurn });
    });
    return out;
  }, [messages]);

  // Only follow new messages if the reader is already at the bottom
  const handleScroll = () => {
    const el = listRef.current;
    if (el) stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  useEffect(() => {
    const el = listRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [items]);

  const handleSend = async (formData) => {
    stickToBottom.current = true;
    await sendMessage(formData);
  };

  if (loading) return <div className="page"><Skeleton count={5} /></div>;
  if (error) return <div className="page"><p className="home-status error">{error}</p></div>;

  return (
    <div className="chat-page">
      <div className="chat-top">
        <Breadcrumbs
          items={[
            { label: "Repositories", to: "/" },
            { label: repo?.name?.trim() || "Repository", to: `/repos/${repoId}` },
            { label: "Discussion" },
          ]}
        />
        <p className="chat-hint">Attach an experiment, image or result to see where it came from.</p>
      </div>

      <div className="chat-list" ref={listRef} onScroll={handleScroll}>
        {items.length === 0 ? (
          <p className="chat-empty">No messages yet. Say something, or check a file against this repository.</p>
        ) : (
          items.map((item) =>
            item.kind === "day" ? (
              <div key={item.key} className="day-sep" role="separator"><span>{item.label}</span></div>
            ) : (
              <MessageBubble
                key={item.key}
                message={item.message}
                isOwn={item.message.sender?._id === user?._id}
                showHeader={item.showHeader}
              />
            )
          )
        )}
      </div>

      <MessageComposer versions={versions} reviews={reviews} onSend={handleSend} />
    </div>
  );
}

export default Discussion;
