/** Placeholder rows shown while data loads, so the page does not jump when it arrives. */
function Skeleton({ count = 4 }) {
  return (
    <div className="skeleton-wrap" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-item" key={i}>
          <span className="skeleton skeleton-dot" />
          <span className="skeleton-lines">
            <span className="skeleton skeleton-line" />
            <span className="skeleton skeleton-line short" />
          </span>
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
