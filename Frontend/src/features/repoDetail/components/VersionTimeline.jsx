import VersionCard from "./VersionCard.jsx";

function VersionTimeline({ versions }) {
  if (versions.length === 0) {
    return <p className="home-status">No versions uploaded yet.</p>;
  }

  return (
    <div className="version-timeline">
      {versions.map((version) => (
        <VersionCard key={version._id} version={version} />
      ))}
    </div>
  );
}

export default VersionTimeline;