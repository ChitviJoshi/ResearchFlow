import ThreadEntry from "./ThreadEntry.jsx";

/** The rounds of a review as a timeline. `children` becomes the last "next step" entry. */
function ReviewThread({ thread, names = {}, children }) {
  return (
    <ol className="rounds">
      {thread.map((entry) => (
        <ThreadEntry key={entry._id} entry={entry} who={names[entry.uploadedByRole]} />
      ))}
      {children}
    </ol>
  );
}

export default ReviewThread;
