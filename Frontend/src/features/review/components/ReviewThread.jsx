import ThreadEntry from "./ThreadEntry.jsx";

function ReviewThread({ thread }) {
  return (
    <div className="review-thread">
      {thread.map((entry) => (
        <ThreadEntry key={entry._id} entry={entry} />
      ))}
    </div>
  );
}

export default ReviewThread;